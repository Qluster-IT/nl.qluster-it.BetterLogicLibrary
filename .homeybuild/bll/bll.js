
const { BL, Defer } = require("betterlogiclibrary");
//var querystring = require('querystring');
var http = require('http');


class BLL {

    /**@type {BLL} */
    static get Current() { return this._current; }

    static get _() { return this.__; }

    static get math() { return this._math; }

    static get datetime() { return this._datetime; }
    //static get dateTime() {  return this._datetime; }

    static get proto() { return this._proto; }

    static get json() { return this._json; }


    /**@type {Object} */
    static get homey() { return this._homey; }

    /**@type {Object} */
    get homey() { return BLL.homey; }


    /**
     * @param {Object} options 
     */
    constructor({ homey, modules, silent } = {}) {
        BLL._current = this;
        BLL._homey = homey;
        this.silent = silent;
        if (!BL.submodules) BL.submodules = {};
        return this.init({ modules });
    }


    static clearObj(obj) {
        for (const key in obj)
            if (Object.hasOwnProperty.call(obj, key)) {
                try {
                    delete obj[key];
                } catch (ex) { }
            }
    }

    destroy() {

        if (BLL.datetime) BLL.datetime.destroy();
        if (BLL.json) BLL.json.destroy();
        //if (this.api) this.api.unregister();
        // delete BLL._current;
        // BLL.__ = null;
        // BLL._math = null;
        // BLL._datetime = null;
        // BLL._proto = null;
        // BLL._homey = null;
        BLL.clearObj(this);
        BLL.clearObj(BLL);

        BL.homey.log('BLL destroyed');
    }
    sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    async init({ modules } = { modules: [] }) {
        if(BL.homey.app.id === 'net.i-dev.betterlogic') await this.sleep(2000);

        //BL.homey.log('BLL.init');
        //let api = await this.getApi();
        if (modules && modules.length && ((modules.indexOf('datetime') > -1 || modules.indexOf('dateTime') > -1) && modules.indexOf('_') == -1)) modules.unshift('_');
        // modules = modules.sort((a,b)=> a -b );
        //BL.homey.log('modules', modules);
        if (modules) for (const module of modules) {
            try {
                switch (module) {
                    case "_":
                        if (BL.__) {
                            BLL.__ = BL.__;
                        } else {
                            let _ = await this.getLibrary('lodash');
                            BLL.__ = this.requireFromString(_.file, 'lodash');
                            BL._ = BLL._;
                        }
                        break;
                    case "math":
                        if (BL._math) {
                            BLL._math = BL._math;
                        } else {
                            let math = await this.getLibrary('mathjs');
                            BLL._math = this.requireFromString(math.file, 'mathjs');
                            BL.math = BLL.math;
                        }
                        break;
                    case "datetime":
                    case "dateTime":
                        let datetime = await this.getLibrary('datetime');
                        let dateTimeObj = this.requireFromString(datetime.file, 'datetime');


                        BLL._datetime = dateTimeObj;//new dateTimeObj();
                        BL.datetime = BLL.datetime;

                        await dateTimeObj.init(this);

                        break;
                    case "proto":
                        if (BL._proto) {
                            BLL._proto = BL._proto;
                        } else {
                            let proto = await this.getLibrary('proto');
                            BLL._proto = this.requireFromString(proto.file, 'proto');
                            BL.proto = BLL.proto;
                        }
                        break;
                    case "json":
                        if (!BL.submodules['write-excel-file-min']) {
                            let writeexcelfilemin = await this.getLibrary('write-excel-file-min');
                            BL.submodules['write-excel-file-min'] = this.requireFromString(writeexcelfilemin.file, 'write-excel-file-min');
                        }
                        if (!BL.submodules['json2csv']) {
                            let writeexcelfilemin = await this.getLibrary('json2csv');
                            BL.submodules['json2csv'] = this.requireFromString(writeexcelfilemin.file, 'json2csv');
                        }
                        let json = await this.getLibrary('json');
                        BLL._json = this.requireFromString(json.file, 'json');
                        BL.json = BLL.json;


                        await BLL.json.init(this);
                        break;
                }
            } catch (error) { BL.homey.error(error); }
        }
        // let coding = await this.getLibrary('coding'); 
        // let codingClass = this.requireFromString(coding.file, '');
        // BL.coding = BLL.coding = new codingClass();        
        return this;
    }
    async getApi() {
        if (BL.Current && BL.Current.api)
            return BL.Current.api;
        //if(!this.api && BL.Current.api) this.api = BL.Current.api;
        if (!this.api) this.api = await this.getAppApi('net.i-dev.betterlogic', 'Better Logic Library');
        return this.api;
    }

    async getLibrary(libraryName) {
        try {
            let api = await this.getApi();
            return await api.get('/library/' + libraryName);
        } catch (error) {
            BL.homey.error('getLibrary error', libraryName, '\n', error);
        }
    }

    requireFromString(src, filename) {
        try {
            var m = new module.constructor();
            m.paths = module.paths;// + ',/lib,/bll';
            //console.log('m.paths: ' + m.paths);
            m._compile(src, filename || '');
            return m.exports;
        } catch (error) {
            BL.homey.error(error);
        }
    }

    async post(url, opt) {
        try {
            let api = await this.getApi();
            return await api.post(url, opt);
        } catch (error) {
            throw error;
            //BL.homey.error(error);
            throw new Error('Better Logic is not installed or running.');
        }
    }

    async get(url, opt) {
        try {
            let api = await this.getApi();
            return await api.get(url);
        } catch (error) {
            throw error;
            //BL.homey.error(error);
            throw new Error('Better Logic is not installed or running.');
        }
    }

    async getAppApi(appId, appname) {
        if (!this.api) this.api = this.homey.api.getApiApp(appId);

        if (!this.api) throw new Error(appname + ' is not installed.');
        else if (!await this.api.getInstalled()) throw new Error(appname + ' is not installed.');

        return this.api;
    }


    async decode(text, { locale, timeZone } = {}) {
        try {

            if (!text || typeof (text) !== 'string' || text.indexOf('{[') === -1 || text.indexOf(']}') === -1) return text;
            return await BL.l.post('decode', { text, locale, timeZone });
        } catch (error) {
            if (BL.l.silent === true) return text;
            else throw error;
        }

    }
    async express(expression, contextProperties) {
        try {
            return await BL.l.post('express', { expression, contextProperties });
        } catch (error) {
            throw error;
        }

    }

    async getDownloadUrl({ base64, contentType, buffer, json, text, filename, callback } = {}) {
        try {
            const api = BL.Current.api;
            const link = await api.post('/getdownloadurl/', { contentType, filename });

            if (buffer || base64 || json || text) {
                return await this.setDownloadUrl({ link, base64, contentType, buffer, json, text, filename, callback })
            }
            else return link;

        } catch (error) {
            throw new Error(error);
        }
    }
    async setDownloadUrl({ link, base64, contentType, buffer, json, text, filename, callback } = {}) {
        try {
            const defer = new Defer();

            let type = 'base64';
            if (buffer !== undefined) type = 'application/octet-stream';
            else if (json !== undefined) type = 'text/json';
            else if (text !== undefined) type = 'text/plain';

            const plain = !buffer;

            const send = buffer || base64 || json || text;
            if (send !== undefined) {
                const post_options = {
                    host: link.host,
                    port: link.port,
                    path: link.path,
                    method: 'POST',
                    headers: {
                        'Accept': contentType || link.contentType,
                        'Content-Type': type,
                        'Content-Length': Buffer.byteLength(send) // buffer !== undefined ? Buffer.byteLength(buffer) : send.length
                    }
                };
                //BL.homey.log('send length', buffer !== undefined ? Buffer.byteLength(buffer) : send.length);

                // Set up the request
                const post_req = http.request(post_options, function (res) {
                    res.setEncoding('utf8');
                    res.on('data', function (chunk) {
                    });
                    res.on('end', function (chunk) {
                        defer.resolve(link);
                        post_req.destroy();
                        BL.clearObj(defer);
                        if (callback) callback(link);
                    });
                });
                post_req.on('error', (e) => {
                    if (e) BL.homey.error('Bll.send file e', e);
                    defer.reject(e);
                    post_req.destroy();
                    BL.clearObj(defer);
                });

                if (plain) post_req.write(send, (error) => {
                    if (error) BL.homey.error('Bll.send file error', error);
                    post_req.end();
                });
                else
                    post_req.write(send, 'binary', (error) => {
                        if (error) BL.homey.error('Bll.send file error', error);
                        post_req.end();
                    });

                if (callback) return link;
                else return defer.promise;

            }
            else return link;

        } catch (error) {
            throw new Error(error);
        }
    }

}

module.exports = { BLL };