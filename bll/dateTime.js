//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters

//https://learn.microsoft.com/en-us/dotnet/standard/base-types/custom-date-and-time-format-strings
//https://docs.angularjs.org/api/ng/filter/date


const { BL } = require("betterlogiclibrary");


let _locale, _timeZone, _date, _codes;

class dateTimeStatics { }

/**
 * Codes
 *
 * @class Codes
 */
class Codes {
  

  constructor() {   
    this.init(); 
  }
  init() {

    /** @private */    
    this.dateTimeCodesArr = BL._.sortBy(BL._.map(DateTime.dateTimeCodes, (x, key) => { return { key, val: x, customisable:true }; }, 'key.length'));
    /** @private */
    this.dateCodesArr = BL._.sortBy(BL._.map(DateTime.dateCodes, (x, key) => { return { key, val: x, customisable:true }; }, 'key.length'));
    /** @private */
    this.timeCodesArr = BL._.sortBy(BL._.map(DateTime.timeCodes, (x, key) => { return { key, val: x, customisable:true }; }, 'key.length'));
    
    
    /** @private */
    this.dayPeriodCodesArr = BL._.sortBy(BL._.map(DateTime.dayPeriodCodes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.eraCodesArr = BL._.sortBy(BL._.map(DateTime.eraCodes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.isoCodesArr = BL._.sortBy(BL._.map(DateTime.isoCodes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.timeZoneCodesArr = BL._.sortBy(BL._.map(DateTime.timeZoneCodes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.yearCodesArr = BL._.sortBy(BL._.map(DateTime.yearCodes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.monthCodesArr = BL._.sortBy(BL._.map(DateTime.monthCodes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.dayCodesArr = BL._.sortBy(BL._.map(DateTime.dayCodes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.hourCodesArr = BL._.sortBy(BL._.map(DateTime.hourCodes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.hour12CodesArr = BL._.sortBy(BL._.map(DateTime.hour12Codes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.amPmCodesArr = BL._.sortBy(BL._.map(DateTime.amPmCodes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.minuteCodesArr = BL._.sortBy(BL._.map(DateTime.minuteCodes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.secondCodesArr = BL._.sortBy(BL._.map(DateTime.secondCodes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.fractionalSecondCodesArr = BL._.sortBy(BL._.map(DateTime.fractionalSecondCodes, (x, key) => { return { key, val: x }; }, 'key.length'));

    /** @private */
    this.arrays = {};
    this.arrays['dayPeriodCodesArr'] = 'getDayPeriod';
    this.arrays['dateTimeCodesArr'] = 'getDateTime';
    this.arrays['dateCodesArr'] = 'getDate';
    this.arrays['timeCodesArr'] = 'getTime';
    this.arrays['eraCodesArr'] = 'getEra';
    this.arrays['isoCodesArr'] = 'getIso';
    this.arrays['timeZoneCodesArr'] = 'getTimeZone';
    this.arrays['yearCodesArr'] = 'getYear';
    this.arrays['monthCodesArr'] = 'getMonth';
    this.arrays['dayCodesArr'] = 'getDay';
    this.arrays['hourCodesArr'] = 'getHour';
    this.arrays['hour12CodesArr'] = 'getHour12';
    this.arrays['amPmCodesArr'] = 'getAmPm';
    this.arrays['minuteCodesArr'] = 'getMinute';
    this.arrays['secondCodesArr'] = 'getSecond';
    this.arrays['fractionalSecondCodesArr'] = 'getFractionalSecond';
    /** @private */
    this.array = BL._.sortBy(BL._.flatMap(this.arrays, (val, key)=> { return BL._.map(this[key], (code, format)=> { return { code:code.key, format:code.val, func:val, customisable:code.customisable };  });  }), (x)=>-x.code.length); //return { name:key, func:val, list:this[key]}; });
  
  }
}

class DateTime {

  static get locale() { return dateTimeStatics.locale; }

  static get timeZone() { return dateTimeStatics.timeZone; }

  static get date() { return new Date(); }

  /** @type {Codes} @private */
  static get codes() {    
    if(!dateTimeStatics.codes) {
      dateTimeStatics.codes = new Codes();
      console.log('ALERT: dateTimeStatics.codes = new Codes();');
    }
    return dateTimeStatics.codes;
  }

  /** @private */
  static async init(bll) {
    let locale = await bll.get('locale');
    
    dateTimeStatics.formats = locale ? locale.dateFormats : undefined;
    dateTimeStatics.customFormats = locale ? locale.customDateFormats : undefined;
    dateTimeStatics.locale = locale ? locale.default : await BL.homey.i18n.getLanguage();
    dateTimeStatics.timeZone = BL.homey.clock.getTimezone();    
    DateTime.updateFormats();
    this.onRealtime = (event, data)=> {
      switch (event) {
        case "bllSetLocale": dateTimeStatics.locale = data.default; dateTimeStatics.formats = data.dateFormats; dateTimeStatics.customFormats = data.customDateFormats; DateTime.updateFormats();
      }
    };
    bll.api.on('realtime', this.onRealtime);
  }
  
  static destroy() {    
    bll.api.off('realtime', this.onRealtime);
  }

  // static getFormats(locale) {
  //   BL.homey.log('getFormats', locale);
  //   let ret = {};
  //   if(!locale) return undefined;
  //   if(locale.dateFormats) ret = locale.dateFormats;
  //   if(locale.customDateFormats && locale.customDateFormats.length) for (let i = 0; i < locale.customDateFormats.length; i++) {
  //     const customDateFormat = locale.customDateFormats[i];
  //     ret[customDateFormat.name] = customDateFormat.format;
  //   }
  //   BL.homey.log('ret', ret);
  //   return ret;
  // }
/**
 * 
 * @param {String|String[]} format 
 * @param {String|String[]|Number|Number[]|Date|Date[]} date 
 * @param {String} locale 
 * @param {String} timeZone 
 * @returns 
 */
  static toString(format, date, locale, timeZone) {
    if(!format) throw new Error("Format is required.");
    BL.homey.log('datetime.toString', arguments);
    BL.homey.log('datetime.toString date', date, date instanceof Date);
    if(!BL._.isArray(date)) {
      let dt = new DateTime(locale, timeZone, date? DateTime.convertToDate(date) : DateTime.date);
      return dt.toString(format);
    } else if (BL._.isArray(date)){
      //BL.homey.log('isArray');
      let r = {};
      for (const _date of date) {
        //BL.homey.log(new DateTime(locale || DateTime.locale, timeZone || DateTime.timeZone, DateTime.convertToDate(_date)).toString(format));
        try {         
          if(Object.keys(r).indexOf(_date)===-1) r[_date] = new DateTime(locale, timeZone, DateTime.convertToDate(_date)).toString(format); 
        } catch (error) {
          BL.homey.error(error); }
      }
      return r;
    }
  }
  
  /** @private */
  static convertToDate(date) {
    if(!date) return date;
    if(date instanceof Date) return date;
    if(typeof(date)=='string' && date.length==="2022-11-10T19:17:01.439Z".length && date.endsWith('Z') && date.substr(10,1)=='T') return new Date(date);
    if(typeof(date)=='object' && date.getTime) return new Date(date.getTime());
    if(typeof(date)=='string' && /^\d+$/.test(date)) return new Date(Number.parseInt(date));
    if(typeof(date)=='number') return new Date(date);    
    if(typeof(date)=='string' ) return new Date(date); // EN by default!
  }

  /** @private */
  static updateFormats() {
    this.codes.init();
    if(dateTimeStatics.formats) for (const format in dateTimeStatics.formats) {
      if (Object.hasOwnProperty.call(dateTimeStatics.formats, format)) {
        const customFormat = dateTimeStatics.formats[format];
        let f = BL._.find(this.codes.array, a=> a.customisable && a.code===format );
        if(f) {
          //BL.homey.log('f before: ', f);
          f.originalFunc = f.func;
          f.format = customFormat;
          f.func = 'formatCustom';
          f.customized = true;
          //BL.homey.log('f after : ', f);
        }
      }
    }
    if(dateTimeStatics.customFormats) {
      for (let i = 0; i < dateTimeStatics.customFormats.length; i++) {
      const format = dateTimeStatics.customFormats[i];      
      this.codes.array.push({format:format.format, func:'formatCustom', originalFunc:'formatCustom', customized:true, code:format.name, custom:true});
      //const customFormat = dateTimeStatics.customFormats[format];
      // let f = BL._.find(this.codes.array, a=> a.customisable && a.code===format );
      // if(f) {
      //   //BL.homey.log('f before: ', f);
      //   f.originalFunc = f.func;
      //   f.format = customFormat;
      //   f.func = 'formatCustom';
      //   f.customized = true;
      //   //BL.homey.log('f after : ', f);
      // }
      }
      this.codes.array = BL._.sortBy(this.codes.array, (x)=>-x.code.length);
    }
    BL.homey.log('updateFormats', this.codes.array);
  }

  static get(dt) { return new DateTime(undefined, undefined, dt || DateTime.date); }



  get locale() { return _locale; }
  set locale(v) { _locale = v; }

  get timeZone() { return _timeZone; }
  set timeZone(v) { _timeZone = v; }

  get date() { return _date; }
  set date(v) { _date = v; }
  
  /** @private */
  get(dt) { return new DateTime(this.locale, this.timeZone, dt || new Date()); }


  constructor(locale, timeZone, date) {
    this.locale = locale;
    this.timeZone = timeZone;
    this.date = date;
  }

  /** @private */
  getString(options) {
    options.timeZone = this.timeZone || DateTime.timeZone;
    //BL.homey.log('getString', this.locale, (this.date || new Date()).toLocaleString(this.locale, options));
    return (this.date || new Date()).toLocaleString(this.locale || DateTime.locale, options);
  }
  
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
    return removeYear(this.getString({ era: format || 'long', year: 'numeric' }));
  }

  
  /** 
   * @param {"KK"|"K"|"kk"|"k"} format * @returns {String}
   */
   getTimeZoneByFormat(format) {
    let c;
    switch (format) {
      case "KK":c='long';break;
      case "kk":c='short';break;
    }
    let s = this.getSecondByFormat("numeric");
    return this.getString({ second: 'numeric', timeZoneName:c }).substr(s.length).trim();

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
   getHour12ByFormat(format) {
    let r = this.getString({ hour: format || 'numeric', hour12:true });
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



  /** @private */
  static dateTimeCodes = { 'DATETIMELONG': 'full', 'datetimelong': 'full', 'datetimeshort': 'short', 'LONGDATETIME': 'full', 'longdatetime': 'full', 'shortdatetime': 'short', 'DATETIME': 'long', 'datetime': 'medium' };
  /**
   * @param {"DATETIMELONG"|"datetimelong"|"DATETIME"|"datetime"|"datetimeshort"} code * @returns {String}
   */
  getDateTime(code) {
    return this.getDateTimeByFormat(code && DateTime.dateTimeCodes[code] ? DateTime.dateTimeCodes[code] : 'long');
  }


  /** @private */
  static dateCodes = { 'DATELONG': 'full', 'datelong': 'full', 'dateshort': 'short',  'LONGDATE': 'full', 'longdate': 'full', 'shortdate': 'short', 'DATE': 'long', 'date': 'medium' };
  /**
   * @param {"DATELONG"|"datelong"|"DATE"|"date"|"dateshort"} code * @returns {String}
   */
  getDate(code) {
    return this.getDateByFormat(code && DateTime.dateCodes[code] ? DateTime.dateCodes[code] : 'long');
  }

  /** @private */
  static timeCodes = { 'TIMELONG': 'full', 'timelong': 'full', 'timeshort': 'short', 'LONGTIME': 'full', 'longtime': 'full', 'shorttime': 'short', 'TIME': 'long', 'time': 'medium' };
  /**
   * @param {"TIMELONG"|"timelong"|"TIME"|"time"|"timeshort"} code * @returns {String}
   */
  getTime(code) {
    return this.getTimeByFormat(code && DateTime.timeCodes[code] ? DateTime.timeCodes[code] : 'long');
  }

  /** @private */
  static dayPeriodCodes = { 'PERIOD': 'long', 'period': 'short' };
  /**
   * @param {"PERIOD"|"period"} code * @returns {String}
   */
  getDayPeriod(code) {
    return this.getDayPeriodByFormat(code && DateTime.dayPeriodCodes[code] ? DateTime.dayPeriodCodes[code] : 'long');
  }

  /** @private */
  static  eraCodes = { 'ERA': 'long', 'era': 'short' };
  /**
   * @param {"ERA"|"era"} code * @returns {String}
   */
  getEra(code) {
    return this.getEraByFormat(code && DateTime.eraCodes[code] ? DateTime.eraCodes[code] : 'long');
  }

  

  /** @private */
  static timeZoneCodes = { 'KK': 'KK', 'kk':'kk' };
  /**
   * @param {"KK"|"kk"} code * @returns {String}
   */
  getTimeZone(code) {
    return this.getTimeZoneByFormat(code);
  }

  /** @private */
  static yearCodes = { 'yyyy': 'numeric', 'yy': '2-digit' };
  /**
   * @param {"yyyy"|"yy"} code * @returns {String}
   */
  getYear(code) {
    return this.getYearByFormat(code && DateTime.yearCodes[code] ? DateTime.yearCodes[code] : 'numeric');
  }

  /** @private */
  static monthCodes = { 'MMMM': 'long', 'MMM': 'short', 'MM': '2-digit', 'M': 'numeric' };
  /**
   * @param {"MMMM"|"MMM"|"MM"|"M"} format * @returns {String}
   */
  getMonth(code) {
    return this.getMonthByFormat(code && DateTime.monthCodes[code] ? DateTime.monthCodes[code] : 'numeric');
  }

  /** @private */
  static dayCodes = { 'dddd': 'long', 'ddd': 'short', 'dd': '2-digit', 'd': 'numeric' };
  /**
   * @param {"dddd"|"ddd"|"dd"|"d"} format * @returns {String}
   */
  getDay(code) {
    return code == 'dddd' || code == 'ddd' ? (this.getWeekdayByFormat(code && DateTime.dayCodes[code] ? DateTime.dayCodes[code] : 'numeric')) : (this.getDayByFormat(code && DateTime.dayCodes[code] ? DateTime.dayCodes[code] : 'numeric'));
  }

  /** @private */
  static hourCodes = { 'HH': '2-digit', 'H': 'numeric' };
  /**
   * @param {"HH"|"H"} format * @returns {String}
   */
  getHour(code) {
    return this.getHourByFormat(code && DateTime.hourCodes[code] ? DateTime.hourCodes[code] : 'numeric');
  }

  /** @private */
  static hour12Codes = { 'hh': '2-digit', 'h': 'numeric' };
  /**
   * @param {"hh"|"h"} format * @returns {String}
   */
  getHour12(code) {
    return removeNonNumeric(this.getHour12ByFormat(code && DateTime.hour12Codes[code] ? DateTime.hour12Codes[code] : 'numeric'));
  }
  
  /** @private */
  static amPmCodes = { 'tt': '2-digit' };
  /**
   * @param {"tt"} format * @returns {String}
   */
  getAmPm(code) {
    return removeNumeric(this.getHour12ByFormat('numeric'));
  }
  
  /** @private */
  static minuteCodes = { 'mm': '2-digit', 'm': 'numeric' };
  /**
   * @param {"mm"|"m"} format * @returns {String}
   */
  getMinute(code) {
    return this.getMinuteByFormat(code && DateTime.minuteCodes[code] ? DateTime.minuteCodes[code] : 'numeric');
  }

  /** @private */
  static secondCodes = { 'ss': '2-digit', 's': 'numeric' };
  /**
   * @param {"ss"|"s"} format * @returns {String}
   */
  getSecond(code) {
    return this.getSecondByFormat(code && DateTime.secondCodes[code] ? DateTime.secondCodes[code] : 'numeric');
  }


  /** @private */
  static fractionalSecondCodes = { 'fff': 3, 'ff': 2, 'f': 1 };
  /**
   * @param {"fff"|"ff"|"f"} format * @returns {String}
   */
  getFractionalSecond(code) {
    return this.getFractionalSecondByFormat(code && DateTime.fractionalSecondCodes[code] ? DateTime.fractionalSecondCodes[code] : 3);
  }

  /** @private */
  static isoCodes = { 'ISO': 'ISO' };
  /**
   * @param {"ISO"} format * @returns {String}
   */
  getIso(code) {
    return (this.date || new Date()).toISOString();
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
  formatCustom(coding) {
    return this.format(dateTimeStatics.formats && dateTimeStatics.formats[coding] ? dateTimeStatics.formats[coding] : coding , true);
  }
  /** @private */
  format(coding, noCustomized) {
    if(!coding || !coding.length) return coding;
    let r = '';
    let codes = noCustomized===true ? BL._.filter(DateTime.codes.array, x=>!x.customized) : DateTime.codes.array; 
    //BL.homey.log('format', codes);
    let stringMode = false;
    for (let i=0;i<coding.length;i++) {
      let s = false;

      if(coding.substr(i,2)==="\"\"") {
        r+="\"";
        coding = coding.substr(0,i) + coding.substr(i+2);
        i--;
        continue;
      }
      
      if(coding.substr(i,1)==="\"") {
        stringMode = !stringMode;
        coding = coding.substr(0,i) + coding.substr(i+1);
        i--;
        continue;
      }
      if(stringMode) {
        r+=coding[0];
        coding = coding.substr(0,i) + coding.substr(i+1);
        i--;
        continue;
      }

      // if(!noCustomized) {
      //   if(f) {
      //     //BL.homey.log('f before: ', f);
      //     f.originalFunc = f.func;
      //     f.format = customFormat;
      //     f.func = 'formatCustom';
      //     f.customized = true;
      //     //BL.homey.log('f after : ', f);
      //   }
        
      //   BL._.each(codes, (code,funcKey)=> { 
      //     if(s) return;
      //     if(coding.indexOf(code.code)===0) {
      //       s=true;
      //       if(code.customized && this.locale) r+= this[code.originalFunc](code.code);
      //       else r+= this[code.func](code.code);
      //       coding = coding.substr(0,i) + coding.substr(i+code.code.length); 
      //     }        
      //   });
      // }
      
      BL._.each(codes, (code,funcKey)=> { 
        if(s) return;
        if(coding.indexOf(code.code)===0) {
          //BL.homey.log('code.code', code.code);
          //BL.homey.log('code.code result', this[code.originalFunc](code.code));
          s=true;
          if(code.custom) r+= this[code.func](code.format);
          else if(code.customized && this.locale) r+= this[code.originalFunc](code.code);
          else r+= this[code.func](code.code);
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


function removeYear(str) {
  let year = new Date().getUTCFullYear();
  return str.replace(year, '').replace(year - 1, '').replace(year + 1, '').trim();
}

function removeNumeric(str) {
  return str.replace(/[0-9]/g, '').trim();
}

function removeNonNumeric(str) {
  return str.replace(/[^0-9]/g, '').trim();
}

module.exports = DateTime;