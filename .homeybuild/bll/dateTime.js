//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters

//https://learn.microsoft.com/en-us/dotnet/standard/base-types/custom-date-and-time-format-strings
//https://docs.angularjs.org/api/ng/filter/date

//const { BL } = require("./lib/bll/bl.js");
const { BL } = require("./../lib/bll/bl");

let _locale, _timeZone, _date, _codes;

class dateTimeStatics { }

class Codes {

  constructor() {    
    this.dayPeriodCodesArr = BL._.sortBy(BL._.map(DateTime.dayPeriodCodes, (x, key) => { return { key, val: x } }, 'key.length'));
    this.dateTimeCodesArr = BL._.sortBy(BL._.map(DateTime.dateTimeCodes, (x, key) => { return { key, val: x } }, 'key.length'));
    this.dateCodesArr = BL._.sortBy(BL._.map(DateTime.dateCodes, (x, key) => { return { key, val: x } }, 'key.length'));
    this.timeCodesArr = BL._.sortBy(BL._.map(DateTime.timeCodes, (x, key) => { return { key, val: x } }, 'key.length'));
    this.eraCodesArr = BL._.sortBy(BL._.map(DateTime.eraCodes, (x, key) => { return { key, val: x } }, 'key.length'));
    this.yearCodesArr = BL._.sortBy(BL._.map(DateTime.yearCodes, (x, key) => { return { key, val: x } }, 'key.length'));
    this.monthCodesArr = BL._.sortBy(BL._.map(DateTime.monthCodes, (x, key) => { return { key, val: x } }, 'key.length'));
    this.dayCodesArr = BL._.sortBy(BL._.map(DateTime.dayCodes, (x, key) => { return { key, val: x } }, 'key.length'));
    this.hourCodesArr = BL._.sortBy(BL._.map(DateTime.hourCodes, (x, key) => { return { key, val: x } }, 'key.length'));
    this.minuteCodesArr = BL._.sortBy(BL._.map(DateTime.minuteCodes, (x, key) => { return { key, val: x } }, 'key.length'));
    this.secondCodesArr = BL._.sortBy(BL._.map(DateTime.secondCodes, (x, key) => { return { key, val: x } }, 'key.length'));
    this.fractionalSecondCodesArr = BL._.sortBy(BL._.map(DateTime.fractionalSecondCodes, (x, key) => { return { key, val: x } }, 'key.length'));

    this.arrays = {};
    this.arrays['dayPeriodCodesArr'] = 'getDayPeriod';
    this.arrays['dateTimeCodesArr'] = 'getDateTime';
    this.arrays['dateCodesArr'] = 'getDate';
    this.arrays['timeCodesArr'] = 'getTime';
    this.arrays['eraCodesArr'] = 'getEra';
    this.arrays['yearCodesArr'] = 'getYear';
    this.arrays['monthCodesArr'] = 'getMonth';
    this.arrays['dayCodesArr'] = 'getDay';
    this.arrays['hourCodesArr'] = 'getHour';
    this.arrays['minuteCodesArr'] = 'getMinute';
    this.arrays['secondCodesArr'] = 'getSecond';
    this.arrays['fractionalSecondCodesArr'] = 'getFractionalSecond';
    this.array = BL._.sortBy(BL._.flatMap(this.arrays, (val, key)=> { return BL._.map(this[key], (code, format)=> { return { code:code.key, format:code.val, func:val };  });  }), (x)=>-x.code.length); //return { name:key, func:val, list:this[key]}; });
  }
}

class DateTime {

  static get locale() { return dateTimeStatics.locale; }

  static get timeZone() { return dateTimeStatics.timeZone; }

  static get date() { return new Date(); }
  
  static get codes() {    
    if(!dateTimeStatics.codes) {
      dateTimeStatics.codes = new Codes();
      console.log('ALERT: dateTimeStatics.codes = new Codes();');
    }
    return dateTimeStatics.codes;
  }

  static async init(bll) {
    dateTimeStatics.locale = await bll.get('locale') || await BL.homey.i18n.getLanguage();
    dateTimeStatics.timeZone = BL.homey.clock.getTimezone();    
    bll.api.on('realtime', (event, data)=> {
      switch (event) {
        case "bllSetLocale": dateTimeStatics.locale = data.default; BL.homey.log('bllSetLocale', data);
      }
    });
  }

  static toString(format, date, locale, timeZone) {
    if(!format) throw new Error("Format is required.");
    BL.homey.log('datetime.toString', arguments);
    if(!date || !BL._.isArray(date)) {
      let dt = new DateTime(locale || DateTime.locale, timeZone || DateTime.timeZone, date? DateTime.convertToDate(date) : DateTime.date);
      return dt.toString(format);
    } else if (BL._.isArray(date)){
      BL.homey.log('isArray');
      let r = {};
      for (const _date of date) {
        //BL.homey.log(new DateTime(locale || DateTime.locale, timeZone || DateTime.timeZone, DateTime.convertToDate(_date)).toString(format));
        try {         
          if(Object.keys(r).indexOf(_date)===-1) r[_date] = new DateTime(locale || DateTime.locale, timeZone || DateTime.timeZone, DateTime.convertToDate(_date)).toString(format); 
        } catch (error) {
          BL.homey.error(error); }
      }
      return r;
    }
  }
  static convertToDate(date) {
    if(!date) return date;
    if(date instanceof Date) return date;
    if(typeof(date)=='string' && date.length==="2022-11-10T19:17:01.439Z".length && date.endsWith('Z') && date.substr(10,1)=='T') return new Date(date);
    if(typeof(date)=='number') return new Date(date);
  }

  static get(dt) { return new DateTime(DateTime.locale, DateTime.timeZone, dt || DateTime.date); }



  get locale() { return _locale; }
  set locale(v) { _locale = v; }

  get timeZone() { return _timeZone; }
  set timeZone(v) { _timeZone = v; }

  get date() { return _date; }
  set date(v) { _date = v; }
  
  get(dt) { return new DateTime(this.locale, this.timeZone, dt || new Date()); }


  constructor(locale, timeZone, date) {
    this.locale = locale;
    this.timeZone = timeZone;
    this.date = date;
  }

  getString(options) {
    options.timeZone = this.timeZone;
    //BL.homey.log('getString', this.locale, (this.date || new Date()).toLocaleString(this.locale, options));
    return (this.date || new Date()).toLocaleString(this.locale, options);
  }
  // getNow() {
  //   let r =  (this.date||new Date()).toLocaleString(this.locale,
  //     {
  //     hour12: false,
  //     timeZone: this.timeZone,
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     day: "2-digit",
  //     month: "2-digit",
  //     second: "2-digit",
  //     year: "numeric"
  //     });
  //     return r;
  // }  


  /**
   * @param {"full"|"long"|"medium"|"short"} format * @returns {String}
   */
  getDateTimeByFormat(format) {
    return this.getString({ dateStyle: format || 'full', timeStyle: format || 'full' });
  }


  /**
   * @param {"full"|"long"|"medium"|"short"} format * @returns {String}
   */
  getDateByFormat(format) {
    return this.getString({ dateStyle: format || 'full' });
  }

  /**
   * @param {"full"|"long"|"medium"|"short"} format * @returns {String}
   */
  getTimeByFormat(format) {
    return this.getString({ timeStyle: format || 'full' });
  }


  /**
   * @param {"narrow"|"short"|"long"} format * @returns {String}
   */
  getDayPeriodByFormat(format) {
    return this.getString({ dayPeriod: format || 'narrow', hour12: true });
  }

  /** 
   * @param {"long"|"short"|"narrow"} format * @returns {String}
   */
  getEraByFormat(format) {
    let year = new Date().getUTCFullYear();
    return this.getString({ era: format || 'long', year: 'numeric' }).replace(year, '').replace(year - 1, '').replace(year + 1, '').trim();
  }

  /**
   * @param {"numeric"|"2-digit"} format * @returns {String}
   */
  getYearByFormat(format) {
    return this.getString({ year: format || 'numeric' });
  }

  /**
   * @param {"numeric"|"2-digit"|"long"|"short"|"narrow"} format * @returns {String}
   */
  getMonthByFormat(format) {
    return this.getString({ month: format || 'numeric' });
  }

  /**
   * @param {"numeric"|"2-digit"} format * @returns {String}
   */
  getDayByFormat(format) {
    return this.getString({ day: format || 'numeric' });
  }

  /**
   * @param {"numeric"|"2-digit"} format * @returns {String}
   */
  getHourByFormat(format) {
    let r = this.getString({ hour: format || 'numeric', hour12:false });
    return format == '2-digit' ? r.padStart(2, '0') : r;
  }

  /**
   * @param {"numeric"|"2-digit"} format * @returns {String}
   */
  getMinuteByFormat(format) {
    let r = this.getString({ minute: format || 'numeric' });
    return format == '2-digit' ? r.padStart(2, '0') : r;
  }

  /**
   * @param {"numeric"|"2-digit"} format * @returns {String}
   */
  getSecondByFormat(format) {
    let r = this.getString({ second: format || 'numeric' });
    return format == '2-digit' ? r.padStart(2, '0') : r;
  }

  /**
   * @param {1,2,3} digits * @returns {String}
   */
  getFractionalSecondByFormat(digits) {
    return this.getString({ fractionalSecondDigits: digits || 3 });
  }

  /**
   * @param {"long"|"short"|"narrow"} format * @returns {String}
   */
  getWeekdayByFormat(format) {
    return this.getString({ weekday: format || 'long' });
  }



  static dateTimeCodes = { 'DATETIMELONG': 'full', 'datetimelong': 'full', 'datetimeshort': 'short', 'LONGDATETIME': 'full', 'longdatetime': 'full', 'shortdatetime': 'short', 'DATETIME': 'long', 'datetime': 'medium' };
  /**
   * @param {"DATETIMELONG"|"datetimelong"|"DATETIME"|"datetime"|"datetimeshort"} code * @returns {String}
   */
  getDateTime(code) {
    return this.getDateTimeByFormat(code && DateTime.dateTimeCodes[code] ? DateTime.dateTimeCodes[code] : 'long');
  }


  static dateCodes = { 'DATELONG': 'full', 'datelong': 'full', 'dateshort': 'short',  'LONGDATE': 'full', 'longdate': 'full', 'shortdate': 'short', 'DATE': 'long', 'date': 'medium' };
  /**
   * @param {"DATELONG"|"datelong"|"DATE"|"date"|"dateshort"} code * @returns {String}
   */
  getDate(code) {
    return this.getDateByFormat(code && DateTime.dateCodes[code] ? DateTime.dateCodes[code] : 'long');
  }

  static timeCodes = { 'TIMELONG': 'full', 'timelong': 'full', 'timeshort': 'short', 'LONGTIME': 'full', 'longtime': 'full', 'shorttime': 'short', 'TIME': 'long', 'time': 'medium' };
  /**
   * @param {"TIMELONG"|"timelong"|"TIME"|"time"|"timeshort"} code * @returns {String}
   */
  getTime(code) {
    return this.getTimeByFormat(code && DateTime.timeCodes[code] ? DateTime.timeCodes[code] : 'long');
  }

  static dayPeriodCodes = { 'PERIOD': 'long', 'period': 'short' };
  /**
   * @param {"PERIOD"|"period"} code * @returns {String}
   */
  getDayPeriod(code) {
    return this.getDayPeriodByFormat(code && DateTime.dayPeriodCodes[code] ? DateTime.dayPeriodCodes[code] : 'long');
  }

  static  eraCodes = { 'ERA': 'long', 'era': 'short' };
  /**
   * @param {"ERA"|"era"} code * @returns {String}
   */
  getEra(code) {
    return this.getEraByFormat(code && DateTime.eraCodes[code] ? DateTime.eraCodes[code] : 'long');
  }

  static yearCodes = { 'yyyy': 'numeric', 'yy': '2-digit' };
  /**
   * @param {"yyyy"|"yy"} code * @returns {String}
   */
  getYear(code) {
    return this.getYearByFormat(code && DateTime.yearCodes[code] ? DateTime.yearCodes[code] : 'numeric');
  }

  static monthCodes = { 'MMMM': 'long', 'MMM': 'short', 'MM': '2-digit', 'M': 'numeric' };
  /**
   * @param {"MMMM"|"MMM"|"MM"|"M"} format * @returns {String}
   */
  getMonth(code) {
    return this.getMonthByFormat(code && DateTime.monthCodes[code] ? DateTime.monthCodes[code] : 'numeric');
  }

  static dayCodes = { 'dddd': 'long', 'ddd': 'short', 'dd': '2-digit', 'd': 'numeric' };
  /**
   * @param {"dddd"|"ddd"|"dd"|"d"} format * @returns {String}
   */
  getDay(code) {
    return code == 'dddd' || code == 'ddd' ? (this.getWeekdayByFormat(code && DateTime.dayCodes[code] ? DateTime.dayCodes[code] : 'numeric')) : (this.getDayByFormat(code && DateTime.dayCodes[code] ? DateTime.dayCodes[code] : 'numeric'));
  }

  static hourCodes = { 'HH': '2-digit', 'H': 'numeric' };
  /**
   * @param {"HH"|"H"} format * @returns {String}
   */
  getHour(code) {
    return this.getHourByFormat(code && DateTime.hourCodes[code] ? DateTime.hourCodes[code] : 'numeric');
  }

  static minuteCodes = { 'mm': '2-digit', 'm': 'numeric' };
  /**
   * @param {"mm"|"m"} format * @returns {String}
   */
  getMinute(code) {
    return this.getMinuteByFormat(code && DateTime.minuteCodes[code] ? DateTime.minuteCodes[code] : 'numeric');
  }

  static secondCodes = { 'ss': '2-digit', 's': 'numeric' };
  /**
   * @param {"ss"|"s"} format * @returns {String}
   */
  getSecond(code) {
    return this.getSecondByFormat(code && DateTime.secondCodes[code] ? DateTime.secondCodes[code] : 'numeric');
  }


  static fractionalSecondCodes = { 'fff': 3, 'ff': 2, 'f': 1 };
  /**
   * @param {"fff"|"ff"|"f"} format * @returns {String}
   */
  getFractionalSecond(code) {
    return this.getFractionalSecondByFormat(code && DateTime.fractionalSecondCodes[code] ? DateTime.fractionalSecondCodes[code] : 3);
  }



  toString(format) {
    if(!format) return format;
    if(typeof(format)=='string') return this.format(format);
    if(BL._.isArray(format)) {
        let r = {};
        for (const _format of format) {
            if(Object.keys(r).indexOf(_format)===-1) r[_format] = this.format(_format);
        }
        return r;
    }
  }

  /** @private */
  format(coding) {
    if(!coding || !coding.length) return coding;
    let r = '';
    for (let i=0;i<coding.length;i++) {
      let s = false;
      
      BL._.each(DateTime.codes.array, (code,funcKey)=> { 
        if(s) return;
        if(coding.indexOf(code.code)===0) {
          s=true;
          r+= this[code.func](code.code);
          coding = coding.substr(0,i) + coding.substr(i+code.code.length); 
        }        
      });
      i=-1;
      if(s) continue;
      r+=coding[0];
      coding=coding.substr(1);
    }
    return r;
  }





}


// let dateTime = new DateTime('nl', 'Europe/Amsterdam');
// console.log(dateTime.getYearByFormat());
// console.log(dateTime.getMonthByFormat());
// console.log(dateTime.getDayByFormat());
// console.log(dateTime.getHourByFormat());
// console.log(dateTime.getMinuteByFormat());
// console.log(dateTime.getSecondByFormat('2-digit'));
// console.log(dateTime.getFractionalSecondByFormat());
// console.log(dateTime.getDayPeriodByFormat());
// console.log(dateTime.getWeekdayByFormat());

// console.log(' ');

// console.log(dateTime.getYear('yy'));
// console.log(dateTime.getMonth('MM'));
// console.log(dateTime.getDay('dd'));

// console.log(dateTime.getHour('HH'));
// console.log(dateTime.getMinute('mm'));
// console.log(dateTime.getSecond('ss'));
// console.log(dateTime.getNow());
// console.log(dateTime.getFractionalSecondByFormat());
// console.log(dateTime.getDayPeriodByFormat());
// console.log(dateTime.getWeekdayByFormat());


// return dateTime.toString('yyyy-MM-dddd');


module.exports = DateTime;