let _version;
let _L; // statics
let _l;
let _, datetime;
let _isLoaded = false;

/**
 * @type {import("./bl.typedef").BL}
 */
class BL {
    /** @private @type {BL} */
    static get Current() { return this._current; }

    /** @private */
    static get L() { return _L; }

    /** @private */
    get l() { return _l; }

    /** @private */
    static get l() { return BL.L.Current; }

    
/** @type {import("./bl.typedef").BL_decode}*/
static async decode(text) { //text, date, locale, timeZone
        if (!BL.l && !this.silent) throw new Error('Better Logic Library is not loaded.');
        if (!BL.l) return !text ? text : typeof(text)=='object' ? text.text : text;
        return await BL.l.decode.apply(null, arguments);
    }


    /**
     * Indicates if the BLL has been loaded before     *
     * @readonly @static @memberof BL */
    static get isLoaded() { return _isLoaded; }

    /**
     * @description The lodash library
     * @readonly @static @memberof BL */
    static get _() { if (_) return _; throw new Error('BLL: Lodash has not been loaded.'); }

    /** @private */
    static set _(val) { _ = val; }

    /**
     * @description The DateTime library, used for converting date and times to strings formatted for the user.
     * @type {import("./bl.typedef").DateTime} @readonly @static @memberof BL */
    static get datetime() { if (datetime) return datetime; throw new Error('BLL: DateTime has not been loaded.'); }
    //static get dateTime() { if (datetime) return datetime; throw new Error('BLL: DateTime has not been loaded.'); }

    /** @private */
    static set datetime(val) { datetime = val; }

    /**
     * Creates an instance of BL.
     * @param {[{ homey:String, modules, silent, waitTime, waitForBll }={ waitForBll: true }]} [{ homey, modules, silent, waitTime, waitForBll }={ waitForBll: true }] @memberof BL
     */
    constructor({ homey, modules, silent, waitTime, waitForBll } = { waitForBll: true }) {
        if (BL._current) return BL._current;
        BL._current = this;
        BL.homey = homey;
        
        this.homey = homey;
        this.silent = silent === undefined ? (!modules || !modules.length) : silent;
        this.modules = modules;
        this.waitTime = waitTime;
        this.waitForBll = waitForBll;

        return this.init();
    }


    /** @private */
    async init() {
        
        let defer = new Defer(5 * 60 * 1000, null, () => {
            if (this.silent === false) {
                this.homey.notifications.createNotification({ excerpt: 'Warning: Better Logic Library could not be loaded and is required! Install the Better Logic Library App to continue to use this app.' });
                defer.reject(this);
            } else defer.resolve(this);
        });
        if (!this.api) {
            this.api = await this.getAppApi('net.i-dev.betterlogic', 'Better Logic Library', true);

            if (this.homey.app.id !== 'net.i-dev.betterlogic') this.api.on('realtime', async (event) => {
                if (event === 'running') {
                    let x = async () => {
                        await this.initBll({ version: await this.api.getVersion() });
                        if (!defer.isDefered) defer.resolve(this);
                    };
                    if (this.api.getInstalled()) x();

                    else {
                        setTimeout(x, 15000);
                    }

                }
            });
            _isLoaded = await this.api.getInstalled();
            if (!_isLoaded) {
                if (!this.waitForBll) defer.resolve();
                return defer.promise;
            }
        }
        this.initBll().then(x => { defer.resolve(this); }).catch(x => defer.reject(this));

        return defer.promise;

    }

    /** @private */
    async initBll({ version } = {}) {
        if (version && version === _version && process.env.DEBUG !== '1') return;
        let bblFile;
        bblFile = await this.getLibrary('bll');
        let bll = this.requireFromString(bblFile.file, '');
        try {
            let old_bll = _l;
            _l = await new bll.BLL({ homey: this.homey, modules: this.modules, silent: this.silent });
            _L = bll.BLL;
            if(old_bll) old_bll.destroy();
            _version = version || await this.api.getVersion();
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
            _isLoaded = await this.api.getInstalled();
            if (!_isLoaded) throw new Error(appname + ' is not installed.');
        }
        return this.api;
    }
}

class Defer {
    get isDefered() { return !!this._isDefered; }
    set isDefered(v) { this._isDefered = v; }

    get promise() { return this._promise; }
    set promise(v) { this._promise = v; }
    /** 
     * @param {Number} timeout 
     */
    constructor(timeout, originalPromise, onTimeout) {
        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
        if (timeout) {
            this.timeout = setTimeout(function () {
                if (!this.isDefered && this.promise) {

                    if (this.promise.resolve) this.promise.resolve();
                    if (onTimeout) onTimeout();
                }
            }.bind(this), timeout);
        }
        if (originalPromise && originalPromise.then) originalPromise.then((val1, val2, val3, val4) => this.resolve(val1, val2, val3, val4)).catch((val1, val2, val3, val4) => this.reject(val1, val2, val3, val4));
    }
    then(fun) { this._promise.then(fun); }
    catch(fun) { this._promise.catch(fun); }
    finally(fun) { this._promise.finally(fun); }
    resolve(val1, val2, val3, val4) { if (this.timeout) clearTimeout(this.timeout); this.isDefered = true; this._resolve(val1, val2, val3, val4); return this.promise; }
    reject(val1, val2, val3, val4) { if (this.timeout) clearTimeout(this.timeout); this.isDefered = true; this._reject(val1, val2, val3, val4); return this.promise; }
}


module.exports = { BL };