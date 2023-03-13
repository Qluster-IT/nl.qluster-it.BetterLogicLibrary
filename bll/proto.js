//console.log('setting parseFunction');
var zlib = require('zlib');

if (typeof String.prototype.parseFunction != 'function') {
    String.prototype.parseFunction = function () {
        const funcReg = /function *\(([^()]*)\)[ \n\t]*{(.*)}/gmis;
        //const match = funcReg.exec(this.replace(/\n/g, ' '));
        const match = funcReg.exec(this);
        if(match) {
            return new Function(match[1].split(','), match[2]);
        }
        const funcInlineReg = /(?:\()?(.*)(?:\))?=>(.*)/gmis;
        //const match = funcReg.exec(this.replace(/\n/g, ' '));
        const matchInline = funcInlineReg.exec(this);
        if(matchInline) {
          let func = matchInline[2].trim();
          if(!func.startsWith('{') || !func.startsWith('}')) func = 'return ' + func;
          return new Function(matchInline[1].replace(')', '').trim().split(','), func);
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