var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _version;
var _L; // statics
var _l;
var _, datetime;
var _isLoaded = false;
var BL = /** @class */ (function () {
    /**
     * Creates an instance of BL.
     * @param {[{ homey:String, modules, silent, waitTime, waitForBll }={ waitForBll: true }]} [{ homey, modules, silent, waitTime, waitForBll }={ waitForBll: true }] @memberof BL
     */
    function BL(_a) {
        var _b = _a === void 0 ? { waitForBll: true } : _a, homey = _b.homey, modules = _b.modules, silent = _b.silent, waitTime = _b.waitTime, waitForBll = _b.waitForBll;
        if (BL._current)
            return BL._current;
        BL._current = this;
        BL.homey = homey;
        this.homey = homey;
        this.silent = silent === undefined ? (!modules || !modules.length) : silent;
        this.modules = modules;
        this.waitTime = waitTime;
        this.waitForBll = waitForBll;
        return this.init();
    }
    Object.defineProperty(BL, "Current", {
        /** @private @type {BL} */
        get: function () { return this._current; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BL, "L", {
        /** @private */
        get: function () { return _L; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BL.prototype, "l", {
        /** @private */
        get: function () { return _l; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BL, "l", {
        /** @private */
        get: function () { return BL.L.Current; },
        enumerable: false,
        configurable: true
    });
    /**
     * @description Decode the given {@link String} for any BLL codings and returns the decoded string.
     * @static
     * @async
     * @param {string} text
     * @return {string} A decoded {@link String} if BLL is running, otherwise it will return the original {@link String}.
     * @memberof BL
     */
    BL.decode = function (text, opts) {
        if (opts === void 0) { opts = { locale: locale, timeZone: timeZone }; }
        return __awaiter(this, arguments, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!BL.l && !this.silent)
                            throw new Error('Better Logic Library is not loaded.');
                        if (!BL.l)
                            return [2 /*return*/, !text ? text : typeof (text) == 'object' ? text.text : text];
                        return [4 /*yield*/, BL.l.decode.apply(null, arguments)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Object.defineProperty(BL, "isLoaded", {
        /**
         * Indicates if the BLL has been loaded before     *
         * @readonly @static @memberof BL */
        get: function () { return _isLoaded; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BL, "_", {
        /**
         * @description The lodash library
         * @readonly @static @memberof BL */
        get: function () { if (_)
            return _; throw new Error('BLL: Lodash has not been loaded.'); },
        /** @private */
        set: function (val) { _ = val; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BL, "datetime", {
        /**
         * @description The DateTime library, used for converting date and times to strings formatted for the user.
         * @type {typeof import('../dist/dateTime')} @readonly @static @memberof BL */
        get: function () { if (datetime)
            return datetime; throw new Error('BLL: DateTime has not been loaded.'); },
        /** @private */
        set: function (val) { datetime = val; },
        enumerable: false,
        configurable: true
    });
    /** @private */
    BL.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var defer, _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        defer = new Defer(5 * 60 * 1000, null, function () {
                            if (_this.silent === false) {
                                _this.homey.notifications.createNotification({ excerpt: 'Warning: Better Logic Library could not be loaded and is required! Install the Better Logic Library App to continue to use this app.' });
                                defer.reject(_this);
                            }
                            else
                                defer.resolve(_this);
                        });
                        if (!!this.api) return [3 /*break*/, 3];
                        _a = this;
                        return [4 /*yield*/, this.getAppApi('net.i-dev.betterlogic', 'Better Logic Library', true)];
                    case 1:
                        _a.api = _b.sent();
                        if (this.homey.app.id !== 'net.i-dev.betterlogic')
                            this.api.on('realtime', function (event) { return __awaiter(_this, void 0, void 0, function () {
                                var x;
                                var _this = this;
                                return __generator(this, function (_a) {
                                    if (event === 'running') {
                                        x = function () { return __awaiter(_this, void 0, void 0, function () {
                                            var _a;
                                            var _b;
                                            return __generator(this, function (_c) {
                                                switch (_c.label) {
                                                    case 0:
                                                        _a = this.initBll;
                                                        _b = {};
                                                        return [4 /*yield*/, this.api.getVersion()];
                                                    case 1: return [4 /*yield*/, _a.apply(this, [(_b.version = _c.sent(), _b)])];
                                                    case 2:
                                                        _c.sent();
                                                        if (!defer.isDefered)
                                                            defer.resolve(this);
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); };
                                        if (this.api.getInstalled())
                                            x();
                                        else {
                                            setTimeout(x, 15000);
                                        }
                                    }
                                    return [2 /*return*/];
                                });
                            }); });
                        return [4 /*yield*/, this.api.getInstalled()];
                    case 2:
                        _isLoaded = _b.sent();
                        if (!_isLoaded) {
                            if (!this.waitForBll)
                                defer.resolve();
                            return [2 /*return*/, defer.promise];
                        }
                        _b.label = 3;
                    case 3:
                        this.initBll().then(function (x) { defer.resolve(_this); })["catch"](function (x) { return defer.reject(_this); });
                        return [2 /*return*/, defer.promise];
                }
            });
        });
    };
    /** @private */
    BL.prototype.initBll = function (_a) {
        var _b = _a === void 0 ? {} : _a, version = _b.version;
        return __awaiter(this, void 0, void 0, function () {
            var bblFile, bll, old_bll, _c, error_1;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (version && version === _version && process.env.DEBUG !== '1')
                            return [2 /*return*/];
                        return [4 /*yield*/, this.getLibrary('bll')];
                    case 1:
                        bblFile = _d.sent();
                        bll = this.requireFromString(bblFile.file, '');
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 6, , 7]);
                        old_bll = _l;
                        return [4 /*yield*/, new bll.BLL({ homey: this.homey, modules: this.modules, silent: this.silent })];
                    case 3:
                        _l = _d.sent();
                        _L = bll.BLL;
                        if (old_bll)
                            old_bll.destroy();
                        _c = version;
                        if (_c) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.api.getVersion()];
                    case 4:
                        _c = (_d.sent());
                        _d.label = 5;
                    case 5:
                        _version = _c;
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _d.sent();
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/, this];
                }
            });
        });
    };
    /** @private */
    BL.prototype.getLibrary = function (libraryName) {
        return __awaiter(this, void 0, void 0, function () {
            var api;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAppApi('net.i-dev.betterlogic', 'Better Logic Library')];
                    case 1:
                        api = _a.sent();
                        return [4 /*yield*/, api.get('/library/' + libraryName)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /** @private */
    BL.prototype.requireFromString = function (src, filename) {
        var m = new module.constructor();
        m.paths = module.paths;
        m._compile(src, filename || '');
        return m.exports;
    };
    /** @private */
    BL.prototype.getAppApi = function (appId, appname, onlyApi) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.api)
                            this.api = this.homey.api.getApiApp(appId);
                        if (onlyApi === true)
                            return [2 /*return*/, this.api];
                        if (!!this.api) return [3 /*break*/, 1];
                        throw new Error(appname + ' is not installed.');
                    case 1: return [4 /*yield*/, this.api.getInstalled()];
                    case 2:
                        _isLoaded = _a.sent();
                        if (!_isLoaded)
                            throw new Error(appname + ' is not installed.');
                        _a.label = 3;
                    case 3: return [2 /*return*/, this.api];
                }
            });
        });
    };
    return BL;
}());
var Defer = /** @class */ (function () {
    /**
     * @param {Number} timeout
     */
    function Defer(timeout, originalPromise, onTimeout) {
        var _this = this;
        this._promise = new Promise(function (resolve, reject) {
            _this._resolve = resolve;
            _this._reject = reject;
        });
        if (timeout) {
            this.timeout = setTimeout(function () {
                if (!this.isDefered && this.promise) {
                    if (this.promise.resolve)
                        this.promise.resolve();
                    if (onTimeout)
                        onTimeout();
                }
            }.bind(this), timeout);
        }
        if (originalPromise && originalPromise.then)
            originalPromise.then(function (val1, val2, val3, val4) { return _this.resolve(val1, val2, val3, val4); })["catch"](function (val1, val2, val3, val4) { return _this.reject(val1, val2, val3, val4); });
    }
    Object.defineProperty(Defer.prototype, "isDefered", {
        get: function () { return !!this._isDefered; },
        set: function (v) { this._isDefered = v; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Defer.prototype, "promise", {
        get: function () { return this._promise; },
        set: function (v) { this._promise = v; },
        enumerable: false,
        configurable: true
    });
    Defer.prototype.then = function (fun) { this._promise.then(fun); };
    Defer.prototype["catch"] = function (fun) { this._promise["catch"](fun); };
    Defer.prototype["finally"] = function (fun) { this._promise["finally"](fun); };
    Defer.prototype.resolve = function (val1, val2, val3, val4) { if (this.timeout)
        clearTimeout(this.timeout); this.isDefered = true; this._resolve(val1, val2, val3, val4); return this.promise; };
    Defer.prototype.reject = function (val1, val2, val3, val4) { if (this.timeout)
        clearTimeout(this.timeout); this.isDefered = true; this._reject(val1, val2, val3, val4); return this.promise; };
    return Defer;
}());
module.exports = { BL: BL };
