const { BL } = require("./lib/bll/bl.js");


class Coding  {  
	// static get locale() { return this._locale; }
	// static set locale(v) { this._locale = v; }

    constructor() {
    }

    async toString(text) {
      return await BL.l.post('decode', {text});
  }


}

module.exports = Coding;