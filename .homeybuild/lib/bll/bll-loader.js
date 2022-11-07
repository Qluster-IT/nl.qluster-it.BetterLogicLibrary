let _version;
let _L; // statics
let _l;
let _, datetime;

class BL {
    /** @private */
    static get Current() { return this._current; }

    /** @private */
    static get L() { return _L; }

    /** @private */
    get l() { return _l; }
    
    /** @private */
    static get l() { return BL.L.Current; }

    /**
     * @name Lodash
     * @description The lodash library
     * */
    static get _() { if (_) return _; throw new Error('BLL: Lodash has not been loaded.'); }
    static set _(val) { _ = val; }

    /**
     * @name datetime
     * @description The DateTime library, used for converting date and times to strings formatted for the user.
     * @type {import("./bll-loader.typedef").DateTime}
     * */
    static get datetime() { if (_) return datetime; throw new Error('BLL: DateTime has not been loaded.'); }
    static set datetime(val) { datetime = val; }

    /**
     * Creates an instance of BL.
     * @param {import("./bll-loader.typedef").DateTime_construct_param} [{homey, modules}={}]
     * @memberof BL
     */
    constructor({ homey, modules, silent } = {}) {
        if (BL._current) return BL._current;
        BL._current = this;
        BL.homey = homey;
        this.homey = homey;
        this.silent = silent;

        return this.init({ modules });
    }
    
    /** @private */
    async init({ modules }) {
        if (!this.api) {
            this.api = await this.getAppApi('net.i-dev.betterlogic', 'Better Logic Library', true);
            this.api.on('realtime', async (event) => {
                if(event==='running') return await this.initBll({ modules, version: await this.api.getVersion() });
            });
            if (!await this.api.getInstalled()) return this;
        }

        return await this.initBll({ modules });
    }
    
    /** @private */
    async initBll({ version, modules }) {        
        if(version && version===_version && process.env.DEBUG !== '1') return;
        _version = version || await this.api.getVersion();
        let bblFile;
        bblFile = await this.getLibrary('bll');
        let bll = this.requireFromString(bblFile.file, '');
        _L = bll.BLL;
        try {
            _l = await new bll.BLL({ homey: this.homey, modules, silent:this.silent });
        } catch (error) { }
        return this;
    }

    /** @private */
    async getLibrary(libraryName) {
        let api = await this.getAppApi('net.i-dev.betterlogic', 'Better Logic Library');
        return await api.get('/library/' + libraryName);
    }

    /** @private */
    requireFromString(src, filename) {
        var m = new module.constructor();
        m.paths = module.paths;
        m._compile(src, filename || '');
        return m.exports;
    }

    /** @private */
    async getAppApi(appId, appname, onlyApi) {
        if (!this.api) this.api = this.homey.api.getApiApp(appId);
        if (onlyApi === true) return this.api;
        if (!this.api) throw new Error(appname + ' is not installed.');
        else {
            if (!await this.api.getInstalled()) throw new Error(appname + ' is not installed.');
        }
        return this.api;
    }

    static async decode(text) {
        if(!BL.l && !this.silent) throw new Error('Better Logic Library is not loaded.');
        return await BL.l.decode(text);
    }
}

module.exports = { BL };