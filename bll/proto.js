console.log('setting parseFunction');
var zlib = require('zlib');

if (typeof String.prototype.parseFunction != 'function') {
    String.prototype.parseFunction = function () {
        var funcReg = /function *\(([^()]*)\)[ \n\t]*{(.*)}/gmi;
        var match = funcReg.exec(this.replace(/\n/g, ' '));

        if(match) {
            return new Function(match[1].split(','), match[2]);
        }

        return null;
    };
}


function zipg(input, options) {
    return new Promise(function (resolve, reject) {
      zlib.gzip(input, options, function (err, result) {
        if (!err) resolve(result);
        else reject(Error(err));
      });
    });
  }
  function unzipg(input, options) {
    return new Promise(function (resolve, reject) {
      zlib.gunzip(input, options, function (err, result) {
        if (!err) resolve(result);
        else reject(Error(err));
      });
    });
  }
  
  /**
   * 
   * @param {String} str 
   * @param {String} returnType 
   * @returns {Promise<String>} Unzipped string
   */
async function unzipstr(str, returnType) { //base64, utf8
    var gzippedJson = Buffer.from(str, 'base64');
    var jsonBuffer = await unzipg(gzippedJson, {level:9});
    return returnType ? jsonBuffer.toString(returnType) : jsonBuffer.toString();
}

/**
 * 
 * @param {String} str 
 * @returns {Promise<String>}
 */
async function zipstr(str, {level=9, returnType='base64'}={}) {
    return await Buffer.from(await zipg(str, {level} )).toString(returnType);

}
    


class Proto {

}

module.exports = {Proto, zipstr, unzipstr};