//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters

const { BL } = require("betterlogiclibrary");

//https://learn.microsoft.com/en-us/dotnet/standard/base-types/custom-date-and-time-format-strings
//https://docs.angularjs.org/api/ng/filter/date

//const { BL } = require("betterlogiclibrary");

//https://www.npmjs.com/package/write-excel-file?activeTab=readme#cdn
const writeXlsxFile = BL.submodules["write-excel-file-min"];
const { json2csvAsync } = BL.submodules["json2csv"];


class Json {

  static get exports() { if (!Json._exports) Json._exports = {}; return Json._exports; }

  static set exports(val) { return Json._exports = val; }


  // constructor() {
  //   let a = writeXlsxFile;
  //   this.asd = "asd";
  // }

  /** @private */
  static async init(bll) {
    Json.exports = await bll.get('exports');
    //BL.homey.log('json.init', Json.exports);

    this.onRealtime = (event, data) => {
      switch (event) {
        case "bllSetExports": Json.exports = data || {};
      }
    };
    BL.Current.api.on('realtime', this.onRealtime);
    //this.bll = bll;
  }

  static destroy() {
    BL.Current.api.off('realtime', this.onRealtime);
  }

  /**
   * 
   * @param {import('./d.ts/json.toExcel').SheetData|import('./d.ts/json.toExcel').SheetData[]} data 
   * @param {import('./d.ts/json.toExcel').WithSchemaOptions|import('./d.ts/json.toExcel').WithSchemaOptionsMultipleSheets} options
   */
  static async toExcel(data, options) {
    if (options && !options.dateFormat) options.dateFormat = Json.exports.excel_defaultdateformat || 'yyyy-mm-dd hh:mm:ss';
    return await writeXlsxFile(data, options);

  }

  static async toCsv(data, options) {
    return await json2csvAsync(data, options);

  }
}

module.exports = Json;