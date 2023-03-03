export class BL {
    /** @private @type {BL} */
    private static get Current();
    /** @private @type {import("../dist/bll").BLL */
    private static get L();
    /** @private */
    private static get l();
    /**
     * @description Decode the given {@link String} for any BLL codings and returns the decoded string.
     * @static
     * @async
     * @param {string} text The text which could contain BLL coding and needs be be converted.
     * @return {Promise<string>} A decoded {@link String} if BLL is running, otherwise it will return the original {@link String}.
     * @memberof BL
     */
    static decode(text: string, { locale, timeZone }?: {
        locale: any;
        timeZone: any;
    }, ...args: any[]): Promise<string>;
    static getDownloadUrl({ base64, contentType, buffer, json, text }?: {
        base64: any;
        contentType: any;
        buffer: any;
        json: any;
        text: any;
    }, ...args: any[]): Promise<any>;
    /**
     * Indicates if the BLL has been loaded before     *
     * @static*/
    static get isLoaded(): boolean;
    static isInit(): Promise<boolean>;
    /** @private */
    static set _(arg: any);
    /**
     * @description The lodash library
     * @static*/
    static get _(): any;
    /** @private */
    static set datetime(arg: typeof import("../dist/dateTime"));
    /**
     * @description The DateTime library, used for converting date and times to strings formatted for the user.
     * @type {typeof import('../dist/dateTime')} @static*/
    static get datetime(): typeof import("../dist/dateTime");
    /** @private */
    static set proto(arg: typeof import("../dist/proto"));
    /**
     * @description The DateTime library, used for converting date and times to strings formatted for the user.
     * @type {typeof import('../dist/proto')} @static*/
    static get proto(): typeof import("../dist/proto");
    /**
     *     *
     * @static
     * @param {*} [{ homey, modules, silent, waitTime, required }={}]
     * @return {*}
     */
    static init({ homey, modules, silent, waitTime, required }?: any): any;
    constructor({ homey, modules, silent, waitTime, required }?: {
        homey: any;
        modules: any;
        silent: any;
        waitTime: any;
        required: any;
    });
    /** @private @type {import("../dist/bll").BLL} */
    private get l();
    realtimeFunction(event: any): Promise<void>;
    homey: any;
    required: any;
    silent: any;
    modules: any;
    waitTime: any;
    isReady: boolean;
    init({ reload }?: {
        reload: any;
    }): Promise<any>;
    api: any;
    /**
     * @type {Promise<any>}
     * @memberof BL
     */
    get ready(): Promise<any>;
    /** @private */
    private initBll;
    /** @private */
    private getLibrary;
    /** @private */
    private requireFromString;
    /** @private */
    private getAppApi;
}
export class Defer {
    /**
     * @param {Number} timeout
     */
    constructor(timeout: number, originalPromise: any, onTimeout: any);
    set isDefered(arg: boolean);
    get isDefered(): boolean;
    _isDefered: any;
    set promise(arg: any);
    get promise(): any;
    _promise: any;
    _resolve: any;
    _reject: any;
    timeout: any;
    then(fun: any): Defer;
    catch(fun: any): Defer;
    finally(fun: any): Defer;
    resolve(val1: any, val2: any, val3: any, val4: any): any;
    reject(val1: any, val2: any, val3: any, val4: any): any;
}
//# sourceMappingURL=bl.d.ts.map