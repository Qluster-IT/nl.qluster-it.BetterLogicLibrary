const http = require('http');
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
    try {

      if (this.server) this.homey.log('shutdown file server');

      if (this.server) this.server.close(((err) => {
        if (!err);
        this.server = null;
      }).bind(this));
    } catch (error) {

    }
    if (this.files && Object.keys(this.files).length)
      for (const key in this.files) {
        if (Object.hasOwnProperty.call(this.files, key)) {
          const file = this.files[key];
          try {
            if ((existsSync(`/userdata/getfile/${file.token}/`))) rmSync(`/userdata/getfile/${file.token}/`, { recursive: true, force: true });
          } catch (error) {
            let a = error;
          }
        }
      }
  }

  async init({ homey, settings: { port, autoStart, autoShutdown, fileAvailableDuration } } = {}) {
    this.homey = homey;
    this.ip = (await this.homey.cloud.getLocalAddress()).split(':')[0];
    this.ipDashed = this.ip.replaceAll('.', '-');
    this.cloudId = (await this.homey.cloud.getHomeyId());
    this.port = port;
    this.files = {};
    this.autoStart = autoStart;
    this.autoShutdown = autoShutdown;
    this.fileAvailableDuration = fileAvailableDuration || 60;
    if (autoStart) await this.initServer();
    return this;
  }

  async initServer() {
    try {
      this.homey.log('startup file server');
      if (this.server) await this.close();
      this.server = http.createServer((async (req, res) => {
        if (!req.headers || !req.headers.host || req.headers.host != this.ip + ':' + this.port) returnStatus();

        let contentType = req.headers.accept && req.headers.accept !== '*/*' ? req.headers.accept : 'application/json';

        if (req.url.toLowerCase().startsWith('/getfile/')) {
          let url = req.url.substring('/getfile/'.length);
          const token = url.substring(0, url.indexOf('/'));
          const filename = decodeURIComponent(url.substring(token.length + 1));
          this.homey.log('token', token, 'id', filename);
          try {
            if (token && this.files[token]) {
              if (this.files[token].base64 === undefined && req.method == 'POST') {
                this.files[token].defer = new Defer();

                //let body = 
                await writeBody(this.files[token]);
                //let body = await getBody();

                // this.files[token].buffer = body;
                // await this.writeFile(this.files[token]);
                if (this.files[token] && this.files[token].defer) await this.files[token].defer.resolve();
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
            if (token && this.files[token] && this.files[token].defer) {
              this.files[token].defer.resolve();
            }
            return returnStatus(BAD_REQUEST, error);
          }

        } else return returnStatus();



        returnStatus();


        async function writeBody(file) {
          let defer = new Defer(60 * 1000);
          let data = '';
          let bin = [];
          let type = req.headers['content-type'];
          if (!(existsSync(`/userdata/getfile/${file.token}/`))) mkdirSync(`/userdata/getfile/${file.token}/`, { recursive: true });
          try {
            //writeFileSync(`/userdata/getfile/${file.token}/${file.filename}`, file.buffer);
            req.setEncoding('binary');
            req.pipe(createWriteStream(`/userdata/getfile/${file.token}/${file.filename}`, {encoding:'binary'}));//

          } catch (ex) {
            BL.homey.error('writeBody', ex);
           }
          //req.setEncoding('utf8');          
          //req.pipe(createWriteStream(`/userdata/getfile/${file.token}/${file.filename}`));//, {encoding:'utf8'}));

          // req.on('data', function (_data) {
          //   if (typeof (_data) == 'string') data += _data;
          //   else bin.push(_data);
          // });
          // req.on('end', function () {
          //   try {
          //     if (bin && bin.length > 0)
          //       defer.resolve(Buffer.concat(bin));
          //     else if (type == 'text/json')
          //       defer.resolve(JSON.parse(data));
          //     else if (type == 'text/plain') {
          //       BL.homey.log('received length', data.length);
          //       writeFileSync(`/userdata/getfile/${file.token}/${file.filename}`, data, {encoding:'utf8'});
          //       defer.resolve(data);
          //     }
          //     else if (type == 'base64')
          //       defer.resolve(Buffer.from(data, 'base64'));
          //     else defer.resolve(data);
          //   } catch (error) {
          //     defer.reject('Received invalid JSON.');
          //   }
          // });

          // req.on('data', function (_data) {
          //   if (typeof (_data) == 'string') data += _data;
          //   else bin.push(_data);
          // });
          req.on('end', function (err) {
            defer.resolve();
            try {

            } catch (error) {
              defer.reject('Received invalid File.');
            }
          });
          req.on('error', function () {
            defer.reject('Error receiving File.');
          });
          return defer.promise;
        }


        async function getBody() {
          let defer = new Defer(60 * 1000);
          req.setEncoding('utf8');
          let data = '';
          let bin = [];
          let type = req.headers['content-type'];
          req.on('data', function (_data) {
            if (typeof (_data) == 'string') data += _data;
            else bin.push(_data);
          });
          req.on('end', function () {
            try {
              if (bin && bin.length > 0)
                defer.resolve(Buffer.concat(bin));
              else if (type == 'text/json')
                defer.resolve(JSON.parse(data));
              else if (type == 'text/plain')
                defer.resolve(data);
              else if (type == 'base64')
                defer.resolve(Buffer.from(data, 'base64'));
              else defer.resolve(data);
            } catch (error) {
              defer.reject('Received invalid JSON.');
            }
          });
          return defer.promise;
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
    if (autoShutdown && this.server && !this.files.length) await this.close();
  }

  async getDownloadUrl({ base64, contentType, filename } = {}) {
    if (!this.server) await this.initServer();

    let token = randomBytes(24).toString('hex');
    if (base64 || contentType) {
      this.files[token] = { base64, contentType, token };
      this.homey.setTimeout(async () => {
        try {
          if ((existsSync(`/userdata/getfile/${this.files[token].token}/`))) rmSync(`/userdata/getfile/${this.files[token].token}/`, { recursive: true, force: true });
        } catch (error) {

        }
        if (this.files[token] && this.files[token].defer) BL.clearObj(this.files[token].defer);
        BL.clearObj(this.files[token]);
        delete this.files[token];
        if (!this.files.length && this.autoShutdown) await this.close();
      }, this.fileAvailableDuration * 1000);
    }

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