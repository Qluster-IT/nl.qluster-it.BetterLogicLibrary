
const { BL } = require("betterlogiclibrary");


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