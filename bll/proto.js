console.log('setting parseFunction');
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


// function gzip(input, options) {
//     return new Promise(function (resolve, reject) {
//       zlib.gzip(input, options, function (err, result) {
//         if (!err) resolve(result);
//         else reject(Error(err));
//       });
//     });
//   }
//   function ungzip(input, options) {
//     return new Promise(function (resolve, reject) {
//       zlib.gunzip(input, options, function (err, result) {
//         if (!err) resolve(result);
//         else reject(Error(err));
//       });
//     });
//   }
  


class Proto {

}

module.exports = Proto;