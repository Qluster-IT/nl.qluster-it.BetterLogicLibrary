//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters

//https://learn.microsoft.com/en-us/dotnet/standard/base-types/custom-date-and-time-format-strings
//https://docs.angularjs.org/api/ng/filter/date

const { BL } = require("betterlogiclibrary");
const localesTags = [
  "aa",
  "aa-DJ",
  "aa-ER",
  "aa-ET",
  "af",
  "af-NA",
  "af-ZA",
  "agq",
  "agq-CM",
  "ak",
  "ak-GH",
  "sq",
  "sq-AL",
  "sq-MK",
  "gsw",
  "gsw-FR",
  "gsw-LI",
  "gsw-CH",
  "am",
  "am-ET",
  "ar",
  "ar-DZ",
  "ar-BH",
  "ar-TD",
  "ar-KM",
  "ar-DJ",
  "ar-EG",
  "ar-ER",
  "ar-IQ",
  "ar-IL",
  "ar-JO",
  "ar-KW",
  "ar-LB",
  "ar-LY",
  "ar-MR",
  "ar-MA",
  "ar-OM",
  "ar-PS",
  "ar-QA",
  "ar-SA",
  "ar-SO",
  "ar-SS",
  "ar-SD",
  "ar-SY",
  "ar-TN",
  "ar-AE",
  "ar-001",
  "ar-YE",
  "hy",
  "hy-AM",
  "as",
  "as-IN",
  "ast",
  "ast-ES",
  "asa",
  "asa-TZ",
  "az-Cyrl",
  "az-Cyrl-AZ",
  "az",
  "az-Latn",
  "az-Latn-AZ",
  "ksf",
  "ksf-CM",
  "bm",
  "bm-Latn-ML",
  "bn",
  "bn-BD",
  "bn-IN",
  "bas",
  "bas-CM",
  "ba",
  "ba-RU",
  "eu",
  "eu-ES",
  "be",
  "be-BY",
  "bem",
  "bem-ZM",
  "bez",
  "bez-TZ",
  "byn",
  "byn-ER",
  "brx",
  "brx-IN",
  "bs-Cyrl",
  "bs-Cyrl-BA",
  "bs-Latn",
  "bs",
  "bs-Latn-BA",
  "br",
  "br-FR",
  "bg",
  "bg-BG",
  "my",
  "my-MM",
  "ca",
  "ca-AD",
  "ca-FR",
  "ca-IT",
  "ca-ES",
  "ceb",
  "ceb-Latn",
  "ceb-Latn-PH",
  "tzm-Latn-",
  "ku",
  "ku-Arab",
  "ku-Arab-IQ",
  "ccp",
  "ccp-Cakm",
  "ccp-Cakm-",
  "cd-RU",
  "chr",
  "chr-Cher",
  "chr-Cher-US",
  "cgg",
  "cgg-UG",
  "zh-Hans",
  "zh",
  "zh-CN",
  "zh-SG",
  "zh-Hant",
  "zh-HK",
  "zh-MO",
  "zh-TW",
  "cu-RU",
  "swc",
  "swc-CD",
  "kw",
  "kw-GB",
  "co",
  "co-FR",
  "hr",
  "hr-HR",
  "hr-BA",
  "cs",
  "cs-CZ",
  "da",
  "da-DK",
  "da-GL",
  "prs",
  "prs-AF",
  "dv",
  "dv-MV",
  "dua",
  "dua-CM",
  "nl",
  "nl-AW",
  "nl-BE",
  "nl-BQ",
  "nl-CW",
  "nl-NL",
  "nl-SX",
  "nl-SR",
  "dz",
  "dz-BT",
  "ebu",
  "ebu-KE",
  "en",
  "en-AS",
  "en-AI",
  "en-AG",
  "en-AU",
  "en-AT",
  "en-BS",
  "en-BB",
  "en-BE",
  "en-BZ",
  "en-BM",
  "en-BW",
  "en-IO",
  "en-VG",
  "en-BI",
  "en-CM",
  "en-CA",
  "en-029",
  "en-KY",
  "en-CX",
  "en-CC",
  "en-CK",
  "en-CY",
  "en-DK",
  "en-DM",
  "en-ER",
  "en-150",
  "en-FK",
  "en-FI",
  "en-FJ",
  "en-GM",
  "en-DE",
  "en-GH",
  "en-GI",
  "en-GD",
  "en-GU",
  "en-GG",
  "en-GY",
  "en-HK",
  "en-IN",
  "en-IE",
  "en-IM",
  "en-IL",
  "en-JM",
  "en-JE",
  "en-KE",
  "en-KI",
  "en-LS",
  "en-LR",
  "en-MO",
  "en-MG",
  "en-MW",
  "en-MY",
  "en-MT",
  "en-MH",
  "en-MU",
  "en-FM",
  "en-MS",
  "en-NA",
  "en-NR",
  "en-NL",
  "en-NZ",
  "en-NG",
  "en-NU",
  "en-NF",
  "en-MP",
  "en-PK",
  "en-PW",
  "en-PG",
  "en-PN",
  "en-PR",
  "en-PH",
  "en-RW",
  "en-KN",
  "en-LC",
  "en-VC",
  "en-WS",
  "en-SC",
  "en-SL",
  "en-SG",
  "en-SX",
  "en-SI",
  "en-SB",
  "en-ZA",
  "en-SS",
  "en-SH",
  "en-SD",
  "en-SZ",
  "en-SE",
  "en-CH",
  "en-TZ",
  "en-TK",
  "en-TO",
  "en-TT",
  "en-TC",
  "en-TV",
  "en-UG",
  "en-AE",
  "en-GB",
  "en-US",
  "en-UM",
  "en-VI",
  "en-VU",
  "en-001",
  "en-ZM",
  "en-ZW",
  "eo",
  "eo-001",
  "et",
  "et-EE",
  "ee",
  "ee-GH",
  "ee-TG",
  "ewo",
  "ewo-CM",
  "fo",
  "fo-DK",
  "fo-FO",
  "fil",
  "fil-PH",
  "fi",
  "fi-FI",
  "fr",
  "fr-DZ",
  "fr-BE",
  "fr-BJ",
  "fr-BF",
  "fr-BI",
  "fr-CM",
  "fr-CA",
  "fr-CF",
  "fr-TD",
  "fr-KM",
  "fr-CG",
  "fr-CD",
  "fr-CI",
  "fr-DJ",
  "fr-GQ",
  "fr-FR",
  "fr-GF",
  "fr-PF",
  "fr-GA",
  "fr-GP",
  "fr-GN",
  "fr-HT",
  "fr-LU",
  "fr-MG",
  "fr-ML",
  "fr-MQ",
  "fr-MR",
  "fr-MU",
  "fr-YT",
  "fr-MA",
  "fr-NC",
  "fr-NE",
  "fr-MC",
  "fr-RE",
  "fr-RW",
  "fr-BL",
  "fr-MF",
  "fr-PM",
  "fr-SN",
  "fr-SC",
  "fr-CH",
  "fr-SY",
  "fr-TG",
  "fr-TN",
  "fr-VU",
  "fr-WF",
  "fy",
  "fy-NL",
  "fur",
  "fur-IT",
  "ff",
  "ff-Latn",
  "ff-Latn-BF",
  "ff-CM",
  "ff-Latn-CM",
  "ff-Latn-GM",
  "ff-Latn-GH",
  "ff-GN",
  "ff-Latn-GN",
  "ff-Latn-GW",
  "ff-Latn-LR",
  "ff-MR",
  "ff-Latn-MR",
  "ff-Latn-NE",
  "ff-NG",
  "ff-Latn-NG",
  "ff-Latn-SN",
  "ff-Latn-SL",
  "gl",
  "gl-ES",
  "lg",
  "lg-UG",
  "ka",
  "ka-GE",
  "de",
  "de-AT",
  "de-BE",
  "de-DE",
  "de-IT",
  "de-LI",
  "de-LU",
  "de-CH",
  "el",
  "el-CY",
  "el-GR",
  "kl",
  "kl-GL",
  "gn",
  "gn-PY",
  "gu",
  "gu-IN",
  "guz",
  "guz-KE",
  "ha",
  "ha-Latn",
  "ha-Latn-GH",
  "ha-Latn-NE",
  "ha-Latn-NG",
  "haw",
  "haw-US",
  "he",
  "he-IL",
  "hi",
  "hi-IN",
  "hu",
  "hu-HU",
  "is",
  "is-IS",
  "ig",
  "ig-NG",
  "id",
  "id-ID",
  "ia",
  "ia-FR",
  "ia-001",
  "iu",
  "iu-Latn",
  "iu-Latn-CA",
  "iu-Cans",
  "iu-Cans-CA",
  "ga",
  "ga-IE",
  "it",
  "it-IT",
  "it-SM",
  "it-CH",
  "it-VA",
  "ja",
  "ja-JP",
  "jv",
  "jv-Latn",
  "jv-Latn-ID",
  "dyo",
  "dyo-SN",
  "kea",
  "kea-CV",
  "kab",
  "kab-DZ",
  "kkj",
  "kkj-CM",
  "kln",
  "kln-KE",
  "kam",
  "kam-KE",
  "kn",
  "kn-IN",
  "ks",
  "ks-Arab",
  "ks-Arab-IN",
  "kk",
  "kk-KZ",
  "km",
  "km-KH",
  "quc",
  "quc-Latn-GT",
  "ki",
  "ki-KE",
  "rw",
  "rw-RW",
  "sw",
  "sw-KE",
  "sw-TZ",
  "sw-UG",
  "kok",
  "kok-IN",
  "ko",
  "ko-KR",
  "ko-KP",
  "khq",
  "khq-ML",
  "ses",
  "ses-ML",
  "nmg",
  "nmg-CM",
  "ky",
  "ky-KG",
  "ku-Arab-IR",
  "lkt",
  "lkt-US",
  "lag",
  "lag-TZ",
  "lo",
  "lo-LA",
  "lv",
  "lv-LV",
  "ln",
  "ln-AO",
  "ln-CF",
  "ln-CG",
  "ln-CD",
  "lt",
  "lt-LT",
  "nds",
  "nds-DE",
  "nds-NL",
  "dsb",
  "dsb-DE",
  "lu",
  "lu-CD",
  "luo",
  "luo-KE",
  "lb",
  "lb-LU",
  "luy",
  "luy-KE",
  "mk",
  "mk-MK",
  "jmc",
  "jmc-TZ",
  "mgh",
  "mgh-MZ",
  "kde",
  "kde-TZ",
  "mg",
  "mg-MG",
  "ms",
  "ms-BN",
  "ms-MY",
  "ml",
  "ml-IN",
  "mt",
  "mt-MT",
  "gv",
  "gv-IM",
  "mi",
  "mi-NZ",
  "arn",
  "arn-CL",
  "mr",
  "mr-IN",
  "mas",
  "mas-KE",
  "mas-TZ",
  "mzn-IR",
  "mer",
  "mer-KE",
  "mgo",
  "mgo-CM",
  "moh",
  "moh-CA",
  "mn",
  "mn-Cyrl",
  "mn-MN",
  "mn-Mong",
  "mn-Mong-CN",
  "mn-Mong-MN",
  "mfe",
  "mfe-MU",
  "mua",
  "mua-CM",
  "nqo",
  "nqo-GN",
  "naq",
  "naq-NA",
  "ne",
  "ne-IN",
  "ne-NP",
  "nnh",
  "nnh-CM",
  "jgo",
  "jgo-CM",
  "lrc-IQ",
  "lrc-IR",
  "nd",
  "nd-ZW",
  "no",
  "nb",
  "nb-NO",
  "nn",
  "nn-NO",
  "nb-SJ",
  "nus",
  "nus-SD",
  "nus-SS",
  "nyn",
  "nyn-UG",
  "oc",
  "oc-FR",
  "or",
  "or-IN",
  "om",
  "om-ET",
  "om-KE",
  "os",
  "os-GE",
  "os-RU",
  "ps",
  "ps-AF",
  "ps-PK",
  "fa",
  "fa-AF",
  "fa-IR",
  "pl",
  "pl-PL",
  "pt",
  "pt-AO",
  "pt-BR",
  "pt-CV",
  "pt-GQ",
  "pt-GW",
  "pt-LU",
  "pt-MO",
  "pt-MZ",
  "pt-PT",
  "pt-ST",
  "pt-CH",
  "pt-TL",
  "prg-001",
  "qps-ploca",
  "qps-ploc",
  "qps-plocm",
  "pa",
  "pa-Arab",
  "pa-IN",
  "pa-Arab-PK",
  "quz",
  "quz-BO",
  "quz-EC",
  "quz-PE",
  "ksh",
  "ksh-DE",
  "ro",
  "ro-MD",
  "ro-RO",
  "rm",
  "rm-CH",
  "rof",
  "rof-TZ",
  "rn",
  "rn-BI",
  "ru",
  "ru-BY",
  "ru-KZ",
  "ru-KG",
  "ru-MD",
  "ru-RU",
  "ru-UA",
  "rwk",
  "rwk-TZ",
  "ssy",
  "ssy-ER",
  "sah",
  "sah-RU",
  "saq",
  "saq-KE",
  "smn",
  "smn-FI",
  "smj",
  "smj-NO",
  "smj-SE",
  "se",
  "se-FI",
  "se-NO",
  "se-SE",
  "sms",
  "sms-FI",
  "sma",
  "sma-NO",
  "sma-SE",
  "sg",
  "sg-CF",
  "sbp",
  "sbp-TZ",
  "sa",
  "sa-IN",
  "gd",
  "gd-GB",
  "seh",
  "seh-MZ",
  "sr-Cyrl",
  "sr-Cyrl-BA",
  "sr-Cyrl-ME",
  "sr-Cyrl-RS",
  "sr-Cyrl-CS",
  "sr-Latn",
  "sr",
  "sr-Latn-BA",
  "sr-Latn-ME",
  "sr-Latn-RS",
  "sr-Latn-CS",
  "nso",
  "nso-ZA",
  "tn",
  "tn-BW",
  "tn-ZA",
  "ksb",
  "ksb-TZ",
  "sn",
  "sn-Latn",
  "sn-Latn-ZW",
  "sd",
  "sd-Arab",
  "sd-Arab-PK",
  "si",
  "si-LK",
  "sk",
  "sk-SK",
  "sl",
  "sl-SI",
  "xog",
  "xog-UG",
  "so",
  "so-DJ",
  "so-ET",
  "so-KE",
  "so-SO",
  "st",
  "st-ZA",
  "nr",
  "nr-ZA",
  "st-LS",
  "es",
  "es-AR",
  "es-BZ",
  "es-VE",
  "es-BO",
  "es-BR",
  "es-CL",
  "es-CO",
  "es-CR",
  "es-CU",
  "es-DO",
  "es-EC",
  "es-SV",
  "es-GQ",
  "es-GT",
  "es-HN",
  "es-419",
  "es-MX",
  "es-NI",
  "es-PA",
  "es-PY",
  "es-PE",
  "es-PH",
  "es-PR",
  "es-ES_tradnl",
  "es-ES",
  "es-US",
  "es-UY",
  "zgh",
  "zgh-Tfng-MA",
  "zgh-Tfng",
  "ss",
  "ss-ZA",
  "ss-SZ",
  "sv",
  "sv-AX",
  "sv-FI",
  "sv-SE",
  "syr",
  "syr-SY",
  "shi",
  "shi-Tfng",
  "shi-Tfng-MA",
  "shi-Latn",
  "shi-Latn-MA",
  "dav",
  "dav-KE",
  "tg",
  "tg-Cyrl",
  "tg-Cyrl-TJ",
  "tzm",
  "tzm-Latn",
  "tzm-Latn-DZ",
  "ta",
  "ta-IN",
  "ta-MY",
  "ta-SG",
  "ta-LK",
  "twq",
  "twq-NE",
  "tt",
  "tt-RU",
  "te",
  "te-IN",
  "teo",
  "teo-KE",
  "teo-UG",
  "th",
  "th-TH",
  "bo",
  "bo-IN",
  "bo-CN",
  "tig",
  "tig-ER",
  "ti",
  "ti-ER",
  "ti-ET",
  "to",
  "to-TO",
  "ts",
  "ts-ZA",
  "tr",
  "tr-CY",
  "tr-TR",
  "tk",
  "tk-TM",
  "uk",
  "uk-UA",
  "hsb",
  "hsb-DE",
  "ur",
  "ur-IN",
  "ur-PK",
  "ug",
  "ug-CN",
  "uz-Arab",
  "uz-Arab-AF",
  "uz-Cyrl",
  "uz-Cyrl-UZ",
  "uz",
  "uz-Latn",
  "uz-Latn-UZ",
  "vai",
  "vai-Vaii",
  "vai-Vaii-LR",
  "vai-Latn-LR",
  "vai-Latn",
  "ca-ES-",
  "ve",
  "ve-ZA",
  "vi",
  "vi-VN",
  "vo",
  "vo-001",
  "vun",
  "vun-TZ",
  "wae",
  "wae-CH",
  "cy",
  "cy-GB",
  "wal",
  "wal-ET",
  "wo",
  "wo-SN",
  "xh",
  "xh-ZA",
  "yav",
  "yav-CM",
  "ii",
  "ii-CN",
  "yo",
  "yo-BJ",
  "yo-NG",
  "dje",
  "dje-NE",
  "zu",
  "zu-ZA"
];

class dateTimeStatics { }

/**
 * Codes
 *
 * @class Codes
 */
class Codes {


  constructor() {
    this.init();
  }
  init() {

    /** @private */
    this.dateTimeCodesArr = BL._.sortBy(BL._.map(DateTime.dateTimeCodes, (x, key) => { return { key, val: x, customisable: true }; }, 'key.length'));
    /** @private */
    this.dateCodesArr = BL._.sortBy(BL._.map(DateTime.dateCodes, (x, key) => { return { key, val: x, customisable: true }; }, 'key.length'));
    /** @private */
    this.timeCodesArr = BL._.sortBy(BL._.map(DateTime.timeCodes, (x, key) => { return { key, val: x, customisable: true }; }, 'key.length'));


    /** @private */
    this.dayPeriodCodesArr = BL._.sortBy(BL._.map(DateTime.dayPeriodCodes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.eraCodesArr = BL._.sortBy(BL._.map(DateTime.eraCodes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.isoCodesArr = BL._.sortBy(BL._.map(DateTime.isoCodes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.timeZoneCodesArr = BL._.sortBy(BL._.map(DateTime.timeZoneCodes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.yearCodesArr = BL._.sortBy(BL._.map(DateTime.yearCodes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.monthCodesArr = BL._.sortBy(BL._.map(DateTime.monthCodes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.dayCodesArr = BL._.sortBy(BL._.map(DateTime.dayCodes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.hourCodesArr = BL._.sortBy(BL._.map(DateTime.hourCodes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.hour12CodesArr = BL._.sortBy(BL._.map(DateTime.hour12Codes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.hour24CodesArr = BL._.sortBy(BL._.map(DateTime.hour24Codes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.amPmCodesArr = BL._.sortBy(BL._.map(DateTime.amPmCodes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.minuteCodesArr = BL._.sortBy(BL._.map(DateTime.minuteCodes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.secondCodesArr = BL._.sortBy(BL._.map(DateTime.secondCodes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.fractionalSecondCodesArr = BL._.sortBy(BL._.map(DateTime.fractionalSecondCodes, (x, key) => { return { key, val: x }; }, 'key.length'));

    /** @private */
    this.arrays = {};
    this.arrays['dayPeriodCodesArr'] = 'getDayPeriod';
    this.arrays['dateTimeCodesArr'] = 'getDateTime';
    this.arrays['dateCodesArr'] = 'getDate';
    this.arrays['timeCodesArr'] = 'getTime';
    this.arrays['eraCodesArr'] = 'getEra';
    this.arrays['isoCodesArr'] = 'getIso';
    this.arrays['timeZoneCodesArr'] = 'getTimeZone';
    this.arrays['yearCodesArr'] = 'getYear';
    this.arrays['monthCodesArr'] = 'getMonth';
    this.arrays['dayCodesArr'] = 'getDay';
    this.arrays['hourCodesArr'] = 'getHour';
    this.arrays['hour12CodesArr'] = 'getHour12';
    this.arrays['hour24CodesArr'] = 'getHour24';
    this.arrays['amPmCodesArr'] = 'getAmPm';
    this.arrays['minuteCodesArr'] = 'getMinute';
    this.arrays['secondCodesArr'] = 'getSecond';
    this.arrays['fractionalSecondCodesArr'] = 'getFractionalSecond';
    /** @private */
    this.array = BL._.sortBy(BL._.flatMap(this.arrays, (val, key) => { return BL._.map(this[key], (code, format) => { return { code: code.key, format: code.val, func: val, customisable: code.customisable }; }); }), (x) => -x.code.length); //return { name:key, func:val, list:this[key]}; });

    /** @private */
    this.timeDayCodesArr = BL._.sortBy(BL._.map(DateTime.timeDayCodes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.timeHourCodesArr = BL._.sortBy(BL._.map(DateTime.timeHourCodes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.timeMinuteCodesArr = BL._.sortBy(BL._.map(DateTime.timeMinuteCodes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.timeSecondCodesArr = BL._.sortBy(BL._.map(DateTime.timeSecondCodes, (x, key) => { return { key, val: x }; }, 'key.length'));
    /** @private */
    this.timeFractionalSecondCodesArr = BL._.sortBy(BL._.map(DateTime.timeFractionalSecondCodes, (x, key) => { return { key, val: x }; }, 'key.length'));


    this.timeArrays = {};
    this.timeArrays['timeDayCodesArr'] = 'getTimeDay';
    this.timeArrays['timeHourCodesArr'] = 'getTimeHour';
    this.timeArrays['timeMinuteCodesArr'] = 'getTimeMinute';
    this.timeArrays['timeSecondCodesArr'] = 'getTimeSecond';
    this.timeArrays['timeFractionalSecondCodesArr'] = 'getTimeFractionalSecond';

    /** @private */
    this.timeArray = BL._.sortBy(BL._.flatMap(this.timeArrays, (val, key) => { return BL._.map(this[key], (code, format) => { return { code: code.key, format: code.val, func: val, customisable: false }; }); }), (x) => -x.code.length); //return { name:key, func:val, list:this[key]}; });



  }
}

class DateTime {

  static get locale() { return dateTimeStatics.locale; }

  static get timeZone() { return dateTimeStatics.timeZone; }

  static get date() { return new Date(); }

  /** @type {Codes} @private */
  static get codes() {
    if (!dateTimeStatics.codes) {
      dateTimeStatics.codes = new Codes();
      console.log('ALERT: dateTimeStatics.codes = new Codes();');
    }
    return dateTimeStatics.codes;
  }

  /** @private */
  static async init(bll) {
    let locale = await bll.get('locale');

    dateTimeStatics.formats = locale ? locale.dateFormats : undefined;
    dateTimeStatics.customFormats = locale ? locale.customDateFormats : undefined;
    dateTimeStatics.locale = locale ? locale.default : await BL.homey.i18n.getLanguage();
    dateTimeStatics.timeZone = BL.homey.clock.getTimezone();
    DateTime.updateFormats();
    this.onRealtime = (event, data) => {
      switch (event) {
        case "bllSetLocale": dateTimeStatics.locale = data.default; dateTimeStatics.formats = data.dateFormats; dateTimeStatics.customFormats = data.customDateFormats; DateTime.updateFormats();
      }
    };
    BL.Current.api.on('realtime', this.onRealtime);
    //this.bll = bll;
  }

  static destroy() {
    BL.homey.log('DateTime.destroy()');
    BL.Current.api.off('realtime', this.onRealtime);

    BL.homey.log('DateTime.destroying');
    // for (const key in this) {
    //   if (Object.hasOwnProperty.call(this, key)) {
    //     try {
    //       delete this[key];
    //     } catch (ex) {}
    //   }
    // }
    //delete this.bll; // Needed?
    BL.L.clearObj(dateTimeStatics);
    BL.L.clearObj(this);
    // BL.homey.log('DateTime.destroying dateTimeStatics clear', BL.L.clearObj(dateTimeStatics));    
    // BL.homey.log('DateTime.destroying dateTimeStatics', Object.keys(dateTimeStatics));


    // BL.homey.log('DateTime.destroying DateTime', Object.keys(this));    
    // BL.homey.log('DateTime.destroying DateTime clear', BL.L.clearObj(this));    
    // BL.homey.log('DateTime.destroying DateTime', Object.keys(this));

    // BL.homey.log('DateTime.destroying datetime', Object.keys(this));    
    // BL.homey.log('DateTime.destroying datetime clear', this.clearObj(this));    
    // BL.homey.log('DateTime.destroying datetime', Object.keys(this));

    BL.homey.log('DateTime.destroyed');
  }

  static toTimeString(format, timeMs, timeSec) {
    if (timeMs)
      if (!format) throw new Error("format is required.");
    if ((timeMs === undefined || timeMs === null) && (timeSec === undefined || timeSec === null)) throw new Error("timeMs or timeSec is required.");
    if (!(timeSec === undefined || timeSec === null)) {
      if (timeMs === undefined || timeMs === null)
        timeMs = timeSec * 1000;
      else timeMs += (timeSec * 1000);
    }
    if (!BL._.isArray(timeMs))
      return new DateTime(null, null, null, timeMs).toTimeString(format, true, DateTime.codes.timeArray);
    else if (BL._.isArray(timeMs)) {
      let r = {};
      for (const _timeMs of timeMs) {
        try {
          if (Object.keys(r).indexOf(_timeMs) === -1) r[_timeMs] = new DateTime(null, null, null, timeMs).toTimeString(format);
        } catch (error) {
          //BL.homey.error(error);
        }
      }
      return r;
    }
  }


  // static getFormats(locale) {
  //   BL.homey.log('getFormats', locale);
  //   let ret = {};
  //   if(!locale) return undefined;
  //   if(locale.dateFormats) ret = locale.dateFormats;
  //   if(locale.customDateFormats && locale.customDateFormats.length) for (let i = 0; i < locale.customDateFormats.length; i++) {
  //     const customDateFormat = locale.customDateFormats[i];
  //     ret[customDateFormat.name] = customDateFormat.format;
  //   }
  //   BL.homey.log('ret', ret);
  //   return ret;
  // }

  /**
   * @param {String|String[]} format 
   * @param {String} locale 
   * @param {String} timeZone 
   * @returns 
   *//**
   * @param {String|String[]} format 
   * @param {String|String[]|Number|Number[]|Date|Date[]} date 
   * @param {String} locale 
   * @param {String} timeZone 
   * @returns 
   */
  static toString(format, date, locale, timeZone) {
    if (!format) throw new Error("format is required.");
    if(typeof(date)=='string' && date.length<=12 && localesTags.indexOf(date)>-1) {
      timeZone = locale;
      locale = date;
      date = undefined;
    }
    if (!BL._.isArray(date)) {
      return new DateTime(locale, timeZone, date ? DateTime.convertToDate(date) : DateTime.date).toString(format);
    } else if (BL._.isArray(date)) {
      let r = {};
      for (const _date of date) {
        try {
          if (Object.keys(r).indexOf(_date) === -1) r[_date] = new DateTime(locale, timeZone, DateTime.convertToDate(_date)).toString(format);
        } catch (error) {
          //BL.homey.error(error);
        }
      }
      return r;
    }
  }

  /**
   * This method will return a new Date with the GMT offset removed(minus).
   * @description Use this when the Date(time) is to be understood as locale time (but is in fact UTC).
   * @param {Date} date 
   * @returns {Date} Returns a new {@link Date}
   */
  static asLocale(date) {
    if (date && !(date instanceof Date)) date = new Date(date);
    return !date ? date : new Date(date.setHours(date.getHours() - Number.parseInt(DateTime.toString('z', date))));
  }
  /**
   * This method will return a new Date with the GMT offset added(plus).
   * @description Use this when you need the UTC time set to locale time (UTC will have the hours of locale).
   * @param {Date} date 
   * @returns {Date} Returns a new {@link Date}
   */
  static toLocale(date) {
    if (date && !(date instanceof Date)) date = new Date(date);
    return !date ? date : new Date(date.setHours(date.getHours() + Number.parseInt(DateTime.toString('z', date))));
  }


  /** @private */
  static convertToDate(date) {
    if (!date) return date;
    if (date instanceof Date) return date;
    if (typeof (date) == 'string' && date.length === "2022-11-10T19:17:01.439Z".length && date.endsWith('Z') && date.substr(10, 1) == 'T') return new Date(date);
    if (typeof (date) == 'object' && date.getTime) return new Date(date.getTime());
    if (typeof (date) == 'string' && /^\d+$/.test(date)) return new Date(Number.parseInt(date));
    if (typeof (date) == 'number') return new Date(date);
    if (typeof (date) == 'string') return new Date(date); // EN by default!
  }

  /** @private */
  static updateFormats() {
    this.codes.init();
    if (dateTimeStatics.formats) for (const format in dateTimeStatics.formats) {
      if (Object.hasOwnProperty.call(dateTimeStatics.formats, format)) {
        const customFormat = dateTimeStatics.formats[format];
        let f = BL._.find(this.codes.array, a => a.customisable && a.code === format);
        if (f) {
          //BL.homey.log('f before: ', f);
          f.originalFunc = f.func;
          f.format = customFormat;
          f.func = 'formatCustom';
          f.customized = true;
          //BL.homey.log('f after : ', f);
        }
      }
    }
    if (dateTimeStatics.customFormats) {
      for (let i = 0; i < dateTimeStatics.customFormats.length; i++) {
        const format = dateTimeStatics.customFormats[i];
        this.codes.array.push({ format: format.format, func: 'formatCustom', originalFunc: 'formatCustom', customized: true, code: format.name, custom: true });
        //const customFormat = dateTimeStatics.customFormats[format];
        // let f = BL._.find(this.codes.array, a=> a.customisable && a.code===format );
        // if(f) {
        //   //BL.homey.log('f before: ', f);
        //   f.originalFunc = f.func;
        //   f.format = customFormat;
        //   f.func = 'formatCustom';
        //   f.customized = true;
        //   //BL.homey.log('f after : ', f);
        // }
      }
      this.codes.array = BL._.sortBy(this.codes.array, (x) => -x.code.length);
    }
    //BL.homey.log('updateFormats', this.codes.array);
  }

  static get(dt) { return new DateTime(undefined, undefined, dt || DateTime.date); }









  get locale() { return this._locale; }
  set locale(v) { this._locale = v; }

  get timeZone() { return this._timeZone; }
  set timeZone(v) { this._timeZone = v; }

  get date() { return this._date; }
  set date(v) { this._date = v; }

  /** @private */
  get(dt) { return new DateTime(this.locale, this.timeZone, dt || new Date()); }


  constructor(locale, timeZone, date, timeMs) {
    this.locale = locale;
    this.timeZone = timeZone;
    this.date = date;
    this.timeMs = timeMs;
  }

  /** @private */
  getString(options) {
    options.timeZone = this.timeZone || DateTime.timeZone;
    //BL.homey.log('getString', this.locale, (this.date || new Date()).toLocaleString(this.locale, options));
    return (this.date || new Date()).toLocaleString(options.locale || this.locale || DateTime.locale, options);
  }

  /**
   * @param {"full"|"long"|"medium"|"short"} format * @returns {String}
   */
  getDateTimeByFormat(format) {
    return this.getString({ dateStyle: format || 'full', timeStyle: format || 'full' });
  }


  /**
   * @param {"full"|"long"|"medium"|"short"} format * @returns {String}
   */
  getDateByFormat(format) {
    return this.getString({ dateStyle: format || 'full' });
  }

  /**
   * @param {"full"|"long"|"medium"|"short"} format * @returns {String}
   */
  getTimeByFormat(format) {
    return this.getString({ timeStyle: format || 'full' });
  }





  /**
   * @param {"narrow"|"short"|"long"} format * @returns {String}
   */
  getDayPeriodByFormat(format) {
    return this.getString({ dayPeriod: format || 'narrow', hour12: true });
  }

  /** 
   * @param {"long"|"short"|"narrow"} format * @returns {String}
   */
  getEraByFormat(format) {
    return removeYear(this.getString({ era: format || 'long', year: 'numeric' }));
  }


  /** 
   * @param {"KK"|"K"|"kk"|"k"|"z"|"zz"|"Z"|"ZZ"} format * @returns {String}
   */
  getTimeZoneByFormat(format) {
    if (format == 'z' || format == 'zz' || format == 'zzz' || format == 'Z' || format == 'ZZ' || format == 'ZZZ') {
      let options =
      {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
        locale: 'en'
      };
      let val = this.getString(options);
      val = Number.parseInt(BL._.last(val.split('GMT')) || '0');
      //BL.homey.log('Date z: ', val);
      let result = (val > 0 ? '+' : '-') + val.toString().padStart(format.length > 1 ? 2 : 1, '0');
      return (format[0] === 'Z' ? 'GMT' : '') + result;

    } else {
      let c;
      switch (format) {
        case "KK": c = 'long'; break;
        case "kk": c = 'short'; break;
      }
      let s = this.getSecondByFormat("numeric");
      return this.getString({ second: 'numeric', timeZoneName: c }).substr(s.length).trim();
    }

  }


  /**
   * @param {"numeric"|"2-digit"} format * @returns {String}
   */
  getYearByFormat(format) {
    return this.getString({ year: format || 'numeric' });
  }

  /**
   * @param {"numeric"|"2-digit"|"long"|"short"|"narrow"} format * @returns {String}
   */
  getMonthByFormat(format) {
    return this.getString({ month: format || 'numeric' }).replace('.', '');
  }

  /**
   * @param {"numeric"|"2-digit"} format * @returns {String}
   */
  getDayByFormat(format) {
    return this.getString({ day: format || 'numeric' }).replace('.', '');
  }

  /**
   * @param {"numeric"|"2-digit"} format * @returns {String}
   */
  getHourByFormat(format) {
    let r = this.getString({ hour: format || 'numeric', hourCycle: 'h23' });
    r = r.substring(0, 2).trim();
    return format == '2-digit' ? r.padStart(2, '0') : r;
  }
  /**
     * @param {"numeric"|"2-digit"} format * @returns {String}
     */
  getHour24ByFormat(format) {
    let r = this.getString({ hour: format || 'numeric', hourCycle: 'h24' });
    r = r.substring(0, 2).trim();
    return format == '2-digit' ? r.padStart(2, '0') : r;
  }
  /**
   * @param {"numeric"|"2-digit"} format * @returns {String}
   */
  getHour12ByFormat(format) {
    let r = this.getString({ hour: format || 'numeric', hour12: true });
    return format == '2-digit' ? r.padStart(2, '0') : r;
  }

  /**
   * @param {"numeric"|"2-digit"} format * @returns {String}
   */
  getMinuteByFormat(format) {
    let r = this.getString({ minute: format || 'numeric' });
    return format == '2-digit' ? r.padStart(2, '0') : r;
  }

  /**
   * @param {"numeric"|"2-digit"} format * @returns {String}
   */
  getSecondByFormat(format) {
    let r = this.getString({ second: format || 'numeric' });
    return format == '2-digit' ? r.padStart(2, '0') : r;
  }

  /**
   * @param {1,2,3} digits * @returns {String}
   */
  getFractionalSecondByFormat(digits) {
    return this.getString({ fractionalSecondDigits: digits || 3 });
  }

  /**
   * @param {"long"|"short"|"narrow"} format * @returns {String}
   */
  getWeekdayByFormat(format) {
    return this.getString({ weekday: format || 'long' });
  }



  /** @private */
  static dateTimeCodes = { 'DATETIMELONG': 'full', 'datetimelong': 'full', 'datetimeshort': 'short', 'LONGDATETIME': 'full', 'longdatetime': 'full', 'shortdatetime': 'short', 'DATETIME': 'long', 'datetime': 'medium' };
  /**
   * @param {"DATETIMELONG"|"datetimelong"|"DATETIME"|"datetime"|"datetimeshort"} code * @returns {String}
   */
  getDateTime(code) {
    return this.getDateTimeByFormat(code && DateTime.dateTimeCodes[code] ? DateTime.dateTimeCodes[code] : 'long');
  }


  /** @private */
  static dateCodes = { 'DATELONG': 'full', 'datelong': 'full', 'dateshort': 'short', 'LONGDATE': 'full', 'longdate': 'full', 'shortdate': 'short', 'DATE': 'long', 'date': 'medium' };
  /**
   * @param {"DATELONG"|"datelong"|"DATE"|"date"|"dateshort"} code * @returns {String}
   */
  getDate(code) {
    return this.getDateByFormat(code && DateTime.dateCodes[code] ? DateTime.dateCodes[code] : 'long');
  }

  /** @private */
  static timeCodes = { 'TIMELONG': 'full', 'timelong': 'full', 'timeshort': 'short', 'LONGTIME': 'full', 'longtime': 'full', 'shorttime': 'short', 'TIME': 'long', 'time': 'medium' };
  /**
   * @param {"TIMELONG"|"timelong"|"TIME"|"time"|"timeshort"} code * @returns {String}
   */
  getTime(code) {
    return this.getTimeByFormat(code && DateTime.timeCodes[code] ? DateTime.timeCodes[code] : 'long');
  }

  /** @private */
  static dayPeriodCodes = { 'PERIOD': 'long', 'period': 'short' };
  /**
   * @param {"PERIOD"|"period"} code * @returns {String}
   */
  getDayPeriod(code) {
    return this.getDayPeriodByFormat(code && DateTime.dayPeriodCodes[code] ? DateTime.dayPeriodCodes[code] : 'long');
  }

  /** @private */
  static eraCodes = { 'ERA': 'long', 'era': 'short' };
  /**
   * @param {"ERA"|"era"} code * @returns {String}
   */
  getEra(code) {
    return this.getEraByFormat(code && DateTime.eraCodes[code] ? DateTime.eraCodes[code] : 'long');
  }



  /** @private */
  static timeZoneCodes = { 'KK': 'KK', 'kk': 'kk', 'z': 'z', 'zz': 'zz', 'Z': 'Z', 'ZZ': 'ZZ' };
  /**
   * @param {"KK"|"kk"|"z"|"zz"|"Z"|"ZZ"} code * @returns {String}
   */
  getTimeZone(code) {
    return this.getTimeZoneByFormat(code);
  }

  /** @private */
  static yearCodes = { 'yyyy': 'numeric', 'yy': '2-digit' };
  /**
   * @param {"yyyy"|"yy"} code * @returns {String}
   */
  getYear(code) {
    return this.getYearByFormat(code && DateTime.yearCodes[code] ? DateTime.yearCodes[code] : 'numeric');
  }

  /** @private */
  static monthCodes = { 'MMMM': 'long', 'MMM': 'short', 'MM': '2-digit', 'M': 'numeric' };
  /**
   * @param {"MMMM"|"MMM"|"MM"|"M"} format * @returns {String}
   */
  getMonth(code) {
    return this.getMonthByFormat(code && DateTime.monthCodes[code] ? DateTime.monthCodes[code] : 'numeric');
  }

  /** @private */
  static dayCodes = { 'dddd': 'long', 'ddd': 'short', 'dd': '2-digit', 'd': 'numeric' };
  /**
   * @param {"dddd"|"ddd"|"dd"|"d"} format * @returns {String}
   */
  getDay(code) {
    return code == 'dddd' || code == 'ddd' ? (this.getWeekdayByFormat(code && DateTime.dayCodes[code] ? DateTime.dayCodes[code] : 'numeric')) : (this.getDayByFormat(code && DateTime.dayCodes[code] ? DateTime.dayCodes[code] : 'numeric'));
  }

  /** @private */
  static hourCodes = { 'HH': '2-digit', 'H': 'numeric' };
  /**
   * @param {"HH"|"H"} format * @returns {String}
   */
  getHour(code) {
    return this.getHourByFormat(code && DateTime.hourCodes[code] ? DateTime.hourCodes[code] : 'numeric');
  }
  /** @private */
  static hour24Codes = { 'HH24': '2-digit', 'H24': 'numeric' };
  /**
   * @param {"HH24"|"H24"} format * @returns {String}
   */
  getHour24(code) {
    return this.getHour24ByFormat(code && DateTime.hour24Codes[code] ? DateTime.hour24Codes[code] : 'numeric');
  }
  /** @private */
  static hour12Codes = { 'hh': '2-digit', 'h': 'numeric' };
  /**
   * @param {"hh"|"h"} format * @returns {String}
   */
  getHour12(code) {
    return removeNonNumeric(this.getHour12ByFormat(code && DateTime.hour12Codes[code] ? DateTime.hour12Codes[code] : 'numeric'));
  }

  /** @private */
  static amPmCodes = { 'tt': '2-digit' };
  /**
   * @param {"tt"} format * @returns {String}
   */
  getAmPm(code) {
    let tt = removeNumeric(this.getHour12ByFormat('numeric')).split(' ');
    return tt[tt.length - 1];
  }

  /** @private */
  static minuteCodes = { 'mm': '2-digit', 'm': 'numeric' };
  /**
   * @param {"mm"|"m"} format * @returns {String}
   */
  getMinute(code) {
    return this.getMinuteByFormat(code && DateTime.minuteCodes[code] ? DateTime.minuteCodes[code] : 'numeric');
  }

  /** @private */
  static secondCodes = { 'ss': '2-digit', 's': 'numeric' };
  /**
   * @param {"ss"|"s"} format * @returns {String}
   */
  getSecond(code) {
    return this.getSecondByFormat(code && DateTime.secondCodes[code] ? DateTime.secondCodes[code] : 'numeric');
  }


  /** @private */
  static fractionalSecondCodes = { 'fff': 3, 'ff': 2, 'f': 1 };
  /**
   * @param {"fff"|"ff"|"f"} format * @returns {String}
   */
  getFractionalSecond(code) {
    return this.getFractionalSecondByFormat(code && DateTime.fractionalSecondCodes[code] ? DateTime.fractionalSecondCodes[code] : 3);
  }

  /** @private */
  static isoCodes = { 'ISO': 'ISO', 'ISOZ': 'ISOZ' };
  /**
   * @param {"ISO"} format * @returns {String}
   */
  getIso(code) {
    let date = (this.date || new Date());
    switch (code) {
      case 'ISO':
        return date.toISOString();
      case 'ISOZ':
        //case 'UTC':

        let zz = this.getTimeZone('zz', date);
        let utc = BL.datetime.toString('yyyy-MM-ddTHH:mm:ss.fff', date);
        return utc + zz + (zz.indexOf(':') == -1 ? ':00' : '');
      default:
        break;
    }

  }

  /*
  
  var milliseconds = Math.floor((durationInMs % 1000) / 100),
        seconds = Math.floor((durationInMs / 1000) % 60),
        minutes = Math.floor((durationInMs / (1000 * 60)) % 60),
        hours = Math.floor((durationInMs / (1000 * 60 * 60)) % 24);
  
      hours = (hours < 10) ? "0" + hours : hours;
      minutes = (minutes < 10) ? "0" + minutes : minutes;
      seconds = (seconds < 10) ? "0" + seconds : seconds;
  
  */



  /** @private */
  static timeDayCodes = { 'DDDDD': 'DDDDD', 'DDDD': 'DDDD', 'DDD': 'DDD', 'DD': 'DD', 'D': 'D' }; //, 'dd': 'dd', 'd': 'd'
  /**
   * @param {"HH"|"H"} format * @returns {String}
   */
  getTimeDay(code) {
    let days = Math.floor((this.timeMs / (1000 * 60 * 60 * 24)));
    //if (code[0] === 'd' && days > 31) days %= 31;
    return days.toString().padStart(code.length, '0');
  }


  /** @private */
  static timeHourCodes = { 'HHHHH': 'HHHHH', 'HHHH': 'HHHH', 'HHH': 'HHH', 'HH': 'HH', 'H': 'H', 'hh': 'hh', 'h': 'h' };
  /**
   * @param {"HH"|"H"} format * @returns {String}
   */
  getTimeHour(code) {
    let hours = Math.floor((this.timeMs / (1000 * 60 * 60)));
    if (code[0] === 'h' && hours >= 24) hours %= 24;
    return hours.toString().padStart(code.length, '0');
  }

  /** @private */
  static timeMinuteCodes = { 'MMMMM': 'MMMMM', 'MMMM': 'MMMM', 'MMM': 'MMM', 'MM': 'MM', 'M': 'M', 'mm': 'mm', 'm': 'm' };
  /**
   * @param {"mm"|"m"} format * @returns {String}
   */
  getTimeMinute(code) {
    let minutes = Math.floor((this.timeMs / (1000 * 60)));
    if (code[0] === 'm' && minutes >= 60) minutes %= 60;
    // BL.homey.log('code[0]', code[0]);
    // BL.homey.log('minutes', minutes);
    return minutes.toString().padStart(code.length, '0');
  }

  /** @private */
  static timeSecondCodes = { 'SSSSS': 'SSSSS', 'SSSS': 'SSSS', 'SSS': 'SSS', 'SS': 'SS', 'S': 'S', 'ss': 'ss', 's': 's' };
  /**
   * @param {"ss"|"s"} format * @returns {String}
   */
  getTimeSecond(code) {
    let seconds = Math.floor((this.timeMs / 1000))
    if (code[0] === 's' && seconds >= 60) seconds %= 60;
    return seconds.toString().padStart(code.length, '0');
  }


  /** @private */
  static timeFractionalSecondCodes = { 'FFFFF': 'FFFFF', 'FFFF': 'FFFF', 'FFF': 'FFF', 'FF': 'FF', 'F': 'F', 'fff': 'fff', 'ff': 'ff', 'f': 'f' };
  /**
   * @param {"fff"|"ff"|"f"} format * @returns {String}
   */
  getTimeFractionalSecond(code) {

    let milliseconds = this.timeMs;//;
    if (code[0] === 'f' && milliseconds >= 1000) milliseconds = Math.floor((milliseconds % 1000));
    return milliseconds.toString().padStart(code.length, '0');
  }



  toTimeString(format) {
    if (!format) return format;
    if (typeof (format) == 'string') return this.format(format, true, DateTime.codes.timeArray);
    if (BL._.isArray(format)) {
      let r = {};
      for (const _format of format) {
        if (Object.keys(r).indexOf(_format) === -1) r[_format] = this.format(_format, true, DateTime.codes.timeArray);
      }
      return r;
    }
  }



  toString(format) {
    if (!format) return format;
    if (typeof (format) == 'string') return this.format(format);
    if (BL._.isArray(format)) {
      let r = {};
      for (const _format of format) {
        if (Object.keys(r).indexOf(_format) === -1) r[_format] = this.format(_format);
      }
      return r;
    }
  }


  /** @private */
  formatCustom(coding) {
    return this.format(dateTimeStatics.formats && dateTimeStatics.formats[coding] ? dateTimeStatics.formats[coding] : coding, true);
  }
  /** @private */
  format(coding, noCustomized, codes) {
    if (!coding || !coding.length) return coding;
    let r = '';
    codes = codes || (noCustomized === true ? BL._.filter(DateTime.codes.array, x => !x.customized) : DateTime.codes.array);
    //BL.homey.log('format', codes);
    let stringMode = false;
    for (let i = 0; i < coding.length; i++) {
      let s = false;

      if (coding.substr(i, 2) === "\"\"") {
        r += "\"";
        coding = coding.substr(0, i) + coding.substr(i + 2);
        i--;
        continue;
      }

      if (coding.substr(i, 1) === "\"") {
        stringMode = !stringMode;
        coding = coding.substr(0, i) + coding.substr(i + 1);
        i--;
        continue;
      }
      if (stringMode) {
        r += coding[0];
        coding = coding.substr(0, i) + coding.substr(i + 1);
        i--;
        continue;
      }

      // if(!noCustomized) {
      //   if(f) {
      //     //BL.homey.log('f before: ', f);
      //     f.originalFunc = f.func;
      //     f.format = customFormat;
      //     f.func = 'formatCustom';
      //     f.customized = true;
      //     //BL.homey.log('f after : ', f);
      //   }

      //   BL._.each(codes, (code,funcKey)=> { 
      //     if(s) return;
      //     if(coding.indexOf(code.code)===0) {
      //       s=true;
      //       if(code.customized && this.locale) r+= this[code.originalFunc](code.code);
      //       else r+= this[code.func](code.code);
      //       coding = coding.substr(0,i) + coding.substr(i+code.code.length); 
      //     }        
      //   });
      // }

      BL._.each(codes, (code, funcKey) => {
        if (s) return;
        if (coding.indexOf(code.code) === 0) {
          //BL.homey.log('code.code', code.code);
          //BL.homey.log('code.code result', this[code.originalFunc](code.code));
          s = true;
          if (code.custom) r += this[code.func](code.format);
          else if (code.customized && this.locale) r += this[code.originalFunc](code.code);
          else r += this[code.func](code.code);
          coding = coding.substr(0, i) + coding.substr(i + code.code.length);
        }
      });
      i = -1;
      if (s) continue;
      r += coding[0];
      coding = coding.substr(1);
    }
    return r;
  }





}


// let dateTime = new DateTime('nl', 'Europe/Amsterdam');
// console.log(dateTime.getYearByFormat());
// console.log(dateTime.getMonthByFormat());
// console.log(dateTime.getDayByFormat());
// console.log(dateTime.getHourByFormat());
// console.log(dateTime.getMinuteByFormat());
// console.log(dateTime.getSecondByFormat('2-digit'));
// console.log(dateTime.getFractionalSecondByFormat());
// console.log(dateTime.getDayPeriodByFormat());
// console.log(dateTime.getWeekdayByFormat());

// console.log(' ');

// console.log(dateTime.getYear('yy'));
// console.log(dateTime.getMonth('MM'));
// console.log(dateTime.getDay('dd'));

// console.log(dateTime.getHour('HH'));
// console.log(dateTime.getMinute('mm'));
// console.log(dateTime.getSecond('ss'));
// console.log(dateTime.getNow());
// console.log(dateTime.getFractionalSecondByFormat());
// console.log(dateTime.getDayPeriodByFormat());
// console.log(dateTime.getWeekdayByFormat());


// return dateTime.toString('yyyy-MM-dddd');


function removeYear(str) {
  let year = new Date().getUTCFullYear();
  return str.replace(year, '').replace(year - 1, '').replace(year + 1, '').trim();
}

function removeNumeric(str) {
  return str.replace(/[0-9]/g, '').trim();
}

function removeNonNumeric(str) {
  return str.replace(/[^0-9]/g, '').trim();
}

module.exports = DateTime;