export = DateTime;
declare class DateTime {
    static get locale(): any;
    static get timeZone(): any;
    static get date(): Date;
    /** @type {Codes} */
    static get codes(): Codes;
    static init(bll: any): Promise<void>;
    static toString(format: any, date: any, locale: any, timeZone: any, ...args: any[]): any;
    static convertToDate(date: any): any;
    static updateFormats(): void;
    static get(dt: any): DateTime;
    static dateTimeCodes: {
        DATETIMELONG: string;
        datetimelong: string;
        datetimeshort: string;
        LONGDATETIME: string;
        longdatetime: string;
        shortdatetime: string;
        DATETIME: string;
        datetime: string;
    };
    static dateCodes: {
        DATELONG: string;
        datelong: string;
        dateshort: string;
        LONGDATE: string;
        longdate: string;
        shortdate: string;
        DATE: string;
        date: string;
    };
    static timeCodes: {
        TIMELONG: string;
        timelong: string;
        timeshort: string;
        LONGTIME: string;
        longtime: string;
        shorttime: string;
        TIME: string;
        time: string;
    };
    static dayPeriodCodes: {
        PERIOD: string;
        period: string;
    };
    static eraCodes: {
        ERA: string;
        era: string;
    };
    static timeZoneCodes: {
        KK: string;
        kk: string;
    };
    static yearCodes: {
        yyyy: string;
        yy: string;
    };
    static monthCodes: {
        MMMM: string;
        MMM: string;
        MM: string;
        M: string;
    };
    static dayCodes: {
        dddd: string;
        ddd: string;
        dd: string;
        d: string;
    };
    static hourCodes: {
        HH: string;
        H: string;
    };
    static hour12Codes: {
        hh: string;
        h: string;
    };
    static amPmCodes: {
        tt: string;
    };
    static minuteCodes: {
        mm: string;
        m: string;
    };
    static secondCodes: {
        ss: string;
        s: string;
    };
    static fractionalSecondCodes: {
        fff: number;
        ff: number;
        f: number;
    };
    static isoCodes: {
        ISO: string;
    };
    constructor(locale: any, timeZone: any, date: any);
    set locale(arg: any);
    get locale(): any;
    set timeZone(arg: any);
    get timeZone(): any;
    set date(arg: any);
    get date(): any;
    get(dt: any): DateTime;
    getString(options: any): any;
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
     * @param {"KK"|"K"|"kk"|"k"} format * @returns {String}
     */
    getTimeZoneByFormat(format: "KK" | "K" | "kk" | "k"): string;
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
     * @param {"KK"|"kk"} code * @returns {String}
     */
    getTimeZone(code: "KK" | "kk"): string;
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
declare class Codes {
    init(): void;
    dateTimeCodesArr: any;
    dateCodesArr: any;
    timeCodesArr: any;
    dayPeriodCodesArr: any;
    eraCodesArr: any;
    isoCodesArr: any;
    timeZoneCodesArr: any;
    yearCodesArr: any;
    monthCodesArr: any;
    dayCodesArr: any;
    hourCodesArr: any;
    hour12CodesArr: any;
    amPmCodesArr: any;
    minuteCodesArr: any;
    secondCodesArr: any;
    fractionalSecondCodesArr: any;
    arrays: {} | undefined;
    array: any;
}
//# sourceMappingURL=dateTime.d.ts.map