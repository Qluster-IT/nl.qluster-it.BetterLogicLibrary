"use strict";
const locale = require('locale-codes');

var variableManager = require('./lib/variablemanager.js');

//var util = require('./lib/util/util.js');
const { readFile: _readFile } = require('fs');
const { promisify } = require('util');
const { BL } = require("betterlogiclibrary");

const readFileAsync = promisify(_readFile);

async function readFile(path, ops) { return await readFileAsync(path, ops); }

module.exports =
{
    async getLibrary({ homey, params }) {
        //homey.log('getLibrary', params, __dirname);
        try {
            if (params) switch (params.library) {
                case "bll": return { file: await readFile(__dirname + '/bll/bll.js', { encoding: 'utf8' }) };
                case "lodash": return { file: await readFile(__dirname + '/assets/js/lodash.min.js', { encoding: 'utf8' }) };
                case "mathjs": return { file: await readFile(__dirname + '/lib/util/math.js', { encoding: 'utf8' }) };
                case "datetime": return { file: await readFile(__dirname + '/bll/dateTime.js', { encoding: 'utf8' }) };
                case "coding": return { file: await readFile(__dirname + '/bll/coding.js', { encoding: 'utf8' }) };
                case "proto": return { file: await readFile(__dirname + '/bll/proto.js', { encoding: 'utf8' }) };
                case "json": return { file: await readFile(__dirname + '/bll/json.js', { encoding: 'utf8' }) };
                case "write-excel-file-min": return { file: await readFile(__dirname + '/lib/write-excel-file-min.js', { encoding: 'utf8' }) };
                case "json2csv": return { file: await readFile(__dirname + '/lib/json2csv.js', { encoding: 'utf8' }) };
            }
            return null;
        } catch (error) {
            homey.error(error);
            throw error;
        }
    },
    async decode({ homey, body }) {
        return await homey.app.runCoding({ text: body.text, date: body.date, locale: body.locale, timeZone: body.timeZone });
    },

    async date({ homey, body }) {
        return await BL.datetime.toString(body.format, body.date, body.locale, body.timeZone);
    },

    async getLocale({ homey }) {
        return await homey.app.locale;
    },

    async getExports({ homey }) {
        return await homey.app.exportsSettings;
    },
    async getVariablesDownloadUrl({ homey, params: { returnType } }) {
        let callback = (link) => {
            homey.api.realtime('downloadFileReady', link)
        };

        try {
            const vars = variableManager.getVariables();
            switch (returnType) {
                case 'csv': {
                    let filename = homey.app.exportsSettings && homey.app.exportsSettings.csvFilename ?
                        await BL.decode(homey.app.exportsSettings.csvFilename) :
                        "Vars " + BL.datetime.toString('datetimeshort') + '.csv';

                    const link = await BL.getDownloadUrl({ contentType: 'text/csv', filename });
                    homey.setTimeout(async () => {
                        const logs = await homey.app.Log.getLogs({ returnType: 'csv' });
                        await BL.setDownloadUrl({ link, text: logs.csv, callback });
                    }, 0);
                    return link;
                }
                    break;
                case 'xlsx': {
                    try {
                        let filename = homey.app.exportsSettings && homey.app.exportsSettings.xlsxFilename ?
                            await BL.decode(homey.app.exportsSettings.xlsxFilename) :
                            "Vars " + BL.datetime.toString('datetimeshort') + '.xlsx';

                        const link = await BL.getDownloadUrl({ contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename });
                        homey.setTimeout(async () => {
                            let date = BL.json.exports.excel_defaultdateformat || 'yyyy-mm-dd hh:mm:ss';
                            let schema = [
                                {
                                    column: BL.homey.__('Name'),
                                    type: String,
                                    value: v => v.name,
                                    width: BL._.max([BL._.max(BL._.map(vars, 'name.length')), BL.homey.__('Name').length])
                                },
                                {
                                    column: BL.homey.__('Value'),
                                    type: String,
                                    value: v => v.value ? v.value.toString() : undefined,
                                    width: BL._.max([BL._.max(BL._.map(vars, 'value.length')), BL.homey.__('Value').length])
                                },
                                {
                                    column: BL.homey.__('Type'),
                                    type: String,
                                    value: v => v.type,
                                    width: BL._.max([BL._.max(BL._.map(vars, 'type.length')), BL.homey.__('Type').length])
                                },
                                {
                                    column: BL.homey.__('Last Changed'),
                                    type: Date,
                                    format: date,
                                    value: v => BL.datetime.toLocale(v.lastChanged),
                                    width: date.length
                                },
                                {
                                    column: BL.homey.__('Auto'),
                                    type: Boolean,
                                    value: v => v.auto,
                                    width: BL._.max(BL.homey.__('Auto').length, 6)
                                }
                            ];
                            if (BL.homey.app.exportsSettings.includeUtcInExcel) schema.unshift({
                                column: BL.homey.__('Last Changed') + ' (UTC)',
                                type: String,
                                value: x => x.lastChanged ? new Date(x.lastChanged).toISOString() : null,
                                width: new Date().toISOString().length // iso dates
                            });
                            let xlsxBuffer = await BL.json.toExcel(vars, {
                                schema,
                                sheet: BL.homey.__('Variables'),// + BL.datetime.toString('datetime'),
                                stickyRowsCount: 1,
                                buffer: true, //returnType == 'xlsx' ? true : false,
                                //dateFormat: 'yyyy-mm-ddThh:mm:ss'
                            });
                            await BL.setDownloadUrl({ link, buffer: xlsxBuffer, callback });
                        }, 0);
                        return link;
                    } catch (error) {
                        homey.error(error);
                    }
                }
                    break;
                case 'json': {
                    let filename = //false && //LET OP! false weg
                        homey.app.exportsSettings && homey.app.exportsSettings.jsonFilename ?
                            await BL.decode(homey.app.exportsSettings.jsonFilename) :
                            "Vars " + BL.datetime.toString('datetimeshort') + '.json';

                    const link = await BL.getDownloadUrl({ contentType: 'text/json', filename });
                    homey.setTimeout(async () => {
                        await BL.setDownloadUrl({ link, text: JSON.stringify(vars), callback });
                    }, 0);
                    return link;
                }
            }
            if (returnType === 'csv') {
            }
        } catch (error) {
            //homey.error(error);
            let msg = error.message || error;
            if (msg.indexOf('App Not Ready') > -1) throw new Error(homey.__('bllNotRunning'));
        }
    },
    async getLocales({ homey }) {
        return await locale.all;
    },

    async getTimeZones({ homey }) {
        return homey.app.timezones;
    },
    async getVariable({ homey, params }) {
        if (params && params.variable) {
            if (params.variable.toLowerCase() === 'all') {
                return null, variableManager.getVariables();
            }
            var variable = variableManager.getVariable(params.variable);
            if (variable) {
                return { name: variable.name, type: variable.type, value: variable.value };
            }
        }
        return "Incorrect call";

    },
    async triggerVariable({ homey, params }) {
        if (params && params.variable) {

            var variable = variableManager.getVariable(params.variable);
            if (!variable) {
                throw new Error("Variable not found");
            }
            if (variable.type !== "trigger") {
                throw new Error("Only a trigger can be triggered");
            }

            await variableManager.updateVariable(variable.name, new Date().toISOString(), variable.type);
            return "OK";
        }
        throw new Error("Incorect call");

    },

    async setVariableAction({ homey, params }) {
        if (params && params.variable && params.value && params.action) {
            if (params.action.toLowerCase() !== 'i' && params.action.toLowerCase() !== 'd' &&
                params.action.toLowerCase() !== 'increment' && params.action.toLowerCase() !== 'decrement') {
                throw new Error("Invalid action. Specify increment or decrement.");
            }

            var variable = variableManager.getVariable(params.variable);
            if (!variable) {
                throw new Error("Variable not found");
            }
            if (variable.type !== "number") {
                throw new Error("Can only increment or decrement numbers");
            }
            if (params.action.toLowerCase() === "i" || params.action.toLowerCase() === "increment") {
                await variableManager.updateVariable(variable.name, variable.value + parseFloat(params.value), variable.type);
                return "OK";
            }
            if (params.action.toLowerCase() === "d" || params.action.toLowerCase() === "decrement") {
                await variableManager.updateVariable(variable.name, variable.value - parseFloat(params.value), variable.type);
                return "OK";
            }
            throw new Error("Incorect call");
        }
    },

    async setVariable({ homey, params }) {
        if (params && params.variable && params.value) {
            var variable = variableManager.getVariable(params.variable);
            if (variable) {
                if (variable.type === "boolean") {
                    if (params.value === "true" || params.value === "false" || params.value === "toggle") {

                        if (params.value === "toggle") {
                            var oldVariable = variableManager.getVariable(variable.name);
                            await variableManager.updateVariable(variable.name, (!oldVariable.value), variable.type);
                        } else {
                            await variableManager.updateVariable(variable.name, (params.value === 'true'), variable.type);
                        }
                        return "OK";
                    }
                    throw new Error("Incorrect value for boolean: " + params.value);
                }
                if (variable.type === "number") {
                    if (isNumber(params.value)) {
                        await variableManager.updateVariable(variable.name, parseFloat(params.value), variable.type);
                        return "OK";
                    }
                    throw new Error("Incorrect value for number: " + params.value);

                }
                if (variable.type === "string") {
                    if (typeof params.value === "string") {
                        await variableManager.updateVariable(variable.name, params.value, variable.type);
                        return "OK";
                    }
                    throw new Error("Incorrect value for string: " + params.value);

                }
                return "OK";
            }
            throw new Error("Variable not found");

        }
        throw new Error("Incorect call");
    },
    async getDownloadUrl({ homey, body }) {
        return await homey.app.getDownloadUrl(body);
    }
};


function isNumber(obj) { return !isNaN(parseFloat(obj)); }
