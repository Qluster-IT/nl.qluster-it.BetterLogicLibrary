//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters

const _ = require('lodash-core');
class DateTime  {  
	static get locale() { return this._locale; }
	static set locale(v) { this._locale = v; }
  
	static get timeZone() { return this._timeZone; }
	static set timeZone(v) { this._timeZone = v; }

	static get date() { return this._date; }
	static set date(v) { this._date = v; }

    constructor(locale, timeZone, date) {
      this.locale = locale;
      this.timeZone = timeZone;
      
      this.yearCodesArr = _.sortBy(_.map(this.yearCodes, (x, key)=>{return{key,val:x}}, 'key.length'));
      this.monthCodesArr = _.sortBy(_.map(this.monthCodes, (x, key)=>{return{key,val:x}}, 'key.length'));
      this.dayCodesArr = _.sortBy(_.map(this.dayCodes, (x, key)=>{return{key,val:x}}, 'key.length'));
      this.hourCodesArr = _.sortBy(_.map(this.hourCodes, (x, key)=>{return{key,val:x}}, 'key.length'));
      this.minuteCodesArr = _.sortBy(_.map(this.minuteCodes, (x, key)=>{return{key,val:x}}, 'key.length'));
      this.secondCodesArr = _.sortBy(_.map(this.secondCodes, (x, key)=>{return{key,val:x}}, 'key.length'));
      
      this.codes = {};
      this.codes['yearCodesArr'] = this.getYear;
      this.codes['monthCodesArr'] = this.getMonth;
      this.codes['dayCodesArr'] = this.getDay;
      this.codes['hourCodesArr'] = this.getHour;
      this.codes['minuteCodesArr'] = this.getMinute;
      this.codes['secondCodesArr'] = this.getSecond;
    }
    new() {
      return new Datetime(this.locale, this.timeZone, new Date());
    }
    getString(options) {
      //console.log('getString' + JSON.stringify(options));
      options.timeZone = this.timeZone;
      return (this.date||new Date()).toLocaleString(this.locale, options);
    }
    getNow() {
      let r =  (this.date||new Date()).toLocaleString(this.locale,
        {
        hour12: false,
        timeZone: this.timeZone,
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        second: "2-digit",
        year: "numeric"
        });
        return r;
    }
    // /** 
    //  * @param {"long"|"short"|"narrow"} format * @returns {String}
    //  */
    // getEra(format) {
    //   return this.getString({era:format||'long', fractionalSecondDigits:1});
    // }
    /**
     * @param {"numeric"|"2-digit"} format * @returns {String}
     */
    
    getYearByFormat(format) {
      return this.getString({year:format||'numeric'});
    }

    /**
     * @param {"numeric"|"2-digit"|"long"|"short"|"narrow"} format * @returns {String}
     */
    getMonthByFormat(format) {
      return this.getString({month:format||'numeric'});
    }

    /**
     * @param {"numeric"|"2-digit"} format * @returns {String}
     */
    getDayByFormat(format) {
      return this.getString({day:format||'numeric'});
    }

    /**
     * @param {"numeric"|"2-digit"} format * @returns {String}
     */
    getHourByFormat(format) {
      let r = this.getString({hour:format||'numeric'});
      return format=='2-digit' ? r.padStart(2, '0') : r;
    }

    /**
     * @param {"numeric"|"2-digit"} format * @returns {String}
     */
    getMinuteByFormat(format) {
      let r = this.getString({minute:format||'numeric'});
      return format=='2-digit' ? r.padStart(2, '0') : r;
    }

    /**
     * @param {"numeric"|"2-digit"} format * @returns {String}
     */
    getSecondByFormat(format) {
      let r = this.getString({second:format||'numeric'});
      return format=='2-digit' ? r.padStart(2, '0') : r;
    }

    /**
     * @param {1,2,3} digits * @returns {String}
     */
    getFractionalSecondByFormat(digits) {
      return this.getString({fractionalSecondDigits:digits||3});
    }    

    /**
     * @param {"narrow"|"short"|"long"} format * @returns {String}
     */
    getDayPeriodByFormat(format) {
      return this.getString({dayPeriod:format||'narrow', hour12:true});
    }

    /**
     * @param {"long"|"short"|"narrow"} format * @returns {String}
     */
    getWeekdayByFormat(format) {
      return this.getString({weekday:format||'long'});
    }

    /**
     * @param {"yyyy"|"yy"} code * @returns {String}
     */
    yearCodes = {'yyyy':'numeric', 'yy':'2-digit'};
    getYear(code) {
      return this.getYearByFormat(code && this.yearCodes[code] ?  this.yearCodes[code] : 'numeric');
    }

    /**
     * @param {"MMMM"|"MMM"|"MM"|"M"} format * @returns {String}
     */
    monthCodes = {'MMMM':'long', 'MMM':'short', 'MM':'2-digit', 'M':'numeric'};
    getMonth(code) {
      return this.getMonthByFormat(code && this.monthCodes[code] ?  this.monthCodes[code] : 'numeric');
    }

    /**
     * @param {"dddd"|"ddd"|"dd"|"d"} format * @returns {String}
     */
    dayCodes = {'dddd':'long', 'ddd':'short', 'dd':'2-digit', 'd':'numeric'};
    getDay(code) {
      return code=='dddd' || code=='ddd' ? ( this.getWeekdayByFormat(code && this.dayCodes[code] ?  this.dayCodes[code] : 'numeric')) :(this.getDayByFormat(code && this.dayCodes[code] ?  this.dayCodes[code] : 'numeric'));
    }

    /**
     * @param {"hh"|"h"} format * @returns {String}
     */
    hourCodes = {'hh':'2-digit', 'h':'numeric'};
    getHour(code) {
      return this.getHourByFormat(code && this.hourCodes[code] ?  this.hourCodes[code] : 'numeric');
    }

    /**
     * @param {"mm"|"m"} format * @returns {String}
     */
    minuteCodes = {'mm':'2-digit', 'm':'numeric'};
    getMinute(code) {
      return this.getMinuteByFormat(code && this.minuteCodes[code] ?  this.minuteCodes[code] : 'numeric');
    }

    /**
     * @param {"ss"|"s"} format * @returns {String}
     */
    secondCodes = {'ss':'2-digit', 's':'numeric'};
    getSecond(code) {
      return this.getSecondByFormat(code && this.secondCodes[code] ?  this.secondCodes[code] : 'numeric');
    }

    // /**
    //  * @param {1,2,3} digits * @returns {String}
    //  */
    // monthCodes = {'MMMM':'long', 'MMM':'short', 'MM':'2-digit', 'M':'numeric'};
    // getFractionalSecond(digits) {
    //   return this.getString({fractionalSecondDigits:digits||3});
    // }    

    // /**
    //  * @param {"narrow"|"short"|"long"} format * @returns {String}
    //  */
    // monthCodes = {'MMMM':'long', 'MMM':'short', 'MM':'2-digit', 'M':'numeric'};
    // getDayPeriod(format) {
    //   return this.getString({dayPeriod:format||'narrow', hour12:true});
    // }

    // /**
    //  * @param {"long"|"short"|"narrow"} format * @returns {String}
    //  */
    // monthCodes = {'MMMM':'long', 'MMM':'short', 'MM':'2-digit', 'M':'numeric'};
    // getWeekday(format) {
    //   return this.getString({weekday:format||'long'});
    // }

    toString(coding) {
      if(!coding || !coding.length) return coding;
      let r = '';
      for (let i=0;i<coding.length;i++) {
        let s = false;
        _.each(this.codes, (func,funcKey)=> { 
          if(s) return;
          _.each(this[funcKey], (code)=> {
            if(s) return;
            if(coding.indexOf(code.key)===0) {
              s=true;
              r+= func.call(this, code.key);
              coding = coding.substr(0,i) + coding.substr(i+code.key.length); 
            }
          });
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

// console.log(dateTime.getHour('hh'));
// console.log(dateTime.getMinute('mm'));
// console.log(dateTime.getSecond('ss'));
// console.log(dateTime.getNow());
// console.log(dateTime.getFractionalSecondByFormat());
// console.log(dateTime.getDayPeriodByFormat());
// console.log(dateTime.getWeekdayByFormat());


// return dateTime.toString('yyyy-MM-dddd');


module.exports = DateTime;