"use strict";

const { BL } = require("betterlogiclibrary/src/bl");

/**
 * @license MIT
 * doc-path <https://github.com/mrodrig/doc-path>
 * Copyright (c) 2015-present, Michael Rodrigues.
 */
function evaluatePath(t, e) { if (!t) return null; let { dotIndex: r, key: a, remaining: n } = state(e); return r >= 0 && !t[e] ? Array.isArray(t[a]) ? t[a].map(t => evaluatePath(t, n)) : evaluatePath(t[a], n) : Array.isArray(t) ? t.map(t => evaluatePath(t, e)) : r >= 0 && e !== a && t[a] ? evaluatePath(t[a], n) : -1 === r && t[a] && !t[e] ? t[a] : t[e] } function setPath(t, e, r) { if (!t) throw new Error("No object was provided."); if (!e) throw new Error("No keyPath was provided."); return _sp(t, e, r) } function _sp(t, e, r) { let { dotIndex: a, key: n, remaining: i } = state(e); if (e.startsWith("__proto__") || e.startsWith("constructor") || e.startsWith("prototype")) return t; if (a >= 0) { if (!t[n] && Array.isArray(t)) return t.forEach(t => _sp(t, e, r)); t[n] || (t[n] = {}), _sp(t[n], i, r) } else { if (Array.isArray(t)) return t.forEach(t => _sp(t, i, r)); t[n] = r } return t } function state(t) { let e = findFirstNonEscapedDotIndex(t); return { dotIndex: e, key: t.slice(0, e >= 0 ? e : void 0).replace(/\\./g, "."), remaining: t.slice(e + 1) } } function findFirstNonEscapedDotIndex(t) { for (let e = 0; e < t.length; e++) { const r = e > 0 ? t[e - 1] : ""; if ("." === t[e] && "\\" !== r) return e } return -1 };
const path = { evaluatePath: evaluatePath, setPath: setPath };


/// Copyright MIT Deek

const utilsDeek = ((function () {
    return {
        // underscore replacements:
        isNull,
        isObject,
        unique,
        flatten
    };

    /*
     * Helper functions which were created to remove underscorejs from this package.
     */

    function isObject(value) {
        return typeof value === 'object';
    }

    function isNull(value) {
        return value === null;
    }

    function unique(array) {
        return [...new Set(array)];
    }

    function flatten(array) {
        return [].concat(...array);
    }
})());

//const deeks = require('deeks');
const deeks = ((function () {
    return {
        deepKeys: deepKeys,
        deepKeysFromList: deepKeysFromList
    };

    /**
     * Return the deep keys list for a single document
     * @param object
     * @param options
     * @returns {Array}
     */
    function deepKeys(object, options) {
        options = mergeOptions(options);
        if (utilsDeek.isObject(object) && object !== null) {
            return generateDeepKeysList('', object, options);
        }
        return [];
    }

    /**
     * Return the deep keys list for all documents in the provided list
     * @param list
     * @param options
     * @returns Array[Array[String]]
     */
    function deepKeysFromList(list, options) {
        options = mergeOptions(options);
        return list.map((document) => { // for each document
            if (utilsDeek.isObject(document)) {
                // if the data at the key is a document, then we retrieve the subHeading starting with an empty string heading and the doc
                return deepKeys(document, options);
            }
            return [];
        });
    }

    function generateDeepKeysList(heading, data, options) {
        let keys = Object.keys(data).map((currentKey) => {
            // If the given heading is empty, then we set the heading to be the subKey, otherwise set it as a nested heading w/ a dot
            let keyName = buildKeyName(heading, escapeNestedDotsIfSpecified(currentKey, options));

            // If we have another nested document, recur on the sub-document to retrieve the full key name
            if (isDocumentToRecurOn(data[currentKey])) {
                return generateDeepKeysList(keyName, data[currentKey], options);
            } else if (options.expandArrayObjects && isArrayToRecurOn(data[currentKey])) {
                // If we have a nested array that we need to recur on
                return processArrayKeys(data[currentKey], keyName, options);
            } else if (options.ignoreEmptyArrays && isArrayToRecurOn(data[currentKey]) && !data[currentKey].length) {
                return [];
            }
            // Otherwise return this key name since we don't have a sub document
            return keyName;
        });

        return utilsDeek.flatten(keys);
    }

    /**
     * Helper function to handle the processing of arrays when the expandArrayObjects
     * option is specified.
     * @param subArray
     * @param currentKeyPath
     * @param options
     * @returns {*}
     */
    function processArrayKeys(subArray, currentKeyPath, options) {
        let subArrayKeys = deepKeysFromList(subArray, options);

        if (!subArray.length) {
            return options.ignoreEmptyArraysWhenExpanding ? [] : [currentKeyPath];
        } else if (subArray.length && utilsDeek.flatten(subArrayKeys).length === 0) {
            // Has items in the array, but no objects
            return [currentKeyPath];
        } else {
            subArrayKeys = subArrayKeys.map((schemaKeys) => {
                if (isEmptyArray(schemaKeys)) {
                    return [currentKeyPath];
                }
                return schemaKeys.map((subKey) => buildKeyName(currentKeyPath, escapeNestedDotsIfSpecified(subKey, options)));
            });

            return utilsDeek.unique(utilsDeek.flatten(subArrayKeys));
        }
    }

    function escapeNestedDotsIfSpecified(key, options) {
        if (options.escapeNestedDots) {
            return key.replace(/\./g, '\\.');
        }
        return key;
    }

    /**
     * Function used to generate the key path
     * @param upperKeyName String accumulated key path
     * @param currentKeyName String current key name
     * @returns String
     */
    function buildKeyName(upperKeyName, currentKeyName) {
        if (upperKeyName) {
            return upperKeyName + '.' + currentKeyName;
        }
        return currentKeyName;
    }

    /**
     * Returns whether this value is a document to recur on or not
     * @param val Any item whose type will be evaluated
     * @returns {boolean}
     */
    function isDocumentToRecurOn(val) {
        return utilsDeek.isObject(val) && !utilsDeek.isNull(val) && !Array.isArray(val) && Object.keys(val).length;
    }

    /**
     * Returns whether this value is an array to recur on or not
     * @param val Any item whose type will be evaluated
     * @returns {boolean}
     */
    function isArrayToRecurOn(val) {
        return Array.isArray(val);
    }

    /**
     * Helper function that determines whether or not a value is an empty array
     * @param val
     * @returns {boolean}
     */
    function isEmptyArray(val) {
        return Array.isArray(val) && !val.length;
    }

    function mergeOptions(options) {
        return {
            expandArrayObjects: false,
            ignoreEmptyArraysWhenExpanding: false,
            escapeNestedDots: false,
            ignoreEmptyArrays: false,
            ...options || {}
        };
    }
})());





const constants = {
    "errors": {

        "callbackRequired": "A callback is required!",
        "optionsRequired": "Options were not passed and are required.",

        "json2csv": {
            "cannotCallOn": "Cannot call json2csv on ",
            "dataCheckFailure": "Data provided was not an array of documents.",
            "notSameSchema": "Not all documents have the same schema."
        },

        "csv2json": {
            "cannotCallOn": "Cannot call csv2json on ",
            "dataCheckFailure": "CSV is not a string."
        }

    },

    "defaultOptions": {
        "delimiter": {
            "field": ",",
            "wrap": "\"",
            "eol": "\n"
        },
        "excelBOM": false,
        "prependHeader": true,
        "trimHeaderFields": false,
        "trimFieldValues": false,
        "sortHeader": false,
        "parseCsvNumbers": false,
        "keys": null,
        "checkSchemaDifferences": false,
        "expandArrayObjects": false,
        "unwindArrays": false,
        "useDateIso8601Format": false,
        "useLocaleFormat": false,
        "parseValue": null,
        "wrapBooleans": false,
        "preventCsvInjection": false
    },

    "values": {
        "excelBOM": "\ufeff"
    }
};


const dateStringRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
    MAX_ARRAY_LENGTH = 100000;

const utils = ((function () {
    return {
        isStringRepresentation,
        isDateRepresentation,
        computeSchemaDifferences,
        deepCopy,
        convert,
        isEmptyField,
        removeEmptyFields,
        getNCharacters,
        unwind,
        isInvalid,
        isNumber,

        // underscore replacements:
        isString,
        isNull,
        isError,
        isDate,
        isUndefined,
        isObject,
        unique,
        flatten
    };

    /**
     * Build the options to be passed to the appropriate function
     * If a user does not provide custom options, then we use our default
     * If options are provided, then we set each valid key that was passed
     * @param opts {Object} options object
     * @return {Object} options object
     */
    function buildOptions(opts) {
        opts = { ...constants.defaultOptions, ...opts || {} };
        opts.fieldTitleMap = new Map();

        // Copy the delimiter fields over since the spread operator does a shallow copy
        opts.delimiter.field = opts.delimiter.field || constants.defaultOptions.delimiter.field;
        opts.delimiter.wrap = opts.delimiter.wrap || constants.defaultOptions.delimiter.wrap;
        opts.delimiter.eol = opts.delimiter.eol || constants.defaultOptions.delimiter.eol;

        // Otherwise, send the options back
        return opts;
    }

    /**
     * When promisified, the callback and options argument ordering is swapped, so
     * this function is intended to determine which argument is which and return
     * them in the correct order
     * @param arg1 {Object|Function} options or callback
     * @param arg2 {Object|Function} options or callback
     */
    function parseArguments(arg1, arg2) {
        // If this was promisified (callback and opts are swapped) then fix the argument order.
        if (isObject(arg1) && !isFunction(arg1)) {
            return {
                options: arg1,
                callback: arg2
            };
        }
        // Regular ordering where the callback is provided before the options object
        return {
            options: arg2,
            callback: arg1
        };
    }

    /**
     * Validates the parameters passed in to json2csv and csv2json
     * @param config {Object} of the form: { data: {Any}, callback: {Function}, dataCheckFn: Function, errorMessages: {Object} }
     */
    function validateParameters(config) {
        // If a callback wasn't provided, throw an error
        if (!config.callback) {
            throw new Error(constants.errors.callbackRequired);
        }

        // If we don't receive data, report an error
        if (!config.data) {
            config.callback(new Error(config.errorMessages.cannotCallOn + config.data + '.'));
            return false;
        }

        // The data provided data does not meet the type check requirement
        if (!config.dataCheckFn(config.data)) {
            config.callback(new Error(config.errorMessages.dataCheckFailure));
            return false;
        }

        // If we didn't hit any known error conditions, then the data is so far determined to be valid
        // Note: json2csv/csv2json may perform additional validity checks on the data
        return true;
    }

    /**
     * Abstracted function to perform the conversion of json-->csv or csv-->json
     * depending on the converter class that is passed via the params object
     * @param params {Object}
     */
    function convert(params) {
        let { options, callback } = parseArguments(params.callback, params.options);
        options = buildOptions(options);

        let converter = new params.converter(options),

            // Validate the parameters before calling the converter's convert function
            valid = validateParameters({
                data: params.data,
                callback,
                errorMessages: converter.validationMessages,
                dataCheckFn: converter.validationFn
            });

        if (valid) converter.convert(params.data, callback);
    }

    /**
     * Utility function to deep copy an object, used by the module tests
     * @param obj
     * @returns {any}
     */
    function deepCopy(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Helper function that determines whether the provided value is a representation
     *   of a string. Given the RFC4180 requirements, that means that the value is
     *   wrapped in value wrap delimiters (usually a quotation mark on each side).
     * @param fieldValue
     * @param options
     * @returns {boolean}
     */
    function isStringRepresentation(fieldValue, options) {
        const firstChar = fieldValue[0],
            lastIndex = fieldValue.length - 1,
            lastChar = fieldValue[lastIndex];

        // If the field starts and ends with a wrap delimiter
        return firstChar === options.delimiter.wrap && lastChar === options.delimiter.wrap;
    }

    /**
     * Helper function that determines whether the provided value is a representation
     *   of a date.
     * @param fieldValue
     * @returns {boolean}
     */
    function isDateRepresentation(fieldValue) {
        return dateStringRegex.test(fieldValue);
    }

    /**
     * Helper function that determines the schema differences between two objects.
     * @param schemaA
     * @param schemaB
     * @returns {*}
     */
    function computeSchemaDifferences(schemaA, schemaB) {
        return arrayDifference(schemaA, schemaB)
            .concat(arrayDifference(schemaB, schemaA));
    }

    /**
     * Utility function to check if a field is considered empty so that the emptyFieldValue can be used instead
     * @param fieldValue
     * @returns {boolean}
     */
    function isEmptyField(fieldValue) {
        return isUndefined(fieldValue) || isNull(fieldValue) || fieldValue === '';
    }

    /**
     * Helper function that removes empty field values from an array.
     * @param fields
     * @returns {Array}
     */
    function removeEmptyFields(fields) {
        return fields.filter((field) => !isEmptyField(field));
    }

    /**
     * Helper function that retrieves the next n characters from the start index in
     *   the string including the character at the start index. This is used to
     *   check if are currently at an EOL value, since it could be multiple
     *   characters in length (eg. '\r\n')
     * @param str
     * @param start
     * @param n
     * @returns {string}
     */
    function getNCharacters(str, start, n) {
        return str.substring(start, start + n);
    }

    /**
     * The following unwind functionality is a heavily modified version of @edwincen's
     * unwind extension for lodash. Since lodash is a large package to require in,
     * and all of the required functionality was already being imported, either
     * natively or with doc-path, I decided to rewrite the majority of the logic
     * so that an additional dependency would not be required. The original code
     * with the lodash dependency can be found here:
     *
     * https://github.com/edwincen/unwind/blob/master/index.js
     */

    /**
     * Core function that unwinds an item at the provided path
     * @param accumulator {Array<any>}
     * @param item {any}
     * @param fieldPath {String}
     */
    function unwindItem(accumulator, item, fieldPath) {
        const valueToUnwind = path.evaluatePath(item, fieldPath);
        let cloned = deepCopy(item);

        if (Array.isArray(valueToUnwind) && valueToUnwind.length) {
            valueToUnwind.forEach((val) => {
                cloned = deepCopy(item);
                accumulator.push(path.setPath(cloned, fieldPath, val));
            });
        } else if (Array.isArray(valueToUnwind) && valueToUnwind.length === 0) {
            // Push an empty string so the value is empty since there are no values
            path.setPath(cloned, fieldPath, '');
            accumulator.push(cloned);
        } else {
            accumulator.push(cloned);
        }
    }

    /**
     * Main unwind function which takes an array and a field to unwind.
     * @param array {Array<any>}
     * @param field {String}
     * @returns {Array<any>}
     */
    function unwind(array, field) {
        const result = [];
        array.forEach((item) => {
            unwindItem(result, item, field);
        });
        return result;
    }

    /**
     * Checks whether value can be converted to a number
     * @param value {String}
     * @returns {boolean}
     */
    function isNumber(value) {
        return !isNaN(Number(value));
    }

    /*
     * Helper functions which were created to remove underscorejs from this package.
     */

    function isString(value) {
        return typeof value === 'string';
    }

    function isObject(value) {
        return typeof value === 'object';
    }

    function isFunction(value) {
        return typeof value === 'function';
    }

    function isNull(value) {
        return value === null;
    }

    function isDate(value) {
        return value instanceof Date;
    }

    function isUndefined(value) {
        return typeof value === 'undefined';
    }

    function isError(value) {
        return Object.prototype.toString.call(value) === '[object Error]';
    }

    function arrayDifference(a, b) {
        return a.filter((x) => !b.includes(x));
    }

    function unique(array) {
        return [...new Set(array)];
    }

    function flatten(array) {
        // Node 11+ - use the native array flattening function
        if (array.flat) {
            return array.flat();
        }

        // #167 - allow browsers to flatten very long 200k+ element arrays
        if (array.length > MAX_ARRAY_LENGTH) {
            let safeArray = [];
            for (let a = 0; a < array.length; a += MAX_ARRAY_LENGTH) {
                safeArray = safeArray.concat(...array.slice(a, a + MAX_ARRAY_LENGTH));
            }
            return safeArray;
        }
        return [].concat(...array);
    }

    /**
     * Used to help avoid incorrect values returned by JSON.parse when converting
     * CSV back to JSON, such as '39e1804' which JSON.parse converts to Infinity
     */
    function isInvalid(parsedJson) {
        return parsedJson === Infinity ||
            parsedJson === -Infinity;
    }

})());


const Csv2Json = function (options) {
    const escapedWrapDelimiterRegex = new RegExp(options.delimiter.wrap + options.delimiter.wrap, 'g'),
        excelBOMRegex = new RegExp('^' + constants.values.excelBOM),
        valueParserFn = options.parseValue && typeof options.parseValue === 'function' ? options.parseValue : JSON.parse;

    /**
     * Trims the header key, if specified by the user via the provided options
     * @param headerKey
     * @returns {*}
     */
    function processHeaderKey(headerKey) {
        headerKey = removeWrapDelimitersFromValue(headerKey);
        if (options.trimHeaderFields) {
            return headerKey.split('.')
                .map((component) => component.trim())
                .join('.');
        }
        return headerKey;
    }

    /**
     * Generate the JSON heading from the CSV
     * @param lines {String[]} csv lines split by EOL delimiter
     * @returns {*}
     */
    function retrieveHeading(lines) {
        let params = { lines };

        if (options.headerFields) {
            params.headerFields = options.headerFields.map((headerField, index) => ({
                value: processHeaderKey(headerField),
                index
            }));
        } else {
            // Generate and return the heading keys
            let headerRow = params.lines[0];
            params.headerFields = headerRow.map((headerKey, index) => ({
                value: processHeaderKey(headerKey),
                index
            }));

            // If the user provided keys, filter the generated keys to just the user provided keys so we also have the key index
            if (options.keys) {
                params.headerFields = params.headerFields.filter((headerKey) => options.keys.includes(headerKey.value));
            }
        }

        return params;
    }

    /**
     * Splits the lines of the CSV string by the EOL delimiter and resolves and array of strings (lines)
     * @param csv
     * @returns {Promise.<String[]>}
     */
    function splitCsvLines(csv) {
        return Promise.resolve(splitLines(csv));
    }

    /**
     * Removes the Excel BOM value, if specified by the options object
     * @param csv
     * @returns {Promise.<String>}
     */
    function stripExcelBOM(csv) {
        if (options.excelBOM) {
            return Promise.resolve(csv.replace(excelBOMRegex, ''));
        }
        return Promise.resolve(csv);
    }

    /**
     * Helper function that splits a line so that we can handle wrapped fields
     * @param csv
     */
    function splitLines(csv) {
        // Parse out the line...
        let lines = [],
            splitLine = [],
            character,
            charBefore,
            charAfter,
            nextNChar,
            lastCharacterIndex = csv.length - 1,
            eolDelimiterLength = options.delimiter.eol.length,
            stateVariables = {
                insideWrapDelimiter: false,
                parsingValue: true,
                justParsedDoubleQuote: false,
                startIndex: 0
            },
            index = 0;

        // Loop through each character in the line to identify where to split the values
        while (index < csv.length) {
            // Current character
            character = csv[index];
            // Previous character
            charBefore = index ? csv[index - 1] : '';
            // Next character
            charAfter = index < lastCharacterIndex ? csv[index + 1] : '';
            // Next n characters, including the current character, where n = length(EOL delimiter)
            // This allows for the checking of an EOL delimiter when if it is more than a single character (eg. '\r\n')
            nextNChar = utils.getNCharacters(csv, index, eolDelimiterLength);

            if ((nextNChar === options.delimiter.eol && !stateVariables.insideWrapDelimiter ||
                index === lastCharacterIndex) && charBefore === options.delimiter.field) {
                // If we reached an EOL delimiter or the end of the csv and the previous character is a field delimiter...

                // If the start index is the current index (and since the previous character is a comma),
                //   then the value being parsed is an empty value accordingly, add an empty string
                if (nextNChar === options.delimiter.eol && stateVariables.startIndex === index) {
                    splitLine.push('');
                } else if (character === options.delimiter.field) {
                    // If we reached the end of the CSV, there's no new line, and the current character is a comma
                    // then add an empty string for the current value
                    splitLine.push('');
                } else {
                    // Otherwise, there's a valid value, and the start index isn't the current index, grab the whole value
                    splitLine.push(csv.substr(stateVariables.startIndex));
                }

                // Since the last character is a comma, there's still an additional implied field value trailing the comma.
                //   Since this value is empty, we push an extra empty value
                splitLine.push('');

                // Finally, push the split line values into the lines array and clear the split line
                lines.push(splitLine);
                splitLine = [];
                stateVariables.startIndex = index + eolDelimiterLength;
                stateVariables.parsingValue = true;
                stateVariables.insideWrapDelimiter = charAfter === options.delimiter.wrap;
            } else if (index === lastCharacterIndex && character === options.delimiter.field) {
                // If we reach the end of the CSV and the current character is a field delimiter

                // Parse the previously seen value and add it to the line
                let parsedValue = csv.substring(stateVariables.startIndex, index);
                splitLine.push(parsedValue);

                // Then add an empty string to the line since the last character being a field delimiter indicates an empty field
                splitLine.push('');
                lines.push(splitLine);
            } else if (index === lastCharacterIndex || nextNChar === options.delimiter.eol &&
                // if we aren't inside wrap delimiters or if we are but the character before was a wrap delimiter and we didn't just see two
                (!stateVariables.insideWrapDelimiter ||
                    stateVariables.insideWrapDelimiter && charBefore === options.delimiter.wrap && !stateVariables.justParsedDoubleQuote)) {
                // Otherwise if we reached the end of the line or csv (and current character is not a field delimiter)

                let toIndex = index !== lastCharacterIndex || charBefore === options.delimiter.wrap ? index : undefined;

                // Retrieve the remaining value and add it to the split line list of values
                splitLine.push(csv.substring(stateVariables.startIndex, toIndex));

                // Finally, push the split line values into the lines array and clear the split line
                lines.push(splitLine);
                splitLine = [];
                stateVariables.startIndex = index + eolDelimiterLength;
                stateVariables.parsingValue = true;
                stateVariables.insideWrapDelimiter = charAfter === options.delimiter.wrap;
            } else if ((charBefore !== options.delimiter.wrap || stateVariables.justParsedDoubleQuote && charBefore === options.delimiter.wrap) &&
                character === options.delimiter.wrap && utils.getNCharacters(csv, index + 1, eolDelimiterLength) === options.delimiter.eol) {
                // If we reach a wrap which is not preceded by a wrap delim and the next character is an EOL delim (ie. *"\n)

                stateVariables.insideWrapDelimiter = false;
                stateVariables.parsingValue = false;
                // Next iteration will substring, add the value to the line, and push the line onto the array of lines
            } else if (character === options.delimiter.wrap && (index === 0 || utils.getNCharacters(csv, index - eolDelimiterLength, eolDelimiterLength) === options.delimiter.eol && !stateVariables.insideWrapDelimiter)) {
                // If the line starts with a wrap delimiter (ie. "*)

                stateVariables.insideWrapDelimiter = true;
                stateVariables.parsingValue = true;
                stateVariables.startIndex = index;
            } else if (character === options.delimiter.wrap && charAfter === options.delimiter.field) {
                // If we reached a wrap delimiter with a field delimiter after it (ie. *",)

                splitLine.push(csv.substring(stateVariables.startIndex, index + 1));
                stateVariables.startIndex = index + 2; // next value starts after the field delimiter
                stateVariables.insideWrapDelimiter = false;
                stateVariables.parsingValue = false;
            } else if (character === options.delimiter.wrap && charBefore === options.delimiter.field &&
                !stateVariables.insideWrapDelimiter && !stateVariables.parsingValue) {
                // If we reached a wrap delimiter after a comma and we aren't inside a wrap delimiter

                stateVariables.startIndex = index;
                stateVariables.insideWrapDelimiter = true;
                stateVariables.parsingValue = true;
            } else if (character === options.delimiter.wrap && charBefore === options.delimiter.field &&
                !stateVariables.insideWrapDelimiter && stateVariables.parsingValue) {
                // If we reached a wrap delimiter with a field delimiter after it (ie. ,"*)

                splitLine.push(csv.substring(stateVariables.startIndex, index - 1));
                stateVariables.insideWrapDelimiter = true;
                stateVariables.parsingValue = true;
                stateVariables.startIndex = index;
            } else if (character === options.delimiter.wrap && charAfter === options.delimiter.wrap && index !== stateVariables.startIndex) {
                // If we run into an escaped quote (ie. "") skip past the second quote

                index += 2;
                stateVariables.justParsedDoubleQuote = true;
                continue;
            } else if (character === options.delimiter.field && charBefore !== options.delimiter.wrap &&
                charAfter !== options.delimiter.wrap && !stateVariables.insideWrapDelimiter &&
                stateVariables.parsingValue) {
                // If we reached a field delimiter and are not inside the wrap delimiters (ie. *,*)

                splitLine.push(csv.substring(stateVariables.startIndex, index));
                stateVariables.startIndex = index + 1;
            } else if (character === options.delimiter.field && charBefore === options.delimiter.wrap &&
                charAfter !== options.delimiter.wrap && !stateVariables.parsingValue) {
                // If we reached a field delimiter, the previous character was a wrap delimiter, and the
                //   next character is not a wrap delimiter (ie. ",*)

                stateVariables.insideWrapDelimiter = false;
                stateVariables.parsingValue = true;
                stateVariables.startIndex = index + 1;
            }
            // Otherwise increment to the next character
            index++;
            // Reset the double quote state variable
            stateVariables.justParsedDoubleQuote = false;
        }

        return lines;
    }

    /**
     * Retrieves the record lines from the split CSV lines and sets it on the params object
     * @param params
     * @returns {*}
     */
    function retrieveRecordLines(params) {
        if (options.headerFields) { // This option is passed for instances where the CSV has no header line
            params.recordLines = params.lines;
        } else { // All lines except for the header line
            params.recordLines = params.lines.splice(1);
        }

        return params;
    }

    /**
     * Retrieves the value for the record from the line at the provided key.
     * @param line {String[]} split line values for the record
     * @param key {Object} {index: Number, value: String}
     */
    function retrieveRecordValueFromLine(line, key) {
        // If there is a value at the key's index, use it; otherwise, null
        let value = line[key.index];

        // Perform any necessary value conversions on the record value
        return processRecordValue(value);
    }

    /**
     * Processes the record's value by parsing the data to ensure the CSV is
     * converted to the JSON that created it.
     * @param fieldValue {String}
     * @returns {*}
     */
    function processRecordValue(fieldValue) {
        // If the value is an array representation, convert it
        let parsedJson = parseValue(fieldValue);
        // If parsedJson is anything aside from an error, then we want to use the parsed value
        // This allows us to interpret values like 'null' --> null, 'false' --> false
        if (!utils.isError(parsedJson) && !utils.isInvalid(parsedJson)) {
            fieldValue = parsedJson;
        } else if (fieldValue === 'undefined') {
            fieldValue = undefined;
        }

        return fieldValue;
    }

    /**
     * Trims the record value, if specified by the user via the options object
     * @param fieldValue
     * @returns {String|null}
     */
    function trimRecordValue(fieldValue) {
        if (options.trimFieldValues && !utils.isNull(fieldValue)) {
            return fieldValue.trim();
        }
        return fieldValue;
    }

    /**
     * Create a JSON document with the given keys (designated by the CSV header)
     *   and the values (from the given line)
     * @param keys String[]
     * @param line String
     * @returns {Object} created json document
     */
    function createDocument(keys, line) {
        // Reduce the keys into a JSON document representing the given line
        return keys.reduce((document, key) => {
            // If there is a value at the key's index in the line, set the value; otherwise null
            let value = retrieveRecordValueFromLine(line, key);

            try {
                // Otherwise add the key and value to the document
                return path.setPath(document, key.value, value);
            } catch (error) {
                // Catch any errors where key paths are null or '' and continue
                return document;
            }
        }, {});
    }

    /**
     * Removes the outermost wrap delimiters from a value, if they are present
     * Otherwise, the non-wrapped value is returned as is
     * @param fieldValue
     * @returns {String}
     */
    function removeWrapDelimitersFromValue(fieldValue) {
        let firstChar = fieldValue[0],
            lastIndex = fieldValue.length - 1,
            lastChar = fieldValue[lastIndex];
        // If the field starts and ends with a wrap delimiter
        if (firstChar === options.delimiter.wrap && lastChar === options.delimiter.wrap) {
            return fieldValue.substr(1, lastIndex - 1);
        }
        return fieldValue;
    }

    /**
     * Unescapes wrap delimiters by replacing duplicates with a single (eg. "" -> ")
     * This is done in order to parse RFC 4180 compliant CSV back to JSON
     * @param fieldValue
     * @returns {String}
     */
    function unescapeWrapDelimiterInField(fieldValue) {
        return fieldValue.replace(escapedWrapDelimiterRegex, options.delimiter.wrap);
    }

    /**
     * Main helper function to convert the CSV to the JSON document array
     * @param params {Object} {lines: [String], callback: Function}
     * @returns {Array}
     */
    function transformRecordLines(params) {
        params.json = params.recordLines.reduce((generatedJsonObjects, line) => { // For each line, create the document and add it to the array of documents
            line = line.map((fieldValue) => {
                // Perform the necessary operations on each line
                fieldValue = removeWrapDelimitersFromValue(fieldValue);
                fieldValue = unescapeWrapDelimiterInField(fieldValue);
                fieldValue = trimRecordValue(fieldValue);

                return fieldValue;
            });

            let generatedDocument = createDocument(params.headerFields, line);
            return generatedJsonObjects.concat(generatedDocument);
        }, []);

        return params;
    }

    /**
     * Attempts to parse the provided value. If it is not parsable, then an error is returned
     * @param value
     * @returns {*}
     */
    function parseValue(value) {
        try {
            if (utils.isStringRepresentation(value, options) && !utils.isDateRepresentation(value)) {
                return value;
            }

            let parsedJson = valueParserFn(value);

            // If the parsed value is an array, then we also need to trim record values, if specified
            if (Array.isArray(parsedJson)) {
                return parsedJson.map(trimRecordValue);
            }

            return parsedJson;
        } catch (err) {
            return err;
        }
    }

    /**
     * Internally exported csv2json function
     * Takes options as a document, data as a CSV string, and a callback that will be used to report the results
     * @param data String csv string
     * @param callback Function callback function
     */
    function convert(data, callback) {
        // Split the CSV into lines using the specified EOL option
        // validateCsv(data, callback)
        //     .then(stripExcelBOM)
        stripExcelBOM(data)
            .then(splitCsvLines)
            .then(retrieveHeading) // Retrieve the headings from the CSV, unless the user specified the keys
            .then(retrieveRecordLines) // Retrieve the record lines from the CSV
            .then(transformRecordLines) // Retrieve the JSON document array
            .then((params) => callback(null, params.json)) // Send the data back to the caller
            .catch(callback);
    }

    return {
        convert,
        validationFn: utils.isString,
        validationMessages: constants.errors.csv2json
    };
};

const Json2Csv = function (options) {
    const wrapDelimiterCheckRegex = new RegExp(options.delimiter.wrap, 'g'),
        crlfSearchRegex = /\r?\n|\r/,
        customValueParser = options.parseValue && typeof options.parseValue === 'function' ? options.parseValue : null,
        expandingWithoutUnwinding = options.expandArrayObjects && !options.unwindArrays,
        deeksOptions = {
            expandArrayObjects: expandingWithoutUnwinding,
            ignoreEmptyArraysWhenExpanding: expandingWithoutUnwinding,
            escapeNestedDots: true
        };

    /** HEADER FIELD FUNCTIONS **/

    /**
     * Returns the list of data field names of all documents in the provided list
     * @param data {Array<Object>} Data to be converted
     * @returns {Promise.<Array[String]>}
     */
    function getFieldNameList(data) {
        // If keys weren't specified, then we'll use the list of keys generated by the deeks module
        return Promise.resolve(deeks.deepKeysFromList(data, deeksOptions));
    }

    /**
     * Processes the schemas by checking for schema differences, if so desired.
     * If schema differences are not to be checked, then it resolves the unique
     * list of field names.
     * @param documentSchemas
     * @returns {Promise.<Array[String]>}
     */
    function processSchemas(documentSchemas) {
        // If the user wants to check for the same schema (regardless of schema ordering)
        if (options.checkSchemaDifferences) {
            return checkSchemaDifferences(documentSchemas);
        } else {
            // Otherwise, we do not care if the schemas are different, so we should get the unique list of keys
            let uniqueFieldNames = utils.unique(utils.flatten(documentSchemas));
            return Promise.resolve(uniqueFieldNames);
        }
    }

    /**
     * This function performs the schema difference check, if the user specifies that it should be checked.
     * If there are no field names, then there are no differences.
     * Otherwise, we get the first schema and the remaining list of schemas
     * @param documentSchemas
     * @returns {*}
     */
    function checkSchemaDifferences(documentSchemas) {
        // have multiple documents - ensure only one schema (regardless of field ordering)
        let firstDocSchema = documentSchemas[0],
            restOfDocumentSchemas = documentSchemas.slice(1),
            schemaDifferences = computeNumberOfSchemaDifferences(firstDocSchema, restOfDocumentSchemas);

        // If there are schema inconsistencies, throw a schema not the same error
        if (schemaDifferences) {
            return Promise.reject(new Error(constants.errors.json2csv.notSameSchema));
        }

        return Promise.resolve(firstDocSchema);
    }

    /**
     * Computes the number of schema differences
     * @param firstDocSchema
     * @param restOfDocumentSchemas
     * @returns {*}
     */
    function computeNumberOfSchemaDifferences(firstDocSchema, restOfDocumentSchemas) {
        return restOfDocumentSchemas.reduce((schemaDifferences, documentSchema) => {
            // If there is a difference between the schemas, increment the counter of schema inconsistencies
            let numberOfDifferences = utils.computeSchemaDifferences(firstDocSchema, documentSchema).length;
            return numberOfDifferences > 0
                ? schemaDifferences + 1
                : schemaDifferences;
        }, 0);
    }

    /**
     * If so specified, this filters the detected key paths to exclude any keys that have been specified
     * @param keyPaths {Array<String>}
     * @returns {Array<String>} filtered key paths
     */
    function filterExcludedKeys(keyPaths) {
        if (options.excludeKeys) {
            return keyPaths.filter((keyPath) => !options.excludeKeys.includes(keyPath));
        }

        return keyPaths;
    }

    /**
     * If so specified, this sorts the header field names alphabetically
     * @param fieldNames {Array<String>}
     * @returns {Array<String>} sorted field names, or unsorted if sorting not specified
     */
    function sortHeaderFields(fieldNames) {
        if (options.sortHeader) {
            return typeof options.sortHeader === 'function' ? fieldNames.sort(options.sortHeader) : fieldNames.sort();
        }
        return fieldNames;
    }

    /**
     * Trims the header fields, if the user desires them to be trimmed.
     * @param params
     * @returns {*}
     */
    function trimHeaderFields(params) {
        if (options.trimHeaderFields) {
            params.headerFields = params.headerFields.map((field) => field.split('.')
                .map((component) => component.trim())
                .join('.')
            );
        }
        return params;
    }

    /**
     * Wrap the headings, if desired by the user.
     * @param params
     * @returns {*}
     */
    function wrapHeaderFields(params) {
        // only perform this if we are actually prepending the header
        if (options.prependHeader) {
            params.headerFields = params.headerFields.map(function (headingKey) {
                return wrapFieldValueIfNecessary(headingKey);
            });
        }
        return params;
    }

    /**
     * Generates the CSV header string by joining the headerFields by the field delimiter
     * @param params
     * @returns {*}
     */
    function generateCsvHeader(params) {
        // #185 - generate a keys list to avoid finding native Map() methods
        let fieldTitleMapKeys = Object.keys(options.fieldTitleMap);

        params.header = params.headerFields
            .map(function (field) {
                const headerKey = fieldTitleMapKeys.includes(field) ? options.fieldTitleMap[field] : field;
                return wrapFieldValueIfNecessary(headerKey);
            })
            .join(options.delimiter.field);
        return params;
    }

    /**
     * Retrieve the headings for all documents and return it.
     * This checks that all documents have the same schema.
     * @param data
     * @returns {Promise}
     */
    function retrieveHeaderFields(data) {
        if (options.keys) {
            options.keys = options.keys.map((key) => {
                if (utils.isObject(key) && key.field) {
                    options.fieldTitleMap[key.field] = key.title || key.field;
                    return key.field;
                }
                return key;
            });
        }

        if (options.keys && !options.unwindArrays) {
            return Promise.resolve(options.keys)
                .then(filterExcludedKeys)
                .then(sortHeaderFields);
        }

        return getFieldNameList(data)
            .then(processSchemas)
            .then(filterExcludedKeys)
            .then(sortHeaderFields);
    }

    /** RECORD FIELD FUNCTIONS **/

    /**
     * Unwinds objects in arrays within record objects if the user specifies the
     *   expandArrayObjects option. If not specified, this passes the params
     *   argument through to the next function in the promise chain.
     * @param params {Object}
     * @param finalPass {boolean} Used to trigger one last pass to ensure no more arrays need to be expanded
     * @returns {Promise}
     */
    function unwindRecordsIfNecessary(params, finalPass = false) {
        if (options.unwindArrays) {
            const originalRecordsLength = params.records.length;

            // Unwind each of the documents at the given headerField
            params.headerFields.forEach((headerField) => {
                params.records = utils.unwind(params.records, headerField);
            });

            return retrieveHeaderFields(params.records)
                .then((headerFields) => {
                    params.headerFields = headerFields;

                    // If we were able to unwind more arrays, then try unwinding again...
                    if (originalRecordsLength !== params.records.length) {
                        return unwindRecordsIfNecessary(params);
                    }
                    // Otherwise, we didn't unwind any additional arrays, so continue...

                    // Run a final time in case the earlier unwinding exposed additional
                    // arrays to unwind...
                    if (!finalPass) {
                        return unwindRecordsIfNecessary(params, true);
                    }

                    // If keys were provided, set the headerFields to the provided keys:
                    if (options.keys) {
                        params.headerFields = filterExcludedKeys(options.keys);
                    }
                    return params;
                });
        }
        return params;
    }

    /**
     * Main function which handles the processing of a record, or document to be converted to CSV format
     * This function specifies and performs the necessary operations in the necessary order
     * in order to obtain the data and convert it to CSV form while maintaining RFC 4180 compliance.
     * * Order of operations:
     * - Get fields from provided key list (as array of actual values)
     * - Convert the values to csv/string representation [possible option here for custom converters?]
     * - Trim fields
     * - Determine if they need to be wrapped (& wrap if necessary)
     * - Combine values for each line (by joining by field delimiter)
     * @param params
     * @returns {*}
     */
    function processRecords(params) {
        params.records = params.records.map((record) => {
            // Retrieve data for each of the headerFields from this record
            let recordFieldData = retrieveRecordFieldData(record, params.headerFields),

                // Process the data in this record and return the
                processedRecordData = recordFieldData.map((fieldValue) => {
                    fieldValue = trimRecordFieldValue(fieldValue);
                    fieldValue = customValueParser ? customValueParser(fieldValue, recordFieldValueToString) : recordFieldValueToString(fieldValue);
                    fieldValue = preventCsvInjection(fieldValue);
                    fieldValue = wrapFieldValueIfNecessary(fieldValue);

                    return fieldValue;
                });

            // Join the record data by the field delimiter
            return generateCsvRowFromRecord(processedRecordData);
        }).join(options.delimiter.eol);

        return params;
    }

    /**
     * Helper function intended to process *just* array values when the expandArrayObjects setting is set to true
     * @param recordFieldValue
     * @returns {*} processed array value
     */
    function processRecordFieldDataForExpandedArrayObject(recordFieldValue) {
        let filteredRecordFieldValue = utils.removeEmptyFields(recordFieldValue);

        // If we have an array and it's either empty of full of empty values, then use an empty value representation
        if (!recordFieldValue.length || !filteredRecordFieldValue.length) {
            return options.emptyFieldValue || '';
        } else if (filteredRecordFieldValue.length === 1) {
            // Otherwise, we have an array of actual values...
            // Since we are expanding array objects, we will want to key in on values of objects.
            return filteredRecordFieldValue[0]; // Extract the single value in the array
        }

        return recordFieldValue;
    }

    /**
     * Gets all field values from a particular record for the given list of fields
     * @param record
     * @param fields
     * @returns {Array}
     */
    function retrieveRecordFieldData(record, fields) {
        let recordValues = [];

        fields.forEach((field) => {
            let recordFieldValue = path.evaluatePath(record, field);

            if (!utils.isUndefined(options.emptyFieldValue) && utils.isEmptyField(recordFieldValue)) {
                recordFieldValue = options.emptyFieldValue;
            } else if (options.expandArrayObjects && Array.isArray(recordFieldValue)) {
                recordFieldValue = processRecordFieldDataForExpandedArrayObject(recordFieldValue);
            }

            recordValues.push(recordFieldValue);
        });

        return recordValues;
    }

    /**
     * Converts a record field value to its string representation
     * @param fieldValue
     * @returns {*}
     */
    function recordFieldValueToString(fieldValue) {
        const isDate = utils.isDate(fieldValue); // store to avoid checking twice

        if (utils.isNull(fieldValue) || Array.isArray(fieldValue) || utils.isObject(fieldValue) && !isDate) {
            return JSON.stringify(fieldValue);
        } else if (utils.isUndefined(fieldValue)) {
            return 'undefined';
        } else if (isDate && options.useDateIso8601Format) {
            return fieldValue.toISOString();
        } else {
            return !options.useLocaleFormat ? fieldValue.toString() : fieldValue.toLocaleString();
        }
    }

    /**
     * Trims the record field value, if specified by the user's provided options
     * @param fieldValue
     * @returns {*}
     */
    function trimRecordFieldValue(fieldValue) {
        if (options.trimFieldValues) {
            if (Array.isArray(fieldValue)) {
                return fieldValue.map(trimRecordFieldValue);
            } else if (utils.isString(fieldValue)) {
                return fieldValue.trim();
            }
            return fieldValue;
        }
        return fieldValue;
    }

    /**
     * Prevent CSV injection on strings if specified by the user's provided options.
     * Mitigation will be done by ensuring that the first character doesn't being with:
     * Equals (=), Plus (+), Minus (-), At (@), Tab (0x09), Carriage return (0x0D).
     * More info: https://owasp.org/www-community/attacks/CSV_Injection
     * @param fieldValue
     * @returns {*}
     */
    function preventCsvInjection(fieldValue) {
        if (options.preventCsvInjection) {
            if (Array.isArray(fieldValue)) {
                return fieldValue.map(preventCsvInjection);
            } else if (utils.isString(fieldValue) && !utils.isNumber(fieldValue)) {
                return fieldValue.replace(/^[=+\-@\t\r]+/g, '');
            }
            return fieldValue;
        }
        return fieldValue;
    }

    /**
     * Escapes quotation marks in the field value, if necessary, and appropriately
     * wraps the record field value if it contains a comma (field delimiter),
     * quotation mark (wrap delimiter), or a line break (CRLF)
     * @param fieldValue
     * @returns {*}
     */
    function wrapFieldValueIfNecessary(fieldValue) {
        const wrapDelimiter = options.delimiter.wrap;

        // eg. includes quotation marks (default delimiter)
        if (fieldValue.includes(options.delimiter.wrap)) {
            // add an additional quotation mark before each quotation mark appearing in the field value
            fieldValue = fieldValue.replace(wrapDelimiterCheckRegex, wrapDelimiter + wrapDelimiter);
        }
        // if the field contains a comma (field delimiter), quotation mark (wrap delimiter), line break, or CRLF
        //   then enclose it in quotation marks (wrap delimiter)
        if (fieldValue.includes(options.delimiter.field) ||
            fieldValue.includes(options.delimiter.wrap) ||
            fieldValue.match(crlfSearchRegex) ||
            options.wrapBooleans && (fieldValue === 'true' || fieldValue === 'false')) {
            // wrap the field's value in a wrap delimiter (quotation marks by default)
            fieldValue = wrapDelimiter + fieldValue + wrapDelimiter;
        }

        return fieldValue;
    }

    /**
     * Generates the CSV record string by joining the field values together by the field delimiter
     * @param recordFieldValues
     */
    function generateCsvRowFromRecord(recordFieldValues) {
        return recordFieldValues.join(options.delimiter.field);
    }

    /** CSV COMPONENT COMBINER/FINAL PROCESSOR **/
    /**
     * Performs the final CSV construction by combining the fields in the appropriate
     * order depending on the provided options values and sends the generated CSV
     * back to the user
     * @param params
     */
    function generateCsvFromComponents(params) {
        let header = params.header,
            records = params.records,

            // If we are prepending the header, then add an EOL, otherwise just return the records
            csv = (options.excelBOM ? constants.values.excelBOM : '') +
                (options.prependHeader ? header + options.delimiter.eol : '') +
                records;

        return params.callback(null, csv);
    }

    /** MAIN CONVERTER FUNCTION **/

    /**
     * Internally exported json2csv function
     * Takes data as either a document or array of documents and a callback that will be used to report the results
     * @param data {Object|Array<Object>} documents to be converted to csv
     * @param callback {Function} callback function
     */
    function convert(data, callback) {
        // Single document, not an array
        if (utils.isObject(data) && !data.length) {
            data = [data]; // Convert to an array of the given document
        }

        // Retrieve the heading and then generate the CSV with the keys that are identified
        retrieveHeaderFields(data)
            .then((headerFields) => ({
                headerFields,
                callback,
                records: data
            }))
            .then(unwindRecordsIfNecessary)
            .then(processRecords)
            .then(wrapHeaderFields)
            .then(trimHeaderFields)
            .then(generateCsvHeader)
            .then(generateCsvFromComponents)
            .catch(callback);
    }

    return {
        convert,
        validationFn: utils.isObject,
        validationMessages: constants.errors.json2csv
    };
};

module.exports = {
    json2csv: (data, callback, options) => convert(Json2Csv, data, callback, options),
    csv2json: (data, callback, options) => convert(Csv2Json, data, callback, options),
    json2csvAsync: (json, options) => convertAsync(Json2Csv, json, options),
    csv2jsonAsync: (csv, options) => convertAsync(Csv2Json, csv, options)
};

/**
 * Abstracted converter function for json2csv and csv2json functionality
 * Takes in the converter to be used (either Json2Csv or Csv2Json)
 * @param converter
 * @param data
 * @param callback
 * @param options
 */
function convert(converter, data, callback, options) {
    return utils.convert({
        data: data,
        callback,
        options,
        converter: converter
    });
}

/**
 * Simple way to promisify a callback version of json2csv or csv2json
 * @param converter
 * @param data
 * @param options
 * @returns {Promise<any>}
 */
function convertAsync(converter, data, options) {
    return new Promise((resolve, reject) => convert(converter, data, (err, data) => {
        if (err) {
            return reject(err);
        }
        return resolve(data);
    }, options));
}
