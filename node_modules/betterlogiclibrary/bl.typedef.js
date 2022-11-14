/**
 * @namespace typedefs
 */

/**
  @typedef BL
  @property {BL} Current Active BetterLogic Loader
  @property {BL_decode} BL.decode Decode the given {@link String} for any BLL codings and returns the decoded string.
  @property {BLL} L
  @property {DateTime} datetime
  @memberof typedefs
*/


  /**
   * @description Decode the given {@link String} for any BLL codings and returns the decoded string.
   * @typedef BL_decode
   * @type {(coding:string)=>Promise<string>}
   * @static
   * @async
   * @param {string} text
   * @return {string} A decoded {@link String} if BLL is running, otherwise it will return the original {@link String}.
   * @memberof BL
   */
  


/**
  @typedef BLL
  @property {BLL} Current Active BetterLogic Library
  @property {object} product
  @property {object} L
  @memberof typedefs
*/

/**
*  @typedef DateTime 
*  @property {(format:string)=>string} toString Get the current datetime in the given format with the timezone of the user applied.
*  @property {(date?:string)=>DateTime} get Get a new {@link DateTime} with the given Date or current Date.
*/


module.exports = {};
