/**
 * @type {import("./bl.typedef").BL}
 */
export class BL {
    /** @private @type {BL} */
    private static get Current();
    /** @private */
    private static get L();
    /** @private */
    private static get l();
    /** @type {import("./bl.typedef").BL_decode}*/
    static decode(text: string, ...args: any[]): Promise<string>;
    /**
     * Indicates if the BLL has been loaded before     *
     * @readonly @static @memberof BL */
    static readonly get isLoaded(): boolean;
    /** @private */
    static readonly set _(arg: any);
    /**
     * @description The lodash library
     * @readonly @static @memberof BL */
    static readonly get _(): any;
    /** @private */
    static readonly set datetime(arg: import("./bl.typedef").DateTime);
    /**
     * @description The DateTime library, used for converting date and times to strings formatted for the user.
     * @type {import("./bl.typedef").DateTime} @readonly @static @memberof BL */
    static readonly get datetime(): import("./bl.typedef").DateTime;
    /**
     * Creates an instance of BL.
     * @param {[{ homey:String, modules, silent, waitTime, waitForBll }={ waitForBll: true }]} [{ homey, modules, silent, waitTime, waitForBll }={ waitForBll: true }] @memberof BL
     */
    constructor({ homey, modules, silent, waitTime, waitForBll }?: [{
        homey: string;
        modules: any;
        silent: any;
        waitTime: any;
        waitForBll: any;
    }, {
        waitForBll: true;
    }] | undefined);
    /** @private */
    private get l();
    homey: any;
    silent: any;
    modules: any;
    waitTime: any;
    waitForBll: any;
    /** @private */
    private init;
    api: any;
    /** @private */
    private initBll;
    /** @private */
    private getLibrary;
    /** @private */
    private requireFromString;
    /** @private */
    private getAppApi;
}
