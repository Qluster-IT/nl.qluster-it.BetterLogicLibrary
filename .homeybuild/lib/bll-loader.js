let l;
class B {
    
    
	/**@type {BLL} */
	static get L() { return l; }
	static set L(v) { l = v; }

    /**
     * 
     * @param {Object} options 
     */
    constructor({homey, modules} = {}) {
        this.homey = homey;
        return this.init({modules});
        
    }
    async init({modules}) {        
        let bblFile = await this.getLibrary('bll'); 
        let bll = this.requireFromString(bblFile.file, '');
        l = bll.BLL;
        return await new bll.BLL({homey:this.homey, modules});
    }

    async getLibrary(libraryName) {
        if(!this.api) this.api = await this.getAppApi('net.i-dev.betterlogic', 'Better Logic Library');
        return await this.api.get('/library/'+libraryName);
    }

    requireFromString(src, filename) {
        var m = new module.constructor();
        m.paths = module.paths;
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

module.exports = {B, BL:B};