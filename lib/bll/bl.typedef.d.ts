export type BL = {
    /**
     * Active BetterLogic Loader
     */
    Current: BL;
    /**
     * Decode the given {@link String } for any BLL codings and returns the decoded string.
     */
    decode: BL_decode;
    L: BLL;
    datetime: DateTime;
};
export type BL_decode = (coding: string) => Promise<string>;
export type BLL = {
    /**
     * Active BetterLogic Library
     */
    Current: BLL;
    product: object;
    L: object;
};
export type DateTime = {
    /**
     * Get the current datetime in the given format with the timezone of the user applied.
     */
    toString: (format: string) => string;
    /**
     * Get a new {@link DateTime } with the given Date or current Date.
     */
    get: (date?: string) => DateTime;
};
