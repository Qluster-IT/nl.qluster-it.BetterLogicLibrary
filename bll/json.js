//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters

const { BL } = require("betterlogiclibrary");

//https://learn.microsoft.com/en-us/dotnet/standard/base-types/custom-date-and-time-format-strings
//https://docs.angularjs.org/api/ng/filter/date

//const { BL } = require("betterlogiclibrary");

//https://www.npmjs.com/package/write-excel-file?activeTab=readme#cdn
const writeXlsxFile = BL.submodules["write-excel-file-min"];
const { json2csvAsync, json2csvChunks } = BL.submodules["json2csv"];
let realtimeApi;


class Json {

  static get exports() { if (!Json._exports) Json._exports = {}; return Json._exports; }

  static set exports(val) { return Json._exports = val; }


  // constructor() {
  //   let a = writeXlsxFile;
  //   this.asd = "asd";
  // }

  /** @private */
  static async init(bll) {
    realtimeApi = BL.Current.api;
    Json.exports = await bll.get('exports');
    //BL.homey.log('json.init', Json.exports);

    this.onRealtime = (event, data) => {
      switch (event) {
        case "bllSetExports": Json.exports = data || {};
      }
    };
    realtimeApi.on('realtime', this.onRealtime);
    //this.bll = bll;
  }

  static destroy() {
    if (realtimeApi && this.onRealtime) realtimeApi.off('realtime', this.onRealtime);
    realtimeApi = null;
    delete this.onRealtime;
  }

  static toJson(data, { outputStream = false } = {}) {
    if (!outputStream) return JSON.stringify(data);
    const { Readable } = require('stream');
    if (!data || (!Array.isArray(data) && typeof data[Symbol.iterator] !== 'function'
      && typeof data[Symbol.asyncIterator] !== 'function')) {
      throw new TypeError('Streaming JSON requires an array or iterable');
    }
    if (typeof data.toJSON === 'function') {
      return Readable.from([JSON.stringify(data)], { objectMode: false });
    }
    const length = Array.isArray(data) ? data.length : undefined;
    const rows = length === undefined ? data : (function* () {
      for (let index = 0; index < length; index++) yield data[index];
    })();
    return Readable.from((async function* () {
      let parts = ['['];
      let size = 1;
      let index = 0;
      for await (const row of rows) {
        const key = String(index);
        const wrapped = JSON.stringify({ [key]: row });
        const json = wrapped === '{}' ? 'null' : wrapped.slice(key.length + 4, -1);
        const part = (index++ ? ',' : '') + json;
        parts.push(part);
        size += part.length;
        if (size >= 8192) {
          yield parts.join('');
          parts = [];
          size = 0;
        }
      }
      parts.push(']');
      yield parts.join('');
    })(), { objectMode: false, highWaterMark: 16384 });
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

  // outputStream is a Node-only opt-in; callers must consume the returned Readable.
  static async toCsv(data, options) {
    if (options?.outputStream === true) {
      const { Readable } = require('stream');
      const chunks = json2csvChunks ? await json2csvChunks(data, options) : [await json2csvAsync(data, options)];
      return Readable.from(chunks, { objectMode: false });
    }
    return await json2csvAsync(data, options);

  }
}

module.exports = Json;