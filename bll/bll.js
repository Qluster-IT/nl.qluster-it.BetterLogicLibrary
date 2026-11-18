
const { BL } = require("betterlogiclibrary");
//var querystring = require('querystring');
const http = require('http');
const { types } = require('util');

const DOWNLOAD_UPLOAD_TIMEOUT = 60 * 1000;

function prepareDownloadBody({ buffer, base64, json, text, callback }) {
    if (callback !== undefined && typeof callback !== 'function') {
        throw new TypeError('Download callback must be a function');
    }

    const fields = Object.entries({ buffer, base64, json, text }).filter(([, value]) => value !== undefined);
    if (!fields.length) return;
    if (fields.length !== 1) throw new TypeError('Provide only one download body');

    const [[field, value]] = fields;
    switch (field) {
        case 'buffer':
            if (!types.isUint8Array(value)) throw new TypeError('Download buffer must be a Buffer or Uint8Array');
            return { type: 'application/octet-stream', body: Buffer.from(value.buffer, value.byteOffset, value.byteLength) };
        case 'base64': {
            if (typeof value !== 'string') throw new TypeError('Download base64 must be a string');
            const encoded = value.replace(/\s/g, '');
            if (!/^[A-Za-z0-9+/_-]*={0,2}$/.test(encoded) ||
                (encoded.endsWith('=') ? encoded.length % 4 !== 0 : encoded.length % 4 === 1)) {
                throw new TypeError('Invalid Base64 download body');
            }
            return { type: 'application/octet-stream', body: Buffer.from(encoded, 'base64') };
        }
        case 'json':
            try {
                if (typeof value === 'string') {
                    JSON.parse(value);
                    return { type: 'text/json', body: value };
                }
                const body = JSON.stringify(value);
                if (body !== undefined) return { type: 'text/json', body };
            } catch (_) {
                // Do not expose input snippets from JSON errors.
            }
            throw new TypeError('Invalid JSON download body');
        case 'text':
            if (typeof value !== 'string') throw new TypeError('Download text must be a string');
            return { type: 'text/plain', body: value };
    }
}

async function uploadDownload(link, { type, body }, { contentType, callback }) {
    if (!link || typeof link.host !== 'string' || !link.host ||
        !['number', 'string'].includes(typeof link.port) || !/^\d+$/.test(String(link.port)) ||
        Number(link.port) < 1 || Number(link.port) > 65535 ||
        typeof link.path !== 'string' || !link.path.startsWith('/')) {
        throw new TypeError('Invalid download upload link');
    }

    const headers = { 'Content-Type': type, 'Content-Length': Buffer.byteLength(body) };
    const accept = contentType || link.contentType;
    if (accept !== undefined) {
        if (typeof accept !== 'string') throw new TypeError('Download content type must be a string');
        headers.Accept = accept;
    }

    let request;
    let timeout;
    try {
        await new Promise((resolve, reject) => {
            const interrupted = () => reject(new Error('Download upload was interrupted'));
            let responseEnded = false;
            const complete = () => {
                if (request.writableFinished && responseEnded) resolve();
            };

            request = http.request({
                host: link.host, port: link.port, path: link.path, method: 'POST', headers
            }, response => {
                response.on('aborted', interrupted);
                response.on('error', interrupted);
                response.on('close', () => {
                    if (!response.complete) interrupted();
                });
                if (!(response.statusCode >= 200 && response.statusCode < 300)) {
                    reject(new Error(`Download upload failed with HTTP ${response.statusCode}`));
                    return;
                }
                response.on('end', () => {
                    if (!response.complete) return interrupted();
                    responseEnded = true;
                    complete();
                });
                response.resume();
            });
            request.on('error', () => reject(new Error('Download upload network error')));
            request.on('finish', complete);
            request.on('close', () => {
                if (!request.writableFinished || !responseEnded) interrupted();
            });
            timeout = setTimeout(() => reject(new Error('Download upload timed out')), DOWNLOAD_UPLOAD_TIMEOUT);
            request.end(body);
        });
    } finally {
        clearTimeout(timeout);
        if (request) request.destroy();
    }

    if (callback) await callback(link);
    return link;
}

class BLL {

    /**@type {BLL} */
    static get Current() { return this._current; }

    static get _() { return this.__; }

    static get math() { return this._math; }

    static get datetime() { return this._datetime; }
    //static get dateTime() {  return this._datetime; }
    
    static get number() { return this._number; }

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

    // Older npm releases call the original misspelled method.
    detroy() {
        return this.destroy();
    }

    destroy() {

        if (BLL.datetime) BLL.datetime.destroy();
        if (BLL.number) BLL.number.destroy();
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
            this.homey.setTimeout(resolve, ms);
        });
    }

    async init({ modules } = { modules: [] }) {
        BL.homey.log('BLL.init');
        //if (BL.homey.app.id === 'net.i-dev.betterlogic') await this.sleep(2000);
        //BL.homey.log('BLL.init continue after sleep');
        
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

                    case "number":
                        let number = await this.getLibrary('number');
                        let numberObj = this.requireFromString(number.file, 'number');


                        BLL._number = numberObj;//new dateTimeObj();
                        BL.number = BLL.number;

                        await numberObj.init(this);

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
        BL.homey.log('BLL.init done');
        
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
            if(BL.homey.app.id === 'net.i-dev.betterlogic') return BL.homey.app.getLibrary(libraryName);
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
        if(BL.homey.app.id === 'net.i-dev.betterlogic') {
            switch (url) {
                case 'locale': return BL.homey.app.locale;            
                case 'exports': return BL.homey.app.exportsSettings;            
            }
        }
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
            if (BL.l.silent === true) return expression;
            else throw error;
        }

    }

    async getDownloadUrl(options = {}) {
        const { contentType, filename } = options;
        const upload = prepareDownloadBody(options);
        const link = await BL.Current.api.post('/getdownloadurl/', { contentType, filename });
        return upload ? uploadDownload(link, upload, options) : link;
    }

    async setDownloadUrl(options = {}) {
        const upload = prepareDownloadBody(options);
        if (!upload) throw new TypeError('Download body is required');
        return uploadDownload(options.link, upload, options);
    }

}

module.exports = { BLL };