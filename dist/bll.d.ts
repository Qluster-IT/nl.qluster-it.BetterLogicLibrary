export class BLL {
    /**@type {BLL} */
    static get Current(): BLL;
    static get _(): any;
    static get math(): any;
    static get datetime(): any;
    static get dateTime(): any;
    /**@type {Homey} */
    static get homey(): Homey;
    /**
     * @param {Object} options
     */
    constructor({ homey, modules, silent }?: Object);
    /**@type {Homey} */
    get homey(): Homey;
    silent: any;
    destroy(): void;
    init({ modules }?: {
        modules: never[];
    }): Promise<BLL>;
    getApi(): Promise<any>;
    api: any;
    getLibrary(libraryName: any): Promise<any>;
    requireFromString(src: any, filename: any): any;
    post(url: any, opt: any): Promise<any>;
    get(url: any, opt: any): Promise<any>;
    getAppApi(appId: any, appname: any): any;
    decode(text: any, date: any, locale: any, timeZone: any, ...args: any[]): Promise<any>;
}
//# sourceMappingURL=bll.d.ts.map