const { BL } = require("../lib/bll/bl");

class BLL {
    
	/**@type {BLL} */
	static get Current() { return this._current; }
    
	static get _() {  return this.__; }

	static get math() {  return this._math; }

	static get datetime() {  return this._datetime; }
	static get dateTime() {  return this._datetime; }
	
    //static get DateTime() {  return this._DateTime; }
    
	/**@type {Homey} */
	static get homey() { return this._homey; }
    
    /**@type {Homey} */
    get homey() { return BLL.homey; }


    /**
     * @param {Object} options 
     */
    constructor({homey, modules, silent} = {}) {
        if(BLL._current) return BLL._current;
        BLL._current = this;
        BLL._homey = homey;
        this.silent = silent;
        return this.init({modules});        
    }
    async init({modules} = {modules:[]}) {
        if(modules) for (const module of modules) {
            try {                    
                switch (module) {
                    case "_":
                        let _ = await this.getLibrary('lodash'); 
                        BLL.__ = this.requireFromString(_.file, '');
                        BL._ = BLL._;
                        break;
                    case "math":                    
                        let math = await this.getLibrary('mathjs');
                        BLL._math = this.requireFromString(math.file, '');
                        BL.math = BLL.math;
                        break;
                    case "datetime":  
                    case "dateTime":                    
                        let datetime = await this.getLibrary('datetime'); 
                        let dateTimeObj = this.requireFromString(datetime.file, '');
                        //BLL._DateTime = dateTimeObj;

                        
                        BLL._datetime = dateTimeObj;//new dateTimeObj();
                        BL.datetime = BLL.datetime;
                        
                        await dateTimeObj.init();

                        break;
                }
            } catch (error) { BL.homey.error(error); }
        }
        // let coding = await this.getLibrary('coding'); 
        // let codingClass = this.requireFromString(coding.file, '');
        // BL.coding = BLL.coding = new codingClass();
        // BL.prototype.decode = BLL.prototype.decode = async (text) => {
        //       return await BL.l.post('decode', {text});        
        // };
        return this;
    }
    async getApi() {
        if(!this.api && BL.Current.api) this.api = BL.Current.api;
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
            return await this.api.post(url, opt);
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

    
    async decode(text) {
        try {         
            return await BL.l.post('decode', {text});  
        } catch (error) {
            if(BL.l.silent===true) return text;
            if(BL.l.silent!==true) throw error;
        }
        
    }


}

module.exports = {BLL, _:BLL._};