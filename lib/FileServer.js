const http = require('http');
const { pipeline } = require('stream/promises');
const { mkdir, rename, rm } = require('fs/promises');
const { Writable } = require('stream');
const { Defer } = require('betterlogiclibrary/src/bl');
const { randomBytes } = require('crypto');
const sanitize = require("sanitize-filename");
const { createWriteStream, existsSync, mkdirSync, writeFileSync } = require("fs");

const BAD_REQUEST = 400;

class FileServer {
  //static client;

  async destroy() {
    return await this.close();
  }

  async close() {
    if (this.closing) return this.closing;
    this.closing = (async () => {
      if (this.starting) await this.starting.catch(() => {});
      const errors = [];
      for (const token of Object.keys(this.files || {})) this.removeFile(token);
      const removals = Promise.allSettled(this.removals || []);
      if (this.transfers) for (const controller of this.transfers) controller.abort(new Error('File server closed'));
      const server = this.server;
      this.server = null;
      if (server) {
        this.homey.log('shutdown file server');
        try {
          await new Promise((resolve, reject) => {
            server.close(error => error && error.code !== 'ERR_SERVER_NOT_RUNNING' ? reject(error) : resolve());
            if (server.closeIdleConnections) server.closeIdleConnections();
          });
        } catch (error) {
          errors.push(error);
        }
        for (const result of await removals) {
          if (result.status === 'rejected') errors.push(result.reason);
        }
      }
      if (errors.length) throw new AggregateError(errors, 'Could not completely close the file server');
    })();
    try {
      await this.closing;
    } finally {
      this.closing = null;
    }
  }

  removeFile(token) {
    const file = this.files[token];
    if (!file) return;
    delete this.files[token];
    if (file.timeout) this.homey.clearTimeout(file.timeout);
    if (file.uploadController) file.uploadController.abort(new Error('File is no longer available'));
    if (file.defer) file.defer.resolve();
    if (!file.uploadPromise && !file.hasDirectory) return;
    const cleanup = (async () => {
      // On platforms that lock open files, delete only after the writer and any rename settle.
      if (file.uploadPromise) await file.uploadPromise.catch(() => {});
      await rm(`/userdata/getfile/${file.token}/`, { recursive: true, force: true });
    })();
    this.removals.add(cleanup);
    const settled = () => this.removals.delete(cleanup);
    cleanup.then(settled, settled);
    return cleanup;
  }

  async init({ homey, settings: { port, autoStart, autoShutdown, fileAvailableDuration } } = {}) {
    this.homey = homey;
    this.ip = (await this.homey.cloud.getLocalAddress()).split(':')[0];
    this.ipDashed = this.ip.replaceAll('.', '-');
    this.cloudId = (await this.homey.cloud.getHomeyId());
    this.port = port;
    this.files = {};
    this.transfers = new Set();
    this.removals = new Set();
    this.autoStart = autoStart;
    this.autoShutdown = autoShutdown;
    this.fileAvailableDuration = fileAvailableDuration || 60;
    if (autoStart) await this.initServer();
    return this;
  }

  async initServer() {
    while (this.closing) await this.closing;
    if (this.server) return true;
    if (!this.starting) this.starting = this.listen();
    try {
      await this.starting;
    } finally {
      this.starting = null;
    }
    return true;
  }

  async listen() {
    this.homey.log('startup file server');
    const server = http.createServer((req, res) => this.handleRequest(req, res));
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(this.port, () => {
        server.removeListener('error', reject);
        resolve();
      });
    });
    server.on('error', error => this.homey.error('File server error', error.code));
    this.server = server;
  }

  async handleRequest(req, res) {
    const { homey, transfers, files } = this;
    if (this.closing) return badRequest();
    if (req.headers.host !== this.ip + ':' + this.port) return returnStatus();
    if (!req.url.toLowerCase().startsWith('/getfile/')) return returnStatus();

    const contentType = req.headers.accept && req.headers.accept !== '*/*' ? req.headers.accept : 'application/json';
    const path = req.url.substring('/getfile/'.length);
    const separator = path.indexOf('/');
    const token = separator < 0 ? '' : path.substring(0, separator);
    const file = Object.prototype.hasOwnProperty.call(files, token) ? files[token] : undefined;
    try {
      if (file) {
        if (file.base64 === undefined && req.method === 'POST') {
          if (file.uploadPromise) return badRequest();
          const ready = file.defer = new Defer();
          file.uploadPromise = writeBody(file);
          try {
            await file.uploadPromise;
          } finally {
            delete file.uploadPromise;
            ready.resolve();
          }
          return returnStatus();
        }
        if (file.base64 !== undefined) return returnBinary(Buffer.from(file.base64, 'base64'), file.contentType);
        if (file.buffer !== undefined) return returnBinary(file.buffer, file.contentType);
        if (file.text !== undefined) return returnBinary(file.text, file.contentType);
        // Uploaded files are served by Homey's userdata URLs, not this listener.
        if (req.method === 'GET' || req.method === 'HEAD') return badRequest();
      }
      if (req.headers['content-type'] !== 'text/json') return badRequest();
      const body = await getBody();
      return returnBinary(Buffer.from(body.base64, 'base64'));
    } catch (error) {
      // Filesystem errors can include the token and filename in their paths.
      homey.error('File request failed', typeof error.code === 'string' ? error.code : error.name);
      if (res.headersSent || res.destroyed) return res.destroy();
      return badRequest();
    }

    async function writeBody(file) {
      const directory = `/userdata/getfile/${file.token}/`;
      const destination = directory + file.filename;
      const partial = destination + '.partial';
      file.hasDirectory = true;
      try {
        await mkdir(directory, { recursive: true });
        if (files[token] !== file) throw new Error('File is no longer available');
        await transferBody(createWriteStream(partial), file);
        if (files[token] !== file) throw new Error('File is no longer available');
        await rename(partial, destination);
        if (files[token] !== file) throw new Error('File is no longer available');
      } catch (error) {
        await rm(partial, { force: true });
        throw error;
      }
    }

    async function transferBody(destination, file) {
      const socket = req.socket;
      const controller = new AbortController();
      transfers.add(controller);
      if (file) file.uploadController = controller;
      const timeout = homey.setTimeout(() => controller.abort(new Error('File request timed out')), 60 * 1000);
      try {
        await pipeline(req, destination, { signal: controller.signal });
      } catch (error) {
        // An incomplete request can otherwise keep server shutdown pending.
        if (!req.complete) socket.destroy();
        throw error;
      } finally {
        homey.clearTimeout(timeout);
        transfers.delete(controller);
        if (file) delete file.uploadController;
      }
    }

    async function getBody() {
      req.setEncoding('utf8');
      let data = '';
      await transferBody(new Writable({
        decodeStrings: false,
        write(chunk, encoding, callback) { data += chunk; callback(); }
      }));
      return JSON.parse(data);
    }

    function returnBinary(binary, _contentType) {
      res.writeHead(200, { 'content-type': _contentType || contentType });
      res.end(binary);
    }

    function badRequest() {
      if (!req.complete) res.setHeader('Connection', 'close');
      return returnStatus(BAD_REQUEST, {});
    }

    function returnStatus(code = 200, status = 'ok') {
      res.writeHead(code, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status }));
    }
  }

  async writeFile(file) {
    const directory = `/userdata/getfile/${file.token}/`;
    if (!existsSync(directory)) mkdirSync(directory, { recursive: true });
    if (this.files[file.token]) this.files[file.token].hasDirectory = true;
    try {

      writeFileSync(directory + file.filename, file.buffer);
      //let a = 'asdsad';
    } catch (error) {
      //let b = error;
    }
  }

  async update({ port, autoStart, autoShutdown, fileAvailableDuration }) {

    if (port !== this.port) {
      await this.close();
      this.port = port;
    }
    this.autoStart = autoStart;
    this.autoShutdown = autoShutdown;
    this.fileAvailableDuration = fileAvailableDuration;

    if (autoStart && !this.server) await this.initServer();
    if (autoShutdown && this.server && Object.keys(this.files).length === 0) await this.close();
  }

  async getDownloadUrl({ base64, contentType, filename } = {}) {
    // Refresh IP data for non-fixed-IPs before the link (and its upload host) is built.
    const ip = (await this.homey.cloud.getLocalAddress()).split(':')[0];
    if (filename) filename = sanitize(filename);
    else filename = '';
    while (!this.server || this.closing) await this.initServer();
    this.ip = ip;
    this.ipDashed = ip.replaceAll('.', '-');

    let token = randomBytes(24).toString('hex');
    this.files[token] = { base64, contentType, token, filename };
    this.files[token].timeout = this.homey.setTimeout(async () => {
      try {
        try {
          await this.removeFile(token);
        } finally {
          if (Object.keys(this.files).length === 0 && this.autoShutdown) await this.close();
        }
      } catch (error) {
        this.homey.error('FileServer expiry', error.code || error.name);
      }
    }, this.fileAvailableDuration * 1000);

    let path = `/getfile/${token}/`;
    let result = { url: `http://${this.ip}:${this.port}${path}`, path, host: this.ip, port: this.port, filename, token, contentType };
    let app = 'app/net.i-dev.betterlogic';

    let url = app + '/userdata' + path;

    result.localTestUrl = `https://${this.ipDashed}.homey.homeylocal.com/${app}/assets/space.txt`;
    result.localUrl = `https://${this.ipDashed}.homey.homeylocal.com/${url}${filename}`;
    result.cloudUrl = `https://${this.cloudId}.connect.athom.com/${url}${filename}`;


    // if (useUrl==='localssl') url = `https://${this.homey.app.ip.replaceAll('.', '-')}.homey.homeylocal.com/` + url;
    //         else if  (useUrl==='cloudssl') url = `https://${this.homey.app.cloudId}.connect.athom.com/` + url;
    return result;
  }
}

module.exports = FileServer;