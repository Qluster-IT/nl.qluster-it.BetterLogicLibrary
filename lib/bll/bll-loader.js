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
    constructor({ homey, modules, silent, waitTime } = {}) {
        if (BL._current) return BL._current;
        BL._current = this;
        BL.homey = homey;
        this.homey = homey;
        this.silent = silent;
        this.waitTime=waitTime;

        return this.init({ modules });
    }
    
    /** @private */
    async init({ modules }) {
        let defer = new Defer(10*1000, null, ()=>{
            this.homey.notifications.createNotification({excerpt:''});
            defer.resolve(this);
        });
        if (!this.api) {
            this.api = await this.getAppApi('net.i-dev.betterlogic', 'Better Logic Library', true);
            this.api.on('realtime', async (event) => {
                if(event==='running') {
                    await this.initBll({ version: await this.api.getVersion() });
                    if(!defer.isDefered) defer.resolve(this);
                    
                }
            });
            if (!await this.api.getInstalled()) {
                return defer.promise;
            }
        }        
        this.initBll({ modules }).then(x=>{defer.resolve(this);}).catch(x=>defer.reject(this) );
        
        return defer.promise;

    }
    
    /** @private */
    async initBll({ version }) {        
        if(version && version===_version && process.env.DEBUG !== '1') return;
        _version = version || await this.api.getVersion();
        let bblFile;
        bblFile = await this.getLibrary('bll');
        let bll = this.requireFromString(bblFile.file, '');
        _L = bll.BLL;
        try {
            _l = await new bll.BLL({ homey: this.homey, modules:this.modules, silent:this.silent });
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

class Defer {    
    get isDefered() { return !!this._isDefered ; }
    set isDefered(v) { this._isDefered = v; }
    
    get promise() { return this._promise ; }
    set promise(v) { this._promise = v; }
    /** 
     * @param {Number} timeout 
     */
    constructor(timeout, originalPromise, onTimeout) {        
        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });        
        if(timeout) {
            setTimeout(function () {
                if(!this.isDefered && this.promise) {

                    if(this.promise.resolve) this.promise.resolve();
                    if(onTimeout) onTimeout();
                }
            }.bind(this),timeout);
        }
        if(originalPromise && originalPromise.then) originalPromise.then((val1,val2,val3,val4)=>this.resolve(val1,val2,val3,val4)).catch((val1,val2,val3,val4)=>this.reject(val1,val2,val3,val4));
    }
    then(fun) { this._promise.then(fun); }
    catch(fun) { this._promise.catch(fun); }
    finally(fun) { this._promise.finally(fun); }
    resolve(val1,val2,val3,val4) { this.isDefered=true; this._resolve(val1,val2,val3,val4); return this.promise; }
    reject(val1,val2,val3,val4) { this.isDefered=true; this._reject(val1,val2,val3,val4); return this.promise; }
}


module.exports = { BL };