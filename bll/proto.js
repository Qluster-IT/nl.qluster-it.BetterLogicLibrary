class Defer {    
    get isDefered() { return !!this._isDefered ; }
    set isDefered(v) { this._isDefered = v; }
    
    get promise() { return this._promise ; }
    set promise(v) { this._promise = v; }
    /** 
     * @param {Number} timeout 
     */
    constructor(timeout, originalPromise) {        
        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });        
        if(timeout) {
            setTimeout(function () {
                if(!this.isDefered && this.promise && this.promise.resolve) this.promise.resolve();
            }.bind(this),timeout);
        }
        if(originalPromise && originalPromise.then) originalPromise.then((val1,val2,val3,val4)=>this.resolve(val1,val2,val3,val4)).catch((val1,val2,val3,val4)=>this.reject(val1,val2,val3,val4));
    }
    then(fun) { this._promise.then(fun); }
    catch(fun) { this._promise.catch(fun); }
    finally(fun) { this._promise.finally(fun); }
    resolve(val1,val2,val3,val4) { this.isDefered=true; this._resolve(val1,val2,val3,val4); return this.promise; }
    reject(val1,val2,val3,val4) { this.isDefered=true; this._reject(val1,val2,val3,val4); return this.promise; }
}

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


function gzip(input, options) {
    return new Promise(function (resolve, reject) {
      zlib.gzip(input, options, function (err, result) {
        if (!err) resolve(result);
        else reject(Error(err));
      });
    });
  }
  function ungzip(input, options) {
    return new Promise(function (resolve, reject) {
      zlib.gunzip(input, options, function (err, result) {
        if (!err) resolve(result);
        else reject(Error(err));
      });
    });
  }
  



module.exports = { Defer, gzip, ungzip };