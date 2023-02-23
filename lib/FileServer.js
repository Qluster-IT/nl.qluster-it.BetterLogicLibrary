const http = require('http');
const { Defer } = require('betterlogiclibrary/src/bl');
const { randomBytes } = require('crypto');

const BAD_REQUEST = 400;

class FileServer {
  //static client;

  async destroy() {
    return await this.close();
  }

  async close() {
    if (this.server) this.server.close(((err) => {
      if (!err);
      this.server = null;
    }).bind(this));
  }

  async init({ homey }) {
    this.homey = homey;
    this.ip = (await this.homey.cloud.getLocalAddress()).split(':')[0];
    this.port = 47335;
    this.files = {};
    try {

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
              if (!this.files[token].base64 && req.method == 'POST') {
                this.files[token].defer = new Defer();
                this.files[token].buffer = await getBody();
                this.files[token].defer.resolve();
                return returnStatus();
              }
              if(this.files[token] && this.files[token].defer) await this.files[token].defer.promise;
              if (this.files[token].base64)
                return returnBinary(Buffer.from(this.files[token].base64, 'base64'), this.files[token].contentType);
              if (this.files[token].buffer)
                return returnBinary(this.files[token].buffer, this.files[token].contentType);
            }
            let body = await getBody();
            homey.log('body', body);
            return returnBinary(Buffer.from(body.base64, 'base64'));
          } catch (error) {
            
            homey.error(error);
            if (token && this.files[token]) this.files[token].defer.resolve();
            return returnStatus(BAD_REQUEST, error);
          }

        } else return returnStatus();



        returnStatus();

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
              if (bin && bin.length>0)
                defer.resolve(Buffer.concat(bin));
              else if (type == 'text/json')
                defer.resolve(JSON.parse(data));
              else if (type == 'text/plain')
                defer.resolve(data);
              else if (type == 'base64')
                defer.resolve(Buffer.from(data, 'base64'));
            } catch (error) {
              defer.reject('Received invalid JSON.');
            }
          });
          return defer.promise;
        }

        function returnBinary(binary, _contentType) {
          res.writeHead(200, { 'content-type': _contentType || contentType });
          res.write(binary, 'binary');
          res.end(null, 'binary');
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
        homey.error(error);
      });
    } catch (error) {
      this.homey.error(error);
    }

    return this;
  }

  async getDownloadUrl({ base64, contentType } = {}) {
    let code = randomBytes(24).toString('hex');
    if (base64 || contentType) {
      this.files[code] = { base64, contentType };
      this.homey.setTimeout(() => {
        delete this.files[code];
      }, 60 * 1000);
    }
    let path = `/getfile/${code}/`;
    return { url: `http://${this.ip}:${this.port}${path}`, path };

  }
}

module.exports = FileServer;