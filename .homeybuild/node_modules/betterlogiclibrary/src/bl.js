let _version;
let _L; // statics
let _l;
let _, datetime;
let _isLoaded = false;


class BL {
    /** @private @type {BL} */
    static get Current() { return this._current; }

    /** @private */
    static get L() { return _L; }

    /** @private */
    get l() { return _l; }

    /** @private */
    static get l() { return BL && BL.L ? BL.L.Current : null; }
   

  /**
   * @description Decode the given {@link String} for any BLL codings and returns the decoded string.
   * @static
   * @async
   * @param {string} text The text which could contain BLL coding and needs be be converted.
   * @return {string} A decoded {@link String} if BLL is running, otherwise it will return the original {@link String}.
   * @memberof BL
   */  
static async decode(text, {locale, timeZone}={}) { //text, {locale}
        if (!BL.l && BL && BL.Current && !BL.Current.silent) throw new Error('Better Logic Library is not loaded.');
        if (!BL.l) return text;        
        //return await BL.l.decode(text, options);
        return await BL.l.decode.apply(null, arguments);             
    }


    /**
     * Indicates if the BLL has been loaded before     *
     * @static*/
    static get isLoaded() { return _isLoaded; }

    /**
     * @description The lodash library
     * @static*/
    static get _() { if (_) return _; throw new Error('BLL: Lodash has not been loaded.'); }

    /** @private */
    static set _(val) { _ = val; }

    /**
     * @description The DateTime library, used for converting date and times to strings formatted for the user.
     * @type {typeof import('../dist/dateTime')} @static*/
    static get datetime() { if (datetime) return datetime; throw new Error('BLL: DateTime has not been loaded.'); }


    /** @private */
    static set datetime(val) { datetime = val; }


    /**
     *     *
     * @static
     * @param {*} [{ homey, modules, silent, waitTime, required }={}]
     * @return {*} 
     */
    static async init({ homey, modules, silent, waitTime, required } = {}) {
        return new BL().init({ homey, modules, silent, waitTime, required });
    }


    /** @private */
    async init({ homey, modules, silent, waitTime, required } = {}) {
        if (BL._current) return BL._current;
        BL._current = this;
        BL.homey = homey;
        
        this.homey = homey;
        this.required = required === undefined ? (modules && modules.length) : required;
        this.silent = silent === undefined ? (!modules || !modules.length || !this.required) : silent;
        this.modules = modules;
        this.waitTime = waitTime;
        //this.required = required;

        let defer = new Defer(5 * 60 * 1000, null, () => {
            if (this.silent === false) {
                this.homey.notifications.createNotification({ excerpt: `Warning: Better Logic Library could not be loaded and is required! Install the Better Logic Library App to continue to use this app (${this.homey.app.id}).` });
                defer.reject(this);
            } else defer.resolve(this);
        });
        if(this.homey.app.id!=='net.i-dev.betterlogic' && !await this.homey.settings.get('notification_bll_supported')) {
            this.homey.notifications.createNotification({excerpt : `This app (${this.homey.app.id}) now supports BLL coding within flowcards.\nInstall the Better Logic Library App from the Athom Store to use BLL coding.\nSee the BLL App Settings for more information.` });
            this.homey.settings.set('notification_bll_supported', true);
        }
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
                if(this.required) {
                    if(!await this.homey.settings.get('notification_bll_required')) {
                        this.homey.notifications.createNotification({excerpt : `Warning: The Better Logic Library App is required for this app (${this.homey.app.id}) (to support BLL Coding and reduce install size).\nPlease install the Better Logic Library App from the Athom Store.` });
                        this.homey.settings.set('notification_bll_required', true);
                    }
                    return defer.promise;
                }
                if (!this.required) defer.resolve(this);
                return defer.promise;
            } else this.homey.settings.set('notification_bll_required', true);
        }
        this.initBll().then(x => { defer.resolve(this); }).catch(x => {if (!this.required) defer.resolve(this); else defer.reject(this);} );

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