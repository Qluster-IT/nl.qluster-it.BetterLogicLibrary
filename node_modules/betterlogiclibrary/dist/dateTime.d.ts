export = DateTime;
declare class DateTime {
    static get locale(): any;
    static get timeZone(): any;
    static get date(): Date;
    /** @type {Codes} @private */
    private static get codes();
    /** @private */
    private static init;
    static destroy(): void;
    /**
     *
     * @param {String|String[]} format
     * @param {String|String[]|Number|Number[]|Date|Date[]} date
     * @param {String} locale
     * @param {String} timeZone
     * @returns
     */
    static toString(format: string | string[], date: string | string[] | number | number[] | Date | Date[], locale: string, timeZone: string): any;
    /**
     *
     * @param {Date} date
     * @returns
     */
    static fromUTC(date: Date): Date;
    /** @private */
    private static convertToDate;
    /** @private */
    private static updateFormats;
    static get(dt: any): DateTime;
    /** @private */
    private static dateTimeCodes;
    /** @private */
    private static dateCodes;
    /** @private */
    private static timeCodes;
    /** @private */
    private static dayPeriodCodes;
    /** @private */
    private static eraCodes;
    /** @private */
    private static timeZoneCodes;
    /** @private */
    private static yearCodes;
    /** @private */
    private static monthCodes;
    /** @private */
    private static dayCodes;
    /** @private */
    private static hourCodes;
    /** @private */
    private static hour12Codes;
    /** @private */
    private static amPmCodes;
    /** @private */
    private static minuteCodes;
    /** @private */
    private static secondCodes;
    /** @private */
    private static fractionalSecondCodes;
    /** @private */
    private static isoCodes;
    constructor(locale: any, timeZone: any, date: any);
    set locale(arg: any);
    get locale(): any;
    set timeZone(arg: any);
    get timeZone(): any;
    set date(arg: any);
    get date(): any;
    /** @private */
    private get;
    /** @private */
    private getString;
    /**
     * @param {"full"|"long"|"medium"|"short"} format * @returns {String}
     */
    getDateTimeByFormat(format: "full" | "long" | "medium" | "short"): string;
    /**
     * @param {"full"|"long"|"medium"|"short"} format * @returns {String}
     */
    getDateByFormat(format: "full" | "long" | "medium" | "short"): string;
    /**
     * @param {"full"|"long"|"medium"|"short"} format * @returns {String}
     */
    getTimeByFormat(format: "full" | "long" | "medium" | "short"): string;
    /**
     * @param {"narrow"|"short"|"long"} format * @returns {String}
     */
    getDayPeriodByFormat(format: "narrow" | "short" | "long"): string;
    /**
     * @param {"long"|"short"|"narrow"} format * @returns {String}
     */
    getEraByFormat(format: "long" | "short" | "narrow"): string;
    /**
     * @param {"KK"|"K"|"kk"|"k"|"z"|"zz"|"Z"|"ZZ"} format * @returns {String}
     */
    getTimeZoneByFormat(format: "KK" | "K" | "kk" | "k" | "z" | "zz" | "Z" | "ZZ"): string;
    /**
     * @param {"numeric"|"2-digit"} format * @returns {String}
     */
    getYearByFormat(format: "numeric" | "2-digit"): string;
    /**
     * @param {"numeric"|"2-digit"|"long"|"short"|"narrow"} format * @returns {String}
     */
    getMonthByFormat(format: "numeric" | "2-digit" | "long" | "short" | "narrow"): string;
    /**
     * @param {"numeric"|"2-digit"} format * @returns {String}
     */
    getDayByFormat(format: "numeric" | "2-digit"): string;
    /**
     * @param {"numeric"|"2-digit"} format * @returns {String}
     */
    getHourByFormat(format: "numeric" | "2-digit"): string;
    /**
     * @param {"numeric"|"2-digit"} format * @returns {String}
     */
    getHour12ByFormat(format: "numeric" | "2-digit"): string;
    /**
     * @param {"numeric"|"2-digit"} format * @returns {String}
     */
    getMinuteByFormat(format: "numeric" | "2-digit"): string;
    /**
     * @param {"numeric"|"2-digit"} format * @returns {String}
     */
    getSecondByFormat(format: "numeric" | "2-digit"): string;
    /**
     * @param {1,2,3} digits * @returns {String}
     */
    getFractionalSecondByFormat(digits: any): string;
    /**
     * @param {"long"|"short"|"narrow"} format * @returns {String}
     */
    getWeekdayByFormat(format: "long" | "short" | "narrow"): string;
    /**
     * @param {"DATETIMELONG"|"datetimelong"|"DATETIME"|"datetime"|"datetimeshort"} code * @returns {String}
     */
    getDateTime(code: "DATETIMELONG" | "datetimelong" | "DATETIME" | "datetime" | "datetimeshort"): string;
    /**
     * @param {"DATELONG"|"datelong"|"DATE"|"date"|"dateshort"} code * @returns {String}
     */
    getDate(code: "DATELONG" | "datelong" | "DATE" | "date" | "dateshort"): string;
    /**
     * @param {"TIMELONG"|"timelong"|"TIME"|"time"|"timeshort"} code * @returns {String}
     */
    getTime(code: "TIMELONG" | "timelong" | "TIME" | "time" | "timeshort"): string;
    /**
     * @param {"PERIOD"|"period"} code * @returns {String}
     */
    getDayPeriod(code: "PERIOD" | "period"): string;
    /**
     * @param {"ERA"|"era"} code * @returns {String}
     */
    getEra(code: "ERA" | "era"): string;
    /**
     * @param {"KK"|"kk"|"z"|"zz"|"Z"|"ZZ"} code * @returns {String}
     */
    getTimeZone(code: "KK" | "kk" | "z" | "zz" | "Z" | "ZZ"): string;
    /**
     * @param {"yyyy"|"yy"} code * @returns {String}
     */
    getYear(code: "yyyy" | "yy"): string;
    /**
     * @param {"MMMM"|"MMM"|"MM"|"M"} format * @returns {String}
     */
    getMonth(code: any): string;
    /**
     * @param {"dddd"|"ddd"|"dd"|"d"} format * @returns {String}
     */
    getDay(code: any): string;
    /**
     * @param {"HH"|"H"} format * @returns {String}
     */
    getHour(code: any): string;
    /**
     * @param {"hh"|"h"} format * @returns {String}
     */
    getHour12(code: any): string;
    /**
     * @param {"tt"} format * @returns {String}
     */
    getAmPm(code: any): string;
    /**
     * @param {"mm"|"m"} format * @returns {String}
     */
    getMinute(code: any): string;
    /**
     * @param {"ss"|"s"} format * @returns {String}
     */
    getSecond(code: any): string;
    /**
     * @param {"fff"|"ff"|"f"} format * @returns {String}
     */
    getFractionalSecond(code: any): string;
    /**
     * @param {"ISO"} format * @returns {String}
     */
    getIso(code: any): string;
    toString(format: any): any;
    /** @private */
    private formatCustom;
    /** @private */
    private format;
}
//# sourceMappingURL=dateTime.d.ts.map