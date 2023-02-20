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
    /**
     * Indicates if the BLL has been loaded before     *
     * @static*/
    static get isLoaded(): boolean;
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
    /** @private @type {import("../dist/bll").BLL} */
    private get l();
    /** @private */
    private init;
    homey: any;
    required: any;
    silent: any;
    modules: any;
    waitTime: any;
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