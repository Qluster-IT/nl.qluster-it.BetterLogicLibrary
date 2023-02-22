const http = require('http');
const { Defer } = require('betterlogiclibrary/src/bl');
const { randomBytes } = require('crypto');

const BAD_REQUEST = 400;

class FileServer {
  //static client;

  async destroy() {
    return this.close();
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

      this.server = http.createServer((async function (req, res) {
        if (!req.headers || !req.headers.host || req.headers.host != this.ip + ':'+this.port) returnStatus();

        let contentType = req.headers.accept && req.headers.accept !== '*/*' ? req.headers.accept : 'text/plain';

        if (req.url.toLowerCase().startsWith('/getfile/')) {
          let url = req.url.substring('/getfile/'.length);
          const token = url.substring(0, url.indexOf('/'));
          const filename = decodeURIComponent(url.substring(token.length + 1));
          this.homey.log('token', token, 'id', filename);
          try {
            if(token && this.files[token]) {
              return returnBinary(Buffer.from(this.files[token].base64, 'base64'));
            }
            let body = await getBody();
            homey.log('body', body);
            return returnBinary(Buffer.from(body.base64, 'base64'));
          } catch (error) {
            homey.error(error);
            return returnStatus(BAD_REQUEST, error);
          }

        } else return returnStatus();



        returnStatus();

        async function getBody() {
          let defer = new Defer(60 * 1000);
          req.setEncoding('utf8');
          let data ='';
          req.on('data', function (_data) {
            data+=_data;
          });
          req.on('end', function () {
            try {
              defer.resolve(data ? JSON.parse(data) : undefined);
            } catch (error) {
              defer.reject('Received invalid JSON.');
            }
          });
          return defer.promise;
        }

        function returnBinary(binary) {
          res.writeHead(200, { 'content-type': contentType });
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
      
      
      this.server.on('error', (error)=> {
        homey.error(error);
      });
    } catch (error) {
      this.homey.error(error);
    }

    return this;
  }

  async getDownloadUrl({base64, contentType}={}) {
    let code = randomBytes(24).toString('hex');
    if(base64) {
      this.files[code] = {base64, contentType};
      homey.setTimeout(()=> {
        delete this.files[code];
      }, 60*1000);
    }
    return {url:`http://${this.ip}:${this.port}/getfile/${code}/`};

  }
}

module.exports = FileServer;