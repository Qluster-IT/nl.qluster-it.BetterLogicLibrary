const { BL } = require("betterlogiclibrary");


class numberStatics {

}

class clsNumber {

  static get locale() { return numberStatics.locale; }



  /** @private */
  static async init(bll) {
    let locale = await bll.get('locale');
    BL.homey.log('locale', locale);

    numberStatics.locale = locale ? locale.default : await BL.homey.i18n.getLanguage();

    this.onRealtime = (event, data) => {
      switch (event) {
        case "bllSetLocale": numberStatics.locale = data.default;
      }
    };
    BL.Current.api.on('realtime', this.onRealtime);
  }

  static destroy() {
    BL.homey.log('Number.destroy()');
    BL.Current.api.off('realtime', this.onRealtime);

    BL.homey.log('Number.destroying');
    BL.L.clearObj(this);
    BL.homey.log('Number.destroyed');
  }

  /**
   * 
   * @param {String|String[]} format - Not in use yet 
   * @param {String|String[]|clsNumber|clsNumber[]} number 
   * @param {clsNumber} decimals 
   * @param {String} locale
   * @returns 
   */

  static toString(number, style, styleOption1, styleOption2, decimals, locale) {// format, 
    //if (!format) throw new Error("format is required.");
    if (number === undefined || number === null) throw new Error("number is required.");
    if (!BL._.isArray(number)) {
      return new clsNumber(locale, clsNumber.convertToNumber(number), decimals).toString(style, styleOption1, styleOption2, decimals);
    } else if (BL._.isArray(number)) {
      let r = {};
      for (const _number of number) {
        try {
          if (Object.keys(r).indexOf(_number) === -1) r[_number] = new clsNumber(locale, clsNumber.convertToNumber(_number), decimals).toString(style, styleOption1, styleOption2, decimals);
        } catch (error) {
          //BL.homey.error(error);
        }
      }
      return r;
    }
  }


  // static get(number) { return new Number(undefined, undefined, number); }


  static convertToNumber(number) {
    if (typeof (number) == 'number') return number;

  }







  get locale() { return this._locale; }
  set locale(v) { this._locale = v; }

  get number() { return this._number; }
  set number(v) { this._number = v; }

  get decimals() { return this._decimals; }
  set decimals(v) { this._decimals = v; }

  /** @private */
  get(number) { return new clsNumber(this.locale, number); }


  constructor(locale, number, decimals) {
    this.locale = locale;
    this.number = number;
    this.decimals = decimals;
  }


  toString(style, styleOption1, styleOption2, decimals) {
    return this.format(style, styleOption1, styleOption2, decimals);
    //if (!format) return format;
    //if (typeof (format) == 'string' || !format) return this.format(style, styleOption1, styleOption2, decimals);
    // if (BL._.isArray(format)) {
    //   let r = {};
    //   for (const _format of format) {
    //     if (Object.keys(r).indexOf(_format) === -1) r[_format] = this.format(_format, style, styleOption1, styleOption2, decimals);
    //   }
    //   return r;
    // }
  }


  format(style, styleOption1, styleOption2, decimals) {
    let opts = {};
    if (style) {
      opts.style = style;
      switch (style) {
        case 'decimal':
          if (styleOption1) {
            if (styleOption1.id == 'compact_short') {
              opts.notation = 'compact';
              opts.compactDisplay = 'short';
            } else if (styleOption1.id == 'compact_long') {
              opts.notation = 'compact';
              opts.compactDisplay = 'long';
            } else opts.notation = styleOption1.id;
          }
          break;
        case 'currency':
          if (styleOption1) opts.currency = styleOption1.name;
          if (styleOption2) opts.currencyDisplay = styleOption2.id;
          break;
        case 'unit':
          if (styleOption1) opts.unit = styleOption1.id;
          if (styleOption2) opts.unitDisplay = styleOption2.id;          
          break;
      }
    }
    if (decimals !== undefined && decimals !== null) {
      if (decimals >= 0)
        opts.minimumFractionDigits = opts.maximumFractionDigits = decimals;
    }
    else opts.minimumFractionDigits = opts.maximumFractionDigits = this.countDecimals(this.number);

    return this.number.toLocaleString(this.locale || clsNumber.locale, opts);
  }


  countDecimals(value) {
    if (Math.floor(value) !== value)
      return value.toString().split(".")[1].length || 0;
    return 0;
  }
}

// function removeYear(str) {
//   let year = new Date().getUTCFullYear();
//   return str.replace(year, '').replace(year - 1, '').replace(year + 1, '').trim();
// }

// function removeNumeric(str) {
//   return str.replace(/[0-9]/g, '').trim();
// }

// function removeNonNumeric(str) {
//   return str.replace(/[^0-9]/g, '').trim();
// }

module.exports = clsNumber;