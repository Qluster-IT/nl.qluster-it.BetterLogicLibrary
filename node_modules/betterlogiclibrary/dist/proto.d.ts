export class Proto {
}
/**
 *
 * @param {String} str
 * @returns {Promise<String>}
 */
export function zipstr(str: string, { level, returnType }?: {
    level?: number;
    returnType?: string;
}): Promise<string>;
/**
 *
 * @param {String} str
 * @param {String} returnType
 * @returns {Promise<String>} Unzipped string
 */
export function unzipstr(str: string, returnType: string): Promise<string>;
//# sourceMappingURL=proto.d.ts.map