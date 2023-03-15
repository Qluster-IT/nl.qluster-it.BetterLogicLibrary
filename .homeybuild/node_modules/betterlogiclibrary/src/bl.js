//let this._l;
//let BL.__, BL._datetime, BL._proto;
//let BL._isLoaded = false;


//let BL._ready, BL._defer, BL._initDefer;

class BL {
    /** @private @type {BL} */
    static get Current() { return this._current; }

    /** @private @type {import("../dist/bll").BLL */
    static get L() { return BL._L; }

    /** @private @type {import("../dist/bll").BLL} */
    get l() { return this._l; }

    /** @private */
    static get l() { return BL && BL.L ? BL.L.Current : null; }


    /**
     * @description Decode the given {@link String} for any BLL codings and returns the decoded string.
     * @static
     * @async
     * @param {string} text The text which could contain BLL coding and needs be be converted.
     * @return {Promise<string>} A decoded {@link String} if BLL is running, otherwise it will return the original {@link String}.
     * @memberof BL
     */
    static async decode(text, { locale, timeZone } = {}) {
        // if (!BL.l && BL && BL.Current && !BL.Current.silent) throw new Error('Better Logic Library is not loaded.');
        // if (!BL.l) return text;
        if (!this.Current.isReady) return text;

        return await BL.l.decode.apply(BL.l, arguments);
    }

    
    /**
     * @description Run the given expression {@link String}.
     * @static
     * @async
     * @param {string} expression The expression to be executed.
     * @param {object} contextProperties The properties to inject into the expression.
     * @return {Promise<object>} A {@link Object} if BLL is running, otherwise it will throw an error.
     * @memberof BL
     * @throws An Error when BLL is not running
     */
    static async express(expression, contextProperties) {
        if (!this.Current.isReady || !BL.l.express) throw new Error('Better Logic Library is not loaded.');//return undefined;

        return await BL.l.express.apply(BL.l, arguments);
    }


    /**
     * NOT YET PUBLICLY IN USE!
     * @returns 
     */
    static async getDownloadUrl({ base64, contentType, buffer, json, text, filename, callback } = {}) {
        if (!BL.l && BL && BL.Current && !BL.Current.silent) throw new Error('Better Logic Library is not loaded.');
        if (!BL.l) return null;
        return await BL.l.getDownloadUrl.apply(BL.l, arguments);
    }
    /**
         * NOT YET PUBLICLY IN USE!
         * @returns 
         */
    static async setDownloadUrl({ link, base64, contentType, buffer, json, text, filename, callback } = {}) {
        if (!BL.l && BL && BL.Current && !BL.Current.silent) throw new Error('Better Logic Library is not loaded.');
        if (!BL.l) return null;
        return await BL.l.setDownloadUrl.apply(BL.l, arguments);
    }
    /**
     * Indicates if the BLL has been loaded before     *
     * @static*/
    static get isLoaded() { return BL._isLoaded; }

    static async isInit() {
        // try {            
        //     await BL.Current.init();
        // } catch (error) {

        // }
        if (!BL.l && BL && BL.Current && !BL.Current.silent) throw new Error('The Better Logic Library App is not running.');//
        if (!BL.l) return false;
        return true;
        //return true;
    }
    /**
     * @description The lodash library
     * @static*/
    static get _() { if (BL.__) return BL.__; throw new Error('The Better Logic Library App is not running.'); }//BLL: Lodash has not been loaded.'); }

    /** @private */
    static set _(val) { BL.__ = val; }

    /**
     * @description The DateTime library, used for converting date and times to strings formatted for the user.
     * @type {typeof import('../dist/dateTime')} @static*/
    static get datetime() { if (BL._datetime) return BL._datetime; throw new Error('The Better Logic Library App is not running.'); }//BLL: DateTime has not been loaded.'); }


    /** @private */
    static set datetime(val) { BL._datetime = val; }

    /**
     * @description The Proto library.
     * @type {typeof import('../dist/proto')} @static*/
    static get proto() { if (BL._proto) return BL._proto; throw new Error('The Better Logic Library App is not running.'); }//BLL: Proto has not been loaded.'); }

    /** @private */
    static set proto(val) { BL._proto = val; }

    /** 
     * @description The JSON library, used for converting JSON files into Excel, Csv.
     * @type {typeof import('../dist/json')} @static*/
    static get json() { if (BL._json) return BL._json; throw new Error('The Better Logic Library App is not running.'); }//BLL: DateTime has not been loaded.'); }

    /** @private */
    static set json(val) { BL._json = val; }



    /**
     *     *
     * @static
     * @param {*} [{ homey, modules, silent, waitTime, required }={}]
     */
    static async init({ homey, modules, silent, waitTime, required } = {}) {
        let bl = new BL({ homey, modules, silent, waitTime, required });

        homey.app.__BL_OnUninit = homey.app.onUninit;
        homey.app.onUninit = async function (args) {

            try {
                if (BL) await BL.detroy();
            } catch (error) {
                console.log(error);
            }
            try {
                if (args) await this.__BL_OnUninit(...args); else await this.__BL_OnUninit();
            } catch (error) {
                let a = error;
            }
        };

        try {
            return await bl.init({ reload: true });
        } catch (error) {

        }
        return bl;
        //return bl.ready;

        //return new BL().init({ homey, modules, silent, waitTime, required });
    }

    async realtimeFunction(event, data) {
        let reload = false;
        if(event==='variable_changed') {
            BL.onVariableUpdate(data);

        } else if (event.startsWith('running')) {
            if ((reload = (BL.homey.app.id !== 'net.i-dev.betterlogic' && event === 'running')) || ((event === 'running_2x' || event === 'running_3x') && !BL.Current.isReady)) {
                //this.runningReceived = true;
                try {
                    //if(!BL.Current.isReady) {
                    BL.homey.log('BL.Current.init reload', reload);
                    BL.Current.init({ reload });

                    //}
                } catch (error) {

                }
                // let x = async () => {
                //     await BL.Current.initBll({ version: await BL.Current.api.getVersion() });
                //     if (BL.Current.defer && !BL.Current.defer.isDefered) BL.Current.defer.resolve(this);
                // };
                // if (BL.Current.api.getInstalled()) x();

                // else {
                //     BL.homey.setTimeout(x, 15000);
                // }
            }
        }
    }

    static clearObj(obj) {
        for (const key in obj)
            if (Object.hasOwnProperty.call(obj, key)) {
                try {
                    delete obj[key];
                } catch (ex) { }
            }
    }


    static detroy() {
        //BL.homey.settings.set('___TEST___', 'detroy');
        try {
            //BL.homey.settings.set('___TEST___', 'BL.Current' + !!(BL.Current));
            if (!BL.Current) return;
            if (BL.Current.api) {
                BL.Current.api.off('realtime', BL.Current.realtimeFunction);
                //BL.Current.api.unregister();
            }
            if (BL.Current.l) {
                //BL.homey.settings.set('___TEST___', 'CLEANING');
                //let clearObj = BL.Current.L.clearObj;
                BL.Current.l.detroy();
                BL.clearObj(BL.Current);
                BL.clearObj(BL);
            }
        } catch (error) { console.log(error); }
        //throw new Error('DONE FINISHED');
    }

    constructor({ homey, modules, silent, waitTime, required } = {}) {
        if (BL._current) return BL._current;
        BL._current = this;
        BL.homey = homey;
        // _modules = modules;
        // _silent = silent;
        // _waitTime = waitTime;
        // _required = required;


        this.homey = homey;
        this.required = required === undefined ? (modules && modules.length) : required;
        this.silent = silent === undefined ? (!modules || !modules.length || !this.required) : silent;
        this.modules = modules;
        this.waitTime = waitTime;
        this.isReady = false;

        BL._defer = new Defer();
        BL._ready = BL._defer.promise;
        BL.ready = BL._ready;
        BL._ready.then(() => {
            BL.isReady = this.isReady = true;
            BL.clearObj(BL._ready);
        });
    }
    async init({ reload } = {}) {
        //BL.homey.log('BL.init');
        if (reload === true) {
            BL._isLoaded = false;
            if (BL._initDefer) BL._initDefer.resolve(this);
            BL._initDefer = new Defer();
        } else {
            if (BL._initDefer) return await BL._initDefer.promise;
            else BL._initDefer = new Defer();
            if (BL._isLoaded) return this;
        }
        if (this.homey.app.id !== 'net.i-dev.betterlogic' && !await this.homey.settings.get('notification_bll_supported')) {
            try {
                this.homey.notifications.createNotification({ excerpt: `This app (${this.homey.app.id}) now supports BLL coding within flowcards.\nInstall the Better Logic Library App from the Athom Store to use BLL coding.\nSee the BLL App Settings for more information.` });
            } catch (error) {

            }
            this.homey.settings.set('notification_bll_supported', true);
        }
        if (!this.api) {
            try {
                this.api = await this.getAppApi('net.i-dev.betterlogic', 'Better Logic Library', true);//true);
                //if (this.homey.app.id !== 'net.i-dev.betterlogic') 
                this.api.on('realtime', this.realtimeFunction);
            } catch (error) {
                this.homey.error('BL.init', error);
                //initDefer.reject();
                BL._initDefer.resolve(this);
                BL._initDefer = null;
                return this;
            }
        }
        try {
            BL._isLoaded = await this.api.getInstalled();
            if (!BL._isLoaded) {
                if (this.required) {
                    if (!await this.homey.settings.get('notification_bll_required')) {
                        this.homey.notifications.createNotification({ excerpt: `Warning: The Better Logic Library App is required for this app (${this.homey.app.id}) (to support BLL Coding and reduce install size).\nPlease install the Better Logic Library App from the Athom Store.` });
                        this.homey.settings.set('notification_bll_required', true);
                    }
                }
                BL._initDefer.resolve(this);
                BL._initDefer = null;
                return this;
            } else this.homey.settings.set('notification_bll_required', true);

        } catch (error) {
            BL._initDefer.resolve(this);
            BL._initDefer = null;
            return this;
        }
        try {
            //if(BL.Current.isReady) return this;
            let bll = this.initBll().then(x => { BL._defer.resolve(this); }).catch(x => {
                //defer.resolve(this);

                // if (this.silent === false) {
                //     this.homey.notifications.createNotification({ excerpt: `Warning: Better Logic Library could not be loaded and is required (for full functionality). Install the Better Logic Library App to continue to use this app (${this.homey.app.id}).` });
                //     defer.reject(new Error('The Better Logic Library could not be loaded.'));
                // } 
                // else if (!this.required) defer.resolve(this); else defer.reject(x); 
            });
            let result = await bll;
            BL._initDefer.resolve(this);

            return this;
        } catch (error) {
            if (BL._initDefer) BL._initDefer.resolve(this);
            BL._initDefer = null;
            return this;
        }
    }

    /**
     * @type {Promise<any>}
     * @memberof BL
     */
    get ready() { return BL._ready; }

    /** @private */
    async initBll() {
        let version;
        try {
            version = await this.api.getVersion();
        } catch (error) {

        }
        BL.homey.log('initBll');
        if (version && version === BL._version && process.env.DEBUG !== '1') return this;
        BL.homey.log('initBll version change');
        //let bllFile = this.bllFile;
        try {
            //if (!this.bllFile) 
            this.bllFile = await this.getLibrary('bll');
        } catch (error) {
            throw new Error('The Better Logic Library app is not started.');
            //throw error;
        }
        //this.bllFile = bllFile;
        try {
            const bll = this.requireFromString(this.bllFile.file, 'bll');
            delete this.bllFile; //Remove the String for performance
            let old_bll = this.l;
            //if(old_bll) return this;

            if (true || !old_bll) {
                this._l = await new bll.BLL({ homey: this.homey, modules: this.modules, silent: this.silent });
                BL._L = bll.BLL;
                if (old_bll) old_bll.destroy();
            } else {
                await new bll.BLL({ homey: this.homey, modules: this.modules, silent: this.silent });
            }
            BL._version = version;// || await this.api.getVersion();
        } catch (error) {
            BL.homey.error('BL.initBll', error);
        }
        return this;
    }

    /** @private */
    async getLibrary(libraryName) {
        let defer = new Defer();
        defer.promise.then(() => { }).catch(() => { });
        BL.homey.setTimeout(() => (!defer || defer.isDefered ? null : defer.reject('Timeout: 5000')) & (defer = null), 5000);
        try {
            this.getAppApi('net.i-dev.betterlogic', 'Better Logic Library').then((api) => {
                try {
                    api.get('/library/' + libraryName).then((x) => !defer || defer.isDefered ? null : defer.resolve(x) & (defer = null)).catch(err => !defer || defer.isDefered ? null : defer.reject(err) & (defer = null));
                } catch (err) { // Try once more.                                        
                    defer.reject(new Error(err));
                    // try {
                    //     defer.resolve(api.get('/library/' + libraryName));
                    // } catch (error) {
                    //     defer.reject(new Error(error));
                    //     //throw new Error(error);
                    // }
                }
            }).catch(err => !defer || defer.isDefered ? null : defer.reject(err) & (defer = null));

        } catch (err) {
            console.log(err);
            if (defer) defer.reject(new Error(err));
            defer = null;
            //throw new Error(err);
        }
        return defer.promise;
    }

    /** @private */
    requireFromString(src, filename) {
        let m = new module.constructor();
        m.paths = module.paths;
        m._compile(src, filename || '');
        return m.exports;
    }

    /** @private */
    async getAppApi(appId, appname, onlyApi) {
        try {
            if (!this.api) this.api = this.homey.api.getApiApp(appId);
        } catch (error) {
            throw new Error(error);
        }
        if (onlyApi === true) return this.api;
        if (!this.api) throw new Error(appname + ' is not installed.');
        else {
            try {
                BL._isLoaded = await this.api.getInstalled();
            } catch (error) { }
            if (!BL._isLoaded) throw new Error(appname + ' is not installed.');
        }
        return this.api;
    }

    /**
     * @override Setable member, when set, will be activated on any variable update.
     * @param {Object} param0.variable 
     */
    static async onVariableUpdate({variable, date}) {
        //BL.homey.log('realtime variable update', variable);
        
    }


    static async getVariables() {
        return await BL.Current.getVariables();
    }

    async getVariables() {
        const api = await this.getAppApi('net.i-dev.betterlogic', 'Better Logic Library');
        return await api.get('/all');
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
            this.timeout = BL.homey.setTimeout(function () {
                if (!this.isDefered && this.promise) {
                    this.reject();
                    //if (this.promise.resolve) this.promise.resolve();
                    if (onTimeout) onTimeout();
                }
            }.bind(this), timeout);
        }
        if (originalPromise && originalPromise.then) originalPromise.then((val1, val2, val3, val4) => this.resolve(val1, val2, val3, val4)).catch((val1, val2, val3, val4) => this.reject(val1, val2, val3, val4));
    }
    then(fun) { this._promise.then(fun); return this; }
    catch(fun) { this._promise.catch(fun); return this; }
    finally(fun) { this._promise.finally(fun); return this; }
    resolve(val1, val2, val3, val4) { if (this.timeout) clearTimeout(this.timeout); this.isDefered = true; this._resolve(val1, val2, val3, val4); return this.promise; }
    reject(val1, val2, val3, val4) { if (this.timeout) clearTimeout(this.timeout); this.isDefered = true; this._reject(val1, val2, val3, val4); return this.promise; }
}


module.exports = { BL, Defer };