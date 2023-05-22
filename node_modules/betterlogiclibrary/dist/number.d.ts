export = clsNumber;
declare class clsNumber {
    static get locale(): any;
    /** @private */
    private static init;
    static destroy(): void;
    /**
     *
     * @param {String|String[]} format - Not in use yet
     * @param {String|String[]|clsNumber|clsNumber[]} number
     * @param {clsNumber} decimals
     * @param {String} locale
     * @returns
     */
    static toString(number: string | string[] | clsNumber | clsNumber[], style: any, styleOption1: any, styleOption2: any, decimals: clsNumber, locale: string): any;
    static convertToNumber(number: any): number;
    constructor(locale: any, number: any, decimals: any);
    set locale(arg: any);
    get locale(): any;
    _locale: any;
    set number(arg: any);
    get number(): any;
    _number: any;
    set decimals(arg: any);
    get decimals(): any;
    _decimals: any;
    /** @private */
    private get;
    toString(style: any, styleOption1: any, styleOption2: any, decimals: any): any;
    format(style: any, styleOption1: any, styleOption2: any, decimals: any): any;
    countDecimals(value: any): any;
}
//# sourceMappingURL=number.d.ts.map