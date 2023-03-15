export class BLL {
    /**@type {BLL} */
    static get Current(): BLL;
    static get _(): any;
    static get math(): any;
    static get datetime(): any;
    static get proto(): any;
    static get json(): any;
    /**@type {Object} */
    static get homey(): any;
    static clearObj(obj: any): void;
    /**
     * @param {Object} options
     */
    constructor({ homey, modules, silent }?: any);
    /**@type {Object} */
    get homey(): any;
    silent: any;
    destroy(): void;
    init({ modules }?: {
        modules: any[];
    }): Promise<BLL>;
    getApi(): Promise<any>;
    api: any;
    getLibrary(libraryName: any): Promise<any>;
    requireFromString(src: any, filename: any): any;
    post(url: any, opt: any): Promise<any>;
    get(url: any, opt: any): Promise<any>;
    getAppApi(appId: any, appname: any): any;
    decode(text: any, { locale, timeZone }?: {
        locale: any;
        timeZone: any;
    }): Promise<any>;
    express(expression: any, contextProperties: any): Promise<any>;
    getDownloadUrl({ base64, contentType, buffer, json, text, filename, callback }?: {
        base64: any;
        contentType: any;
        buffer: any;
        json: any;
        text: any;
        filename: any;
        callback: any;
    }): Promise<any>;
    setDownloadUrl({ link, base64, contentType, buffer, json, text, filename, callback }?: {
        link: any;
        base64: any;
        contentType: any;
        buffer: any;
        json: any;
        text: any;
        filename: any;
        callback: any;
    }): Promise<any>;
}
//# sourceMappingURL=bll.d.ts.map