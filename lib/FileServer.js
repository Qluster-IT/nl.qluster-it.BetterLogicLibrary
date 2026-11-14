const http = require('http');
const { pipeline } = require('stream/promises');
const { Writable } = require('stream');
const { Defer, BL } = require('betterlogiclibrary/src/bl');
const { randomBytes } = require('crypto');
const sanitize = require("sanitize-filename");
const { createWriteStream, existsSync, mkdirSync, rmSync, unlinkSync, readdirSync, statSync, readFileSync, openSync, readSync, closeSync, writeFileSync } = require("fs");

const BAD_REQUEST = 400;

class FileServer {
  //static client;

  async destroy() {
    return await this.close();
  }

  async close() {
    if (this.closing) return this.closing;
    this.closing = (async () => {
      const errors = [];
      for (const token of Object.keys(this.files || {})) {
        try {
          this.removeFile(token);
        } catch (error) {
          errors.push(error);
        }
      }
      if (this.transfers) for (const controller of this.transfers) controller.abort(new Error('File server closed'));
      const server = this.server;
      this.server = null;
      if (server) {
        this.homey.log('shutdown file server');
        try {
          await new Promise((resolve, reject) => {
            server.close(error => error && error.code !== 'ERR_SERVER_NOT_RUNNING' ? reject(error) : resolve());
          });
        } catch (error) {
          errors.push(error);
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
    const directory = `/userdata/getfile/${file.token}/`;
    if (existsSync(directory)) rmSync(directory, { recursive: true, force: true });
  }

  async init({ homey, settings: { port, autoStart, autoShutdown, fileAvailableDuration } } = {}) {
    this.homey = homey;
    this.ip = (await this.homey.cloud.getLocalAddress()).split(':')[0];
    this.ipDashed = this.ip.replaceAll('.', '-');
    this.cloudId = (await this.homey.cloud.getHomeyId());
    this.port = port;
    this.files = {};
    this.transfers = new Set();
    this.autoStart = autoStart;
    this.autoShutdown = autoShutdown;
    this.fileAvailableDuration = fileAvailableDuration || 60;
    if (autoStart) await this.initServer();
    return this;
  }

  async initServer() {
    try {
      if (this.closing) await this.closing;
      this.homey.log('startup file server');
      if (this.server) await this.close();
      const homey = this.homey;
      const transfers = this.transfers;
      this.server = http.createServer((async (req, res) => {
        if (!req.headers || !req.headers.host || req.headers.host != this.ip + ':' + this.port) return returnStatus();

        let contentType = req.headers.accept && req.headers.accept !== '*/*' ? req.headers.accept : 'application/json';

        if (req.url.toLowerCase().startsWith('/getfile/')) {
          let url = req.url.substring('/getfile/'.length);
          const token = url.substring(0, url.indexOf('/'));
          const filename = decodeURIComponent(url.substring(token.length + 1));
          this.homey.log('token', token, 'id', filename);
          try {
            if (token && this.files[token]) {
              if (this.files[token].base64 === undefined && req.method == 'POST') {
                const file = this.files[token];
                if (file.uploadController) throw new Error('An upload is already in progress for this file');
                const ready = file.defer = new Defer();
                try {
                  await writeBody(file);
                } finally {
                  ready.resolve();
                }
                return returnStatus();
              }
              if (this.files[token] && this.files[token].defer) await this.files[token].defer.promise;
              if (this.files[token].base64 !== undefined)
                return returnBinary(Buffer.from(this.files[token].base64, 'base64'), this.files[token].contentType);
              if (this.files[token].buffer !== undefined)
                return returnBinary(this.files[token].buffer, this.files[token].contentType);
              if (this.files[token].text !== undefined)
                return returnText(this.files[token].text, this.files[token].contentType);
            }
            let body = await getBody();
            this.homey.log('body', body);
            return returnBinary(Buffer.from(body.base64, 'base64'));
          } catch (error) {

            this.homey.error('return file', error);
            return returnStatus(BAD_REQUEST, error);
          }

        } else return returnStatus();



        returnStatus();


        async function writeBody(file) {
          if (!(existsSync(`/userdata/getfile/${file.token}/`))) mkdirSync(`/userdata/getfile/${file.token}/`, { recursive: true });
          await transferBody(createWriteStream(`/userdata/getfile/${file.token}/${file.filename}`), file);
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
          let type = req.headers['content-type'];
          await transferBody(new Writable({
            decodeStrings: false,
            write(chunk, encoding, callback) { data += chunk; callback(); }
          }));
          if (type === 'text/json') {
            try {
              return JSON.parse(data);
            } catch (error) {
              throw new Error('Received invalid JSON.', { cause: error });
            }
          }
          if (type === 'base64') return Buffer.from(data, 'base64');
          return data;
        }

        function returnBinary(binary, _contentType) {
          res.writeHead(200, { 'content-type': _contentType || contentType });
          // res.write(binary, 'binary', ()=> {

          //   res.end(null, 'binary');
          //   //res.end(null);
          // });
          //res.end(null, 'binary');
          res.end(binary);//, 'binary');
        }
        function returnText(text, _contentType) {
          res.writeHead(200, { 'content-type': _contentType || contentType });
          res.write(text);
          res.end(null);
        }




        function returnStatus(code = 200, status = "ok") {
          res.writeHead(code, {
            'Content-Type': 'application/json'
          });
          res.end(JSON.stringify({
            status: status
          }));
        }

      }).bind(this)).listen(this.port);//, this.ip);


      this.server.on('error', (error) => {
        this.homey.error(error);
      });
    } catch (error) {
      this.homey.error(error);
      throw error;
    }
    return true;
  }

  async writeFile(file) {
    if (!(existsSync(`/userdata/getfile/${file.token}/`))) mkdirSync(`/userdata/getfile/${file.token}/`, { recursive: true });
    try {

      writeFileSync(`/userdata/getfile/${file.token}/${file.filename}`, file.buffer);
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
    if (!this.server) await this.initServer();

    // Refresh IP data for non-fixed-IPs before the link (and its upload host) is built.
    this.ip = (await this.homey.cloud.getLocalAddress()).split(':')[0];
    this.ipDashed = this.ip.replaceAll('.', '-');
    this.cloudId = (await this.homey.cloud.getHomeyId());

    let token = randomBytes(24).toString('hex');
    this.files[token] = { base64, contentType, token };
    this.files[token].timeout = this.homey.setTimeout(async () => {
      try {
        try {
          this.removeFile(token);
        } finally {
          if (Object.keys(this.files).length === 0 && this.autoShutdown) await this.close();
        }
      } catch (error) {
        this.homey.error('FileServer expiry', error);
      }
    }, this.fileAvailableDuration * 1000);

    if (filename) filename = sanitize(filename);
    else filename = '';
    this.files[token].filename = filename;


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