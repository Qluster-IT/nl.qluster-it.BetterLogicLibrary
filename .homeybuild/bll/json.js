//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters

const { BL } = require("betterlogiclibrary");

//https://learn.microsoft.com/en-us/dotnet/standard/base-types/custom-date-and-time-format-strings
//https://docs.angularjs.org/api/ng/filter/date

//const { BL } = require("betterlogiclibrary");

//https://www.npmjs.com/package/write-excel-file?activeTab=readme#cdn
const writeXlsxFile = BL.submodules["write-excel-file-min"];
const {json2csvAsync} = BL.submodules["json2csv"];


class Json {


  // constructor() {
  //   let a = writeXlsxFile;
  //   this.asd = "asd";
  // }

  // /** @private */
  // static async init(bll) {
  //   let a = writeXlsxFile;
  //   BL.homey.log(typeof(writeXlsxFile));
  // }

  // static destroy() {
  // }

  /**
   * 
   * @param {import('./d.ts/json.toExcel').SheetData|import('./d.ts/json.toExcel').SheetData[]} data 
   * @param {import('./d.ts/json.toExcel').WithSchemaOptions|import('./d.ts/json.toExcel').WithSchemaOptionsMultipleSheets} options
   */
  static async toExcel(data, options) {
    return await writeXlsxFile(data, options);

  }
  
  static async toCsv(data, options) {
    return await json2csvAsync(data, options);

  }
}

module.exports = Json;