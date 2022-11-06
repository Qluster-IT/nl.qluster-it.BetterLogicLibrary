const { BL } = require("../lib/bll-loader");

class BLL {
    
	/**@type {BLL} */
	static get Current() { return this._current; }
    
	static get _() {  return this.__; }

	static get math() {  return this._math; }

	static get datetime() {  return this._datetime; }
	static get dateTime() {  return this._datetime; }
    
	/**@type {Homey} */
	static get homey() { return this._homey; }
    
    /**@type {Homey} */
    get homey() { return BLL.homey; }


    /**
     * @param {Object} options 
     */
    constructor({homey, modules} = {}) {
        BLL._current = this;
        BLL._homey = homey;
        return this.init({modules});        
    }
    async init({modules} = {modules:[]}) {
        if(modules) for (const module of modules) {
            switch (module) {
                case "_":
                    let _ = await this.getLibrary('lodash-core'); BLL.__ = this.requireFromString(_.file, '');
                    BL._ = BLL._;
                    break;
                case "math":                    
                    let math = await this.getLibrary('math'); BLL._math = this.requireFromString(math.file, '');
                    BL.math = BLL.math;
                    break;
                case "datetime":  
                case "dateTime":                    
                    let datetime = await this.getLibrary('datetime'); 
                    let dateTimeObj = this.requireFromString(datetime.file, '');

                    BLL._datetime = new dateTimeObj(this.homey.i18n.getLanguage(), this.homey.clock.getTimezone());
                    BL.datetime = BLL._datetime;
                    //BLL.date
                    break;
            }
        }
        return this;
    }

    async getLibrary(libraryName) {
        if(!this.api) this.api = await this.getAppApi('net.i-dev.betterlogic', 'Better Logic Library');
        return await this.api.get('/library/'+libraryName);
    }

    requireFromString(src, filename) {
        var m = new module.constructor();
        m.paths = module.paths;// + ',/lib,/bll';
        console.log('m.paths: ' + m.paths);
        m._compile(src, filename||'');
        return m.exports;
      }
      
      
    async getAppApi(appId, appname) {
        if(!this.homey.app[appId]) this.homey.app[appId] = this.homey.api.getApiApp(appId);
        
        if(!this.homey.app[appId]) throw new Error(appname + ' is not installed.');
        else if(!await this.homey.app[appId].getInstalled()) throw new Error(appname + ' is not installed.');

        return this.homey.app[appId];
    }

}

module.exports = {BLL, _:BLL._};