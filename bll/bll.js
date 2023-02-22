
const { BL } = require("betterlogiclibrary");

class BLL {
    
	/**@type {BLL} */
	static get Current() { return this._current; }
    
	static get _() {  return this.__; }

	static get math() {  return this._math; }

	static get datetime() {  return this._datetime; }
	static get dateTime() {  return this._datetime; }

    static get proto() {  return this._proto; }
	
    
	/**@type {Object} */
	static get homey() { return this._homey; }
    
    /**@type {Object} */
    get homey() { return BLL.homey; }


    /**
     * @param {Object} options 
     */
    constructor({homey, modules, silent} = {}) {
        BLL._current = this;
        BLL._homey = homey;
        this.silent = silent;
        return this.init({modules});        
    }
    destroy() {
        if(BLL.datetime) BLL.datetime.destroy();
        if(this.api) this.api.unregister();
        BL.homey.log('BLL destroyed');
    }
    async init({modules} = {modules:[]}) {
        BL.homey.log('init BLL');
        let api = this.getApi();
        if(modules && modules.length && ((modules.indexOf('datetime')>-1 || modules.indexOf('dateTime')>-1) && modules.indexOf('_')==-1)) modules.unshift('_');
        // modules = modules.sort((a,b)=> a -b );
        BL.homey.log('modules', modules);
        if(modules) for (const module of modules) {
            try {                    
                switch (module) {
                    case "_":
                        let _ = await this.getLibrary('lodash'); 
                        BLL.__ = this.requireFromString(_.file, 'lodash');
                        BL._ = BLL._;
                        break;
                    case "math":                    
                        let math = await this.getLibrary('mathjs');
                        BLL._math = this.requireFromString(math.file);
                        BL.math = BLL.math;
                        break;
                    case "datetime":  
                    case "dateTime":                    
                        let datetime = await this.getLibrary('datetime'); 
                        let dateTimeObj = this.requireFromString(datetime.file);

                        
                        BLL._datetime = dateTimeObj;//new dateTimeObj();
                        BL.datetime = BLL.datetime;
                        
                        await dateTimeObj.init(this);

                        break;                        
                    case "proto":
                        let proto = await this.getLibrary('proto'); 
                        BLL._proto = this.requireFromString(proto.file, 'proto');
                        BL.proto = BLL.proto;
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
        //if(!this.api && BL.Current.api) this.api = BL.Current.api;
        if(!this.api) this.api = await this.getAppApi('net.i-dev.betterlogic', 'Better Logic Library');
        return this.api;
    }

    async getLibrary(libraryName) {
        try {
            let api = await this.getApi();
            return await api.get('/library/'+libraryName);            
        } catch (error) {
            BL.homey.error(error);
        }
    }

    requireFromString(src, filename) {
        try {                
            var m = new module.constructor();
            m.paths = module.paths;// + ',/lib,/bll';
            console.log('m.paths: ' + m.paths);
            m._compile(src, filename||'');
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
            BL.homey.error(error);
            throw new Error('Better Logic is not installed or running.');
        }
    }
      
    async get(url, opt) {
        try {
            let api = await this.getApi();
            return await api.get(url);
        } catch (error) {
            BL.homey.error(error);
            throw new Error('Better Logic is not installed or running.');
        }
    }
      
    async getAppApi(appId, appname) {
        if(!this.api) this.api = this.homey.api.getApiApp(appId);
        
        if(!this.api) throw new Error(appname + ' is not installed.');
        else if(!await this.api.getInstalled()) throw new Error(appname + ' is not installed.');

        return this.api;
    }

    
    async decode(text, {locale, timeZone}={}) {
        try {         
            //BL.homey.log('decode: ', arguments);
            //BL.homey.log('decode options: ', options);
            return await BL.l.post('decode', {text, locale, timeZone});  
        } catch (error) {
            if(BL.l.silent===true) return text;
            else throw error;
        }
        
    }


}

module.exports = {BLL};