"use strict";
const locale = require('locale-codes')

var variableManager = require('./lib/variablemanager.js');

var util = require('./lib/util/util.js');
const { readFile:_readFile } = require('fs');
const { promisify } = require('util');
const { BL } = require('./lib/bll/bl.js');
const DateTime = require('./bll/dateTime.js');

const readFileAsync = promisify(_readFile);

async function readFile(path, ops) { return await readFileAsync(path, ops); }

module.exports =
{
    async getLibrary({ homey, params }) {
        if (params) switch (params.library) {
            case "bll": return {file:await readFile('/bll/bll.js', {encoding:'utf8'})};            
            case "lodash": return {file:await readFile('/assets/js/lodash.min.js', {encoding:'utf8'})};
            case "mathjs": return {file:await readFile('/lib/util/math.js', {encoding:'utf8'})};
            case "datetime": return {file:await readFile('/bll/dateTime.js', {encoding:'utf8'})};
            case "coding": return {file:await readFile('/bll/coding.js', {encoding:'utf8'})};
        }
        return null;
    },
    async decode({ homey, body }) {
        return await homey.app.runCoding({text:body.text, date:body.date, locale:body.locale, timeZone:body.timeZone});
    },

    async date({ homey, body }) {
        let r =  await BL.datetime.toString(body.format, body.date, body.locale,body.timeZone);
        return r;
    },
    async getLocale({ homey }) {
        return await homey.app.locale.default;
    },

    async getLocales({ homey }) {
        return await locale.all;
    },

    async getTimeZones({ homey }) {
        return [
            "Africa/Abidjan",
            "Africa/Accra",
            "Africa/Algiers",
            "Africa/Bissau",
            "Africa/Cairo",
            "Africa/Casablanca",
            "Africa/Ceuta",
            "Africa/El_Aaiun",
            "Africa/Johannesburg",
            "Africa/Juba",
            "Africa/Khartoum",
            "Africa/Lagos",
            "Africa/Maputo",
            "Africa/Monrovia",
            "Africa/Nairobi",
            "Africa/Ndjamena",
            "Africa/Sao_Tome",
            "Africa/Tripoli",
            "Africa/Tunis",
            "Africa/Windhoek",
            "America/Adak",
            "America/Anchorage",
            "America/Araguaina",
            "America/Argentina/Buenos_Aires",
            "America/Argentina/Catamarca",
            "America/Argentina/Cordoba",
            "America/Argentina/Jujuy",
            "America/Argentina/La_Rioja",
            "America/Argentina/Mendoza",
            "America/Argentina/Rio_Gallegos",
            "America/Argentina/Salta",
            "America/Argentina/San_Juan",
            "America/Argentina/San_Luis",
            "America/Argentina/Tucuman",
            "America/Argentina/Ushuaia",
            "America/Asuncion",
            "America/Atikokan",
            "America/Bahia",
            "America/Bahia_Banderas",
            "America/Barbados",
            "America/Belem",
            "America/Belize",
            "America/Blanc-Sablon",
            "America/Boa_Vista",
            "America/Bogota",
            "America/Boise",
            "America/Cambridge_Bay",
            "America/Campo_Grande",
            "America/Cancun",
            "America/Caracas",
            "America/Cayenne",
            "America/Chicago",
            "America/Chihuahua",
            "America/Costa_Rica",
            "America/Creston",
            "America/Cuiaba",
            "America/Curacao",
            "America/Danmarkshavn",
            "America/Dawson",
            "America/Dawson_Creek",
            "America/Denver",
            "America/Detroit",
            "America/Edmonton",
            "America/Eirunepe",
            "America/El_Salvador",
            "America/Fort_Nelson",
            "America/Fortaleza",
            "America/Glace_Bay",
            "America/Godthab",
            "America/Goose_Bay",
            "America/Grand_Turk",
            "America/Guatemala",
            "America/Guayaquil",
            "America/Guyana",
            "America/Halifax",
            "America/Havana",
            "America/Hermosillo",
            "America/Indiana/Indianapolis",
            "America/Indiana/Knox",
            "America/Indiana/Marengo",
            "America/Indiana/Petersburg",
            "America/Indiana/Tell_City",
            "America/Indiana/Vevay",
            "America/Indiana/Vincennes",
            "America/Indiana/Winamac",
            "America/Inuvik",
            "America/Iqaluit",
            "America/Jamaica",
            "America/Juneau",
            "America/Kentucky/Louisville",
            "America/Kentucky/Monticello",
            "America/La_Paz",
            "America/Lima",
            "America/Los_Angeles",
            "America/Maceio",
            "America/Managua",
            "America/Manaus",
            "America/Martinique",
            "America/Matamoros",
            "America/Mazatlan",
            "America/Menominee",
            "America/Merida",
            "America/Metlakatla",
            "America/Mexico_City",
            "America/Miquelon",
            "America/Moncton",
            "America/Monterrey",
            "America/Montevideo",
            "America/Nassau",
            "America/New_York",
            "America/Nipigon",
            "America/Nome",
            "America/Noronha",
            "America/North_Dakota/Beulah",
            "America/North_Dakota/Center",
            "America/North_Dakota/New_Salem",
            "America/Ojinaga",
            "America/Panama",
            "America/Pangnirtung",
            "America/Paramaribo",
            "America/Phoenix",
            "America/Port-au-Prince",
            "America/Port_of_Spain",
            "America/Porto_Velho",
            "America/Puerto_Rico",
            "America/Punta_Arenas",
            "America/Rainy_River",
            "America/Rankin_Inlet",
            "America/Recife",
            "America/Regina",
            "America/Resolute",
            "America/Rio_Branco",
            "America/Santarem",
            "America/Santiago",
            "America/Santo_Domingo",
            "America/Sao_Paulo",
            "America/Scoresbysund",
            "America/Sitka",
            "America/St_Johns",
            "America/Swift_Current",
            "America/Tegucigalpa",
            "America/Thule",
            "America/Thunder_Bay",
            "America/Tijuana",
            "America/Toronto",
            "America/Vancouver",
            "America/Whitehorse",
            "America/Winnipeg",
            "America/Yakutat",
            "America/Yellowknife",
            "Antarctica/Casey",
            "Antarctica/Davis",
            "Antarctica/DumontDUrville",
            "Antarctica/Macquarie",
            "Antarctica/Mawson",
            "Antarctica/Palmer",
            "Antarctica/Rothera",
            "Antarctica/Syowa",
            "Antarctica/Troll",
            "Antarctica/Vostok",
            "Asia/Almaty",
            "Asia/Amman",
            "Asia/Anadyr",
            "Asia/Aqtau",
            "Asia/Aqtobe",
            "Asia/Ashgabat",
            "Asia/Atyrau",
            "Asia/Baghdad",
            "Asia/Baku",
            "Asia/Bangkok",
            "Asia/Barnaul",
            "Asia/Beirut",
            "Asia/Bishkek",
            "Asia/Brunei",
            "Asia/Chita",
            "Asia/Choibalsan",
            "Asia/Colombo",
            "Asia/Damascus",
            "Asia/Dhaka",
            "Asia/Dili",
            "Asia/Dubai",
            "Asia/Dushanbe",
            "Asia/Famagusta",
            "Asia/Gaza",
            "Asia/Hebron",
            "Asia/Ho_Chi_Minh",
            "Asia/Hong_Kong",
            "Asia/Hovd",
            "Asia/Irkutsk",
            "Asia/Jakarta",
            "Asia/Jayapura",
            "Asia/Jerusalem",
            "Asia/Kabul",
            "Asia/Kamchatka",
            "Asia/Karachi",
            "Asia/Kathmandu",
            "Asia/Khandyga",
            "Asia/Kolkata",
            "Asia/Krasnoyarsk",
            "Asia/Kuala_Lumpur",
            "Asia/Kuching",
            "Asia/Macau",
            "Asia/Magadan",
            "Asia/Makassar",
            "Asia/Manila",
            "Asia/Nicosia",
            "Asia/Novokuznetsk",
            "Asia/Novosibirsk",
            "Asia/Omsk",
            "Asia/Oral",
            "Asia/Pontianak",
            "Asia/Pyongyang",
            "Asia/Qatar",
            "Asia/Qostanay",
            "Asia/Qyzylorda",
            "Asia/Riyadh",
            "Asia/Sakhalin",
            "Asia/Samarkand",
            "Asia/Seoul",
            "Asia/Shanghai",
            "Asia/Singapore",
            "Asia/Srednekolymsk",
            "Asia/Taipei",
            "Asia/Tashkent",
            "Asia/Tbilisi",
            "Asia/Tehran",
            "Asia/Thimphu",
            "Asia/Tokyo",
            "Asia/Tomsk",
            "Asia/Ulaanbaatar",
            "Asia/Urumqi",
            "Asia/Ust-Nera",
            "Asia/Vladivostok",
            "Asia/Yakutsk",
            "Asia/Yangon",
            "Asia/Yekaterinburg",
            "Asia/Yerevan",
            "Atlantic/Azores",
            "Atlantic/Bermuda",
            "Atlantic/Canary",
            "Atlantic/Cape_Verde",
            "Atlantic/Faroe",
            "Atlantic/Madeira",
            "Atlantic/Reykjavik",
            "Atlantic/South_Georgia",
            "Atlantic/Stanley",
            "Australia/Adelaide",
            "Australia/Brisbane",
            "Australia/Broken_Hill",
            "Australia/Currie",
            "Australia/Darwin",
            "Australia/Eucla",
            "Australia/Hobart",
            "Australia/Lindeman",
            "Australia/Lord_Howe",
            "Australia/Melbourne",
            "Australia/Perth",
            "Australia/Sydney",
            "Europe/Amsterdam",
            "Europe/Andorra",
            "Europe/Astrakhan",
            "Europe/Athens",
            "Europe/Belgrade",
            "Europe/Berlin",
            "Europe/Brussels",
            "Europe/Bucharest",
            "Europe/Budapest",
            "Europe/Chisinau",
            "Europe/Copenhagen",
            "Europe/Dublin",
            "Europe/Gibraltar",
            "Europe/Helsinki",
            "Europe/Istanbul",
            "Europe/Kaliningrad",
            "Europe/Kiev",
            "Europe/Kirov",
            "Europe/Lisbon",
            "Europe/London",
            "Europe/Luxembourg",
            "Europe/Madrid",
            "Europe/Malta",
            "Europe/Minsk",
            "Europe/Monaco",
            "Europe/Moscow",
            "Europe/Oslo",
            "Europe/Paris",
            "Europe/Prague",
            "Europe/Riga",
            "Europe/Rome",
            "Europe/Samara",
            "Europe/Saratov",
            "Europe/Simferopol",
            "Europe/Sofia",
            "Europe/Stockholm",
            "Europe/Tallinn",
            "Europe/Tirane",
            "Europe/Ulyanovsk",
            "Europe/Uzhgorod",
            "Europe/Vienna",
            "Europe/Vilnius",
            "Europe/Volgograd",
            "Europe/Warsaw",
            "Europe/Zaporozhye",
            "Europe/Zurich",
            "Indian/Chagos",
            "Indian/Christmas",
            "Indian/Cocos",
            "Indian/Kerguelen",
            "Indian/Mahe",
            "Indian/Maldives",
            "Indian/Mauritius",
            "Indian/Reunion",
            "Pacific/Apia",
            "Pacific/Auckland",
            "Pacific/Bougainville",
            "Pacific/Chatham",
            "Pacific/Chuuk",
            "Pacific/Easter",
            "Pacific/Efate",
            "Pacific/Enderbury",
            "Pacific/Fakaofo",
            "Pacific/Fiji",
            "Pacific/Funafuti",
            "Pacific/Galapagos",
            "Pacific/Gambier",
            "Pacific/Guadalcanal",
            "Pacific/Guam",
            "Pacific/Honolulu",
            "Pacific/Kiritimati",
            "Pacific/Kosrae",
            "Pacific/Kwajalein",
            "Pacific/Majuro",
            "Pacific/Marquesas",
            "Pacific/Nauru",
            "Pacific/Niue",
            "Pacific/Norfolk",
            "Pacific/Noumea",
            "Pacific/Pago_Pago",
            "Pacific/Palau",
            "Pacific/Pitcairn",
            "Pacific/Pohnpei",
            "Pacific/Port_Moresby",
            "Pacific/Rarotonga",
            "Pacific/Tahiti",
            "Pacific/Tarawa",
            "Pacific/Tongatapu",
            "Pacific/Wake",
            "Pacific/Wallis"
        ];
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

            variableManager.updateVariable(variable.name, new Date().toISOString(), variable.type);
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
                variableManager.updateVariable(variable.name, variable.value + parseFloat(params.value), variable.type);
                return "OK";
            }
            if (params.action.toLowerCase() === "d" || params.action.toLowerCase() === "decrement") {
                variableManager.updateVariable(variable.name, variable.value - parseFloat(params.value), variable.type);
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
                            variableManager.updateVariable(variable.name, (!oldVariable.value), variable.type);
                        } else {
                            variableManager.updateVariable(variable.name, (params.value === 'true'), variable.type);
                        }
                        return "OK";
                    }
                    throw new Error("Incorrect value for boolean: " + params.value);
                }
                if (variable.type === "number") {
                    if (isNumber(params.value)) {
                        variableManager.updateVariable(variable.name, parseFloat(params.value), variable.type);
                        return "OK";
                    }
                    throw new Error("Incorrect value for number: " + params.value);

                }
                if (variable.type === "string") {
                    if (typeof params.value === "string") {
                        variableManager.updateVariable(variable.name, params.value, variable.type);
                        return "OK";
                    }
                    throw new Error("Incorrect value for string: " + params.value);

                }
                return "OK";
            }
            throw new Error("Variable not found");

        }
        throw new Error("Incorect call");
    }
};


function isNumber(obj) { return !isNaN(parseFloat(obj)); }
