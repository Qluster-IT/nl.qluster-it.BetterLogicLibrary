export class BL {
    /** @private @type {BL} */
    private static get Current();
    /** @private */
    private static get L();
    /** @private */
    private static get l();
    /**
     * @description Decode the given {@link String} for any BLL codings and returns the decoded string.
     * @static
     * @async
     * @param {string} text The text which could contain BLL coding and needs be be converted.
     * @return {string} A decoded {@link String} if BLL is running, otherwise it will return the original {@link String}.
     * @memberof BL
     */
    static decode(text: string, { locale, timeZone }?: {
        locale: any;
        timeZone: any;
    }, ...args: any[]): string;
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
    static readonly set datetime(arg: typeof import("../dist/dateTime"));
    /**
     * @description The DateTime library, used for converting date and times to strings formatted for the user.
     * @type {typeof import('../dist/dateTime')} @readonly @static @memberof BL */
    static readonly get datetime(): typeof import("../dist/dateTime");
    static init({ homey, modules, silent, waitTime, waitForBll }?: {
        homey: any;
        modules: any;
        silent: any;
        waitTime: any;
        waitForBll: any;
    }): Promise<BL>;
    /**
     * Creates an instance of BL.
     * @param {[{ homey:String, modules, silent, waitTime, waitForBll }={ waitForBll: true }]} [{ homey, modules, silent, waitTime, waitForBll }={ waitForBll: true }] @memberof BL
     * @returns {String} Returns a Promise! You can await this contructor.
     */
    constructor({ homey, modules, silent, waitTime, waitForBll }?: [{
        homey: string;
        modules;
        silent;
        waitTime;
        waitForBll;
    }, {
        waitForBll: true;
    }]);
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
//# sourceMappingURL=bl.d.ts.map