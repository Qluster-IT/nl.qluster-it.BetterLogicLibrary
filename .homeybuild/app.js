'use strict';

const locale = require('locale-codes');
var variableManager = require('./lib/variablemanager.js');
const Homey = require('homey');
let timezone;

//const util = require('util');

const { BL } = require('betterlogiclibrary');
//const sandbox = require('./lib/sandbox');
const FileServer = require('./lib/FileServer.js');



const vm = require('vm');


class BetterLogic extends Homey.App {

	static get dateTime() { return this._dateTime; }
	static set dateTime(v) { this._dateTime = v; }

	getNow(format) {
		let r = new Date().toLocaleString('nl',
			{
				hour12: false,
				timeZone: timezone,
				hour: "2-digit",
				minute: "2-digit",
				day: "2-digit",
				month: "2-digit",
				second: "2-digit",
				year: "numeric"
			});

		switch (format) {
			case "#DD": return r.substr(0, 2);
			case "#MM": return r.substr(3, 2);
			case "#YYYY": return r.substr(6, 4);
			case "#HH": return r.substr(11, 2);
			case "#mm": return r.substr(14, 2);
			case "#SS": return new Date().getUTCSeconds().toString().padStart(2, "0");
			default: return r;
		}

	}

	async onInit() {


		//BL.json.toExcel([], { schema: [{}]})
		BetterLogic.homey = this.homey;
		if (process.env.DEBUG === '1' || false) {
			try {
				require('inspector').waitForDebugger();
			}
			catch (error) {
				require('inspector').open(9216, '0.0.0.0', true);
			}
		}

		//require('inspector').open(9216, '0.0.0.0', true);
		//if (process.env.DEBUG === '1') require('inspector').open(9232, '0.0.0.0', true);
		this.log('BetterLogic is running...');

		this.timezones = [
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

		this.locale = await this.homey.settings.get('locale');
		if (!this.locale) {
			this.locale = { default: await this.homey.i18n.getLanguage() };
			await this.homey.settings.set('locale', this.locale);
		}
		if (this.locale && this.locale.formats) {
			this.locale.dateFormats = this.locale.formats;
			delete this.locale.formats;
			await this.homey.settings.set('locale', this.locale);
		}
		//this.homey.api.realtime('bllSetLocale', this.locale);

		//await DateTime.init();

		timezone = this.homey.clock.getTimezone();

		let bl = BL.init({
			homey: this.homey,
			modules: [
				"_",
				"math",
				"datetime",
				"proto",
				"json"
			]
		}).catch(this.error);



		await this.setExports();

		//let timeoutset = false;



		//BL.decode()

		// if (BL.homey.app.id === 'net.i-dev.betterlogic') {
		// 	this.homey.setTimeout(async () => {
		// 		await BL.realtimeFunction('running')
		// 	}, 5 * 1000);

		// 	this.homey.setTimeout(async () => {
		// 		await BL.realtimeFunction('running_2x')
		// 	}, 10 * 1000);

		// 	this.homey.setTimeout(async () => {
		// 		await this.homey.api.realtime("running_3x");
		// 	}, 20 * 1000);

		// 	this.homey.setTimeout(async () => {
		// 		await this.homey.api.realtime("running_3x");
		// 	}, 60 * 1000);
		// }

		BL.ready.then(async (x) => {
			this.bl = x;

			this.homey.api.realtime('bllSetLocale', this.locale);


			await this.initFileServerFromSettings();

			variableManager.init(this.homey);

			//if(!timeoutset)(timeoutset=true) | await this.homey.api.realtime("running");

			//this.dateTime = new DateTime(this.homey.i18n.getLanguage(), timezone);
			//console.log(this.dateTime.toString('ddd'));





			// get_stamp
			let format_datetime = this.homey.flow.getActionCard('format_datetime');
			format_datetime
				.registerRunListener(async (args, state) => {



					// const DateTime = require('./bll/dateTime.js');        
					// let datetime = DateTime;
					// datetime.init(BL.l);
					// let test = await datetime.toString(args.format.name,
					// 	args.date && args.date!='undefined' ? args.date:undefined, 
					// 	args.locale && args.locale.id ? args.locale.id:undefined, 
					// 	args.timeZone && args.timeZone.id ? args.timeZone.id:undefined);

					// let b = test;

					return {
						result: BL.datetime.toString(
							args.format.name,
							args.date && args.date != 'undefined' ? args.date : undefined,
							args.locale && args.locale.id ? args.locale.id : undefined,
							args.timeZone && args.timeZone.id ? args.timeZone.id : undefined
						)
					};
				})
				.getArgument('format')
				.registerAutocompleteListener((query, args) => {
					let r = [
						{ name: 'shortdate' },
						{ name: 'date' },
						{ name: 'DATE' },
						{ name: 'LONGDATE' },
						{ name: 'DATETIME' },
						{ name: 'datetime' },
						{ name: 'dd-MM-yyyy' },
						{ name: 'dd-MM-yyyy HH:mm' },
						{ name: 'dd-MM-yyyy HH:mm:ss' },
						{ name: 'HH:mm' },
						{ name: 'HH:mm:ss' },
					];
					BL.L._.each(r, x => x.description = BL.datetime.toString(x.name,
						args.date && args.date != 'undefined' ? args.date : undefined,
						args.locale && args.locale.id ? args.locale.id : undefined,
						args.timeZone && args.timeZone.id ? args.timeZone.id : undefined));
					if (query && query.length) r.unshift({
						name: query, description: BL.datetime.toString(query,
							args.date && args.date != 'undefined' ? args.date : undefined,
							args.locale && args.locale.id ? args.locale.id : undefined,
							args.timeZone && args.timeZone.id ? args.timeZone.id : undefined)
					});
					return r;
				});
			format_datetime.getArgument('locale')
				.registerAutocompleteListener((query, args) => {
					query = query && query.length ? query.toLowerCase() : null;
					let locales = query ? BL._.filter(locale.all, x => x.name.toLowerCase().indexOf(query) > -1 || x.tag.toLowerCase().indexOf(query) > -1) : locale.all;
					locales = BL._.map(locales, l => { return { id: l.tag, name: l.name, description: l.tag }; });
					return locales;
				});
			format_datetime.getArgument('timeZone')
				.registerAutocompleteListener((query, args) => {
					query = query && query.length ? query.toLowerCase() : null;
					let timeZones = query ? BL._.filter(this.timezones, x => x.toLowerCase().indexOf(query) > -1) : this.timezones;
					timeZones = BL._.map(timeZones, t => { return { id: t, name: t }; });
					return timeZones;
				});


			let execute_bl_expression = this.homey.flow.getActionCard('execute_bl_expression');

			execute_bl_expression.registerRunListener(async (args, state) => {
				// if(args.code && !args.expression) {
				// 	let val = JSON.stringify(await this.runSandBox(args.code, {arg:args.argument}));
				// 	throw new Error("Result = " + val);
				// }
				try {

					var variable = args.variable ? variableManager.getVariable(args.variable.name) : null;


					if (args.expression !== undefined && args.expression !== 'undefined') {

						let value = await this.runSandBox(args.expression, { arg: args.argument });
						if (!variable) {
							await variableManager.addVariable(args.variable.name, typeof (value), value, false);
							variable = args.variable ? variableManager.getVariable(args.variable.name) : null;
							//return Promise.reject(new Error('Variable not found (' + args.variable.name + ')'));
						}

						await variableManager.updateVariable(variable.name, value, variable.type);

					}
				} catch (error) {
					this.log('execute_bl_expression:');
					this.error(error);
					throw new Error(error);
				}
			});
			execute_bl_expression.getArgument('variable').registerAutocompleteListener((query, args) => {
				return Promise.resolve(variableManager.retrieveVariables(query, args, 'any'));
			});

			this.homey.flow.getActionCard('__dummy_card').registerRunListener(async (args, state) => {
				return;
			});

			this.homey.flow.getActionCard('execute_bl_expression_tag').registerRunListener(async (args, state) => {
				try {
					// if(args.code && !args.expression) {
					// 	let val = JSON.stringify(await this.runSandBox(args.code, {arg:args.argument}));
					// 	throw new Error("Result = " + val);
					// }
					//return { text: '', number: 0, boolean: false };

					//const a = new vm.Script(args.expression).runInNewContext({date:(x)=>x}, { timeout: 55 * 1000 });

					//return { text: new vm.Script(args.expression).runInNewContext({date:(x)=>x}, { timeout: 55 * 1000 }), number: 0, boolean: false };

					//return { text: sandbox(args.expression, {date:(x)=>x}, { timeout: 55 * 1000 }), number: 0, boolean: false };

					if (args.expression !== undefined && args.expression !== 'undefined') {
						const value = this.runSandBox(args.expression, { arg: args.argument });
						const tokens = { text: '', number: 0, boolean: false };
						switch (typeof (value)) {
							case "string": tokens.text = value; break;
							case "number": tokens.number = value; break;
							case "boolean": tokens.boolean = value; break;
							default:
								break;
						}
						return tokens;
					}
				} catch (error) {
					this.log('execute_bl_expression_tag:');
					this.error(error);
					throw new Error(error);
				}
			});

			this.homey.flow.getActionCard('format_json_csv').registerRunListener(async (args, state) => {
				try {
					const result = {};
					switch (args.returnType || 'csv') {
						case "csv":
						case "csv_base64":
							let arr = BL._.toArray(JSON.parse(args.json));
							result.result = await BL.json.toCsv(arr, {
								useDateIso8601Format: true, emptyFieldValue: '', expandArrayObjects: args.expandArrayObjects,
								unwindArrays: args.unwindArrays
							});
							if (args.returnType == 'csv_base64') {
								result.result = Buffer.from(result.csv).toString('base64');
							}
							break;
					}

					return result;
				} catch (error) {
					this.log('format_json_csv:');
					this.error(error);
					throw new Error(error);
				}
			});

			this.homey.flow.getActionCard('format_json_xlsx').registerRunListener(async (args, state) => {
				try {
					const result = {};
					switch (args.returnType || 'xlsx_base64') {
						//case "csv":
						case "xlsx_base64":
							// https://github.com/catamphetamine/write-excel-file/blob/master/README.md
							let json = JSON.parse(args.json);

							let schema;
							if (!args.schema) {
								let headers = {};
								for (let i = 0; i < json.length; i++) {
									const row = json[i];
									if (!BL._.isArray(row)) {
										for (const columnKey in row) {
											if (Object.hasOwnProperty.call(row, columnKey)) {
												const column = row[columnKey];
												if (!headers[columnKey]) headers[columnKey] = {
													value: columnKey.substring(0, 1).toUpperCase() + columnKey.substring(1),
													fontWeight: 'bold'
												};
												row[columnKey] = { value: row[columnKey] }
											}
										}
										json[i] = [];
										for (const key in headers) {
											if (Object.hasOwnProperty.call(headers, key)) {
												json[i].push(row[key] || undefined);

											}
										}
									}

								}
								headers = BL._.toArray(headers);
								json.unshift(headers);
							}
							else {
								schema = eval(args.schema);
							}
							let xlsxBuffer = await BL.json.toExcel(json, {
								schema,
								sheet: args.sheetName || undefined,//: 'Log',// + BL.datetime.toString('datetime'),
								stickyRowsCount: args.stickyRowsCount !== undefined ? args.stickyRowsCount : 1,
								buffer: true, //returnType == 'xlsx' ? true : false,
								dateFormat: args.defaultDate //|| 'yyyy-mm-ddThh:mm:ss'
							});
							result.result = xlsxBuffer;
							if (args.returnType == 'xlsx_base64') {
								result.result = Buffer.from(result.result).toString('base64');
							}
							break;
					}

					return result;
				} catch (error) {
					this.log('format_json_csv:');
					this.error(error);
					throw new Error(error);
				}
			});


			// FLOW Action Card, get_log
			let actionGetLog = this.homey.flow.getActionCard("get_variables");
			actionGetLog.registerRunListener(async (args, state) => {
				try {
					return { variables: await this.getVariables(args) };
				} catch (error) {
					throw new Error(error);
				}

			});






			this.homey.settings.on('set', async (settingName) => {
				if (settingName == 'javascript_functions') {
					this.setFunctions();
				} else if (settingName == 'locale') {
					this.locale = await this.homey.settings.get(settingName);
					this.homey.api.realtime('bllSetLocale', this.locale);
				} else if (settingName == 'fileserver') {
					await this.initFileServerFromSettings();
				} else if (settingName == 'exports') {
					await this.setExports();
					this.homey.api.realtime('bllSetExports', this.exportsSettings);
				}
			});

			await this.setFunctions();


			this.homey.setTimeout(async () => {
				await this.homey.api.realtime("running");
			}, 5 * 1000);

			this.homey.setTimeout(async () => {
				await this.homey.api.realtime("running_2x");
			}, 10 * 1000);

			this.homey.setTimeout(async () => {
				await this.homey.api.realtime("running_3x");
			}, 20 * 1000);

			this.homey.setTimeout(async () => {
				await this.homey.api.realtime("running_3x");
			}, 60 * 1000);

			this.homey.setTimeout(async () => {
				await this.homey.api.realtime("running_3x");
			}, 180 * 1000);


		});





		// Keep these message here to know which one we used.
		// if(!await this.homey.settings.get('notification_update_variablesinflows')) {
		// 	this.homey.notifications.createNotification({excerpt : "The Better Logic App has been transferred to a new developer and rewriten to SDK3.\nVariables can now be created directly from within AND and THEN cards!\nJust type a name and select it from the list!\nAnd also, the Delete All button now has a Confirm before all are variables deleted.\nSee the Forum Topic for more info or to request a feature." });  
		// 	this.homey.settings.set('notification_update_variablesinflows', true);
		// }


		// if(!await this.homey.settings.get('notification_update_newsettings')) {
		// 	this.homey.notifications.createNotification({excerpt : "The Better Logic App has been rebranded to Better Logic Library.\nCheck out the new App Settings for the new features, like BLL coding in supporting apps!" });  
		// 	this.homey.settings.set('notification_update_newsettings', true);
		// }

	}



	async onUninit() {
		if (this.fileServer) await this.fileServer.destroy();
	}

	async getDownloadUrl(body) {
		if (!this.fileServer) await this.initFileServer();
		return await this.fileServer.getDownloadUrl(body);
	}
	async initFileServer() {
		if (this.fileServer) await this.fileServer.update(this.fileserverSettings);
		else this.fileServer = await new FileServer().init({ homey: this.homey, settings: this.fileserverSettings });
	}

	async setExports() {
		this.exportsSettings = await this.homey.settings.get('exports');

		let changed = false;
		if (!this.exportsSettings) this.exportsSettings = {};
		if (!this.exportsSettings.csvFilename && (changed = true)) this.exportsSettings.csvFilename = "Vars_{[date('yyyy-MM-dd_HH-mm-ss')]}.csv";
		if (!this.exportsSettings.jsonFilename && (changed = true)) this.exportsSettings.jsonFilename = "Vars_{[date('yyyy-MM-dd_HH-mm-ss')]}.json";
		if (!this.exportsSettings.xlsxFilename && (changed = true)) this.exportsSettings.xlsxFilename = "Vars_{[date('yyyy-MM-dd_HH-mm-ss')]}.xlsx";
		if (!this.exportsSettings.includeUtcInExcel && (changed = true)) this.exportsSettings.includeUtcInExcel = false;
		if (!this.exportsSettings.excel_defaultdateformat && (changed = true)) this.exportsSettings.excel_defaultdateformat = 'yyyy-mm-dd hh:mm:ss';
		if (changed) this.homey.settings.set('exports', this.exportsSettings);


		// if (!this.exportsSettings || !Object.keys(this.exportsSettings).length) {
		// 	this.exportsSettings = { excel_defaultdateformat: 'yyyy-mm-dd hh:mm:ss' };
		// 	await this.homey.settings.set('exports', this.exportsSettings);
		// }
	}

	async initFileServerFromSettings() {
		this.fileserverSettings = await this.homey.settings.get('fileserver');
		if (!this.fileserverSettings || !Object.keys(this.fileserverSettings).length) {
			this.fileserverSettings = { port: 47330, autoStart: false, autoShutdown: true, fileAvailableDuration: 60 };
			await this.homey.settings.set('fileserver', this.fileserverSettings);
		}
		await this.initFileServer();
	}



	async setFunctions() {
		this.functions = await this.homey.settings.get('javascript_functions');
		//this.log('this.functions', typeof(this.functions), this.functions);
		this.context = {
			_: BL._,
			math: BL.math,
			//datetime : BL.datetime,
			date: (coding, date, locale, timeZone) => BL.datetime.toString(coding, date, locale, timeZone)
			//d : (s) => new Date(s)
		};
		if (this.functions && this.functions.length > 0) for (let i = 0; i < this.functions.length; i++) {
			try {
				const funcObj = this.functions[i];

				let func = funcObj.value.parseFunction();
				//this.log('func', func);
				this.context[funcObj.name] = func;
			} catch (error) {
				this.log('Error creating function ' + this.functions[i].name);
				this.error(error);
			}
		}
	}


	async getVariables({ returnType, maxSizeKb }) {
		const vars = await variableManager.getVariables();
		let result;
		switch (returnType) {
			case 'csv':
			case 'csv_base64':
				{
					result = await BL.json.toCsv(vars, { useDateIso8601Format: true, emptyFieldValue: '' });
					if (maxSizeKb && result.length > maxSizeKb) result = substring(result, 0, (maxSizeKb * 1000));
					if (returnType == 'csv_base64') {
						result = Buffer.from(result).toString('base64');
					}
					break;
				}
			case 'xlsx':
			case 'xlsx_base64':
				{
					try {
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
								value: v => v.value !== undefined && v.value !== null ? v.value.toString() : undefined,
								width: BL._.max([BL._.max(BL._.map(vars, 'value.length')), BL.homey.__('Value').length])
							},
							{
								column: BL.homey.__('Type'),
								type: String,
								value: v => v.type,
								width: BL._.max([BL._.max(BL._.map(vars, 'type.length')), BL.homey.__('Type').length])
							},
							{
								column: BL.homey.__('Last set'),
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
							column: BL.homey.__('Last set') + ' (UTC)',
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
						result = xlsxBuffer;
						if (returnType == 'xlsx_base64') {
							result = Buffer.from(result).toString('base64');
						}
						return result;
					} catch (error) {
						homey.error(error);
					}
				}
				break;
			case 'json':
			case 'json_base64': {
				result = JSON.stringify(vars);
				if (returnType == 'json_base64') {
					result = Buffer.from(result).toString('base64');
				}
				return result;
			}
		}
		return result;
	}

	//		(?'Before'(?:[^{])?)\{\[(.*?)\]\}(?(R&Before)(?'After'(?:[^}])))(?(R&After)(?:.))
	//		(?:[^{])?\{\[(.*?)\]\}(?:[^}])?
	//		(?<B>(?:{)?){\[(((?!]})(.))+?)\]}(?(R&B)|(?!}))
	//		(?'b'(?:{)?){\[(((?!]})(.))+?)\]}(?(R&b)(?<A>(?!})))

	codingRegExp = /(?:(?<!{)){\[(((?!]})(.))+?)\]}(?:(?!}))/gsi;

	runCoding({ text, locale, arg }) {
		try {

			let codingsToRun = {};
			let codings = text.matchAll(this.codingRegExp);
			let codingsFound = codings ? [...codings] : [];

			for (let i = 0; i < codingsFound.length; i++) {
				const code = codingsFound[i][1];
				if (!codingsToRun[code]) codingsToRun[code] = this.runSandBox(code, { locale, arg });
			}


			text = text.replaceAll(this.codingRegExp, (val, index) => {
				return codingsToRun[index];
			});

			// let codings = completeText.matchAll(/\[\{(.*?)\}\]/gmsi);
			// let codingsFound = codings? [...codings] : [];

			// for (let i = 0; i < codingsFound.length; i++) {
			// 	const code = Number.parseInt(codingsFound[i][1]);

			// }
		} catch (error) {

		}
		return text;
	}

	// async runTempCode(code) {
	// 	let val = await BL.toString(code);//await this.runSandBox(code);
	// 	let r = {number:0, boolean:false,string:''}; 
	// 	switch (typeof(val)) {
	// 		case "string": 
	// 		case "boolean": 
	// 		case "number": 
	// 			r[typeof(val)] = val; return r;		
	// 		default:
	// 			return r;
	// 	}
	// }



	runSandBox(code, contextProperties) {
		const context = BL._.clone(this.context);
		if (!contextProperties) contextProperties = {};
		const date = contextProperties.date; //delete contextProperties.date;
		const locale = contextProperties.locale; //delete contextProperties.locale;
		const timeZone = contextProperties.timeZone; //delete contextProperties.timeZone;
		const arg = contextProperties.arg;
		const timeMs = contextProperties.timeMs; //delete contextProperties.date;
		const timeSec = contextProperties.timeSec; //delete contextProperties.date;
		//if(locale) {
		//context.locale = locale;

		//if (arg) context.arg = arg;
		if (contextProperties) for (const key in contextProperties)
			if (Object.hasOwnProperty.call(contextProperties, key)) context['$' + key] = contextProperties[key];

		context.date = (coding, _date, _locale, _timeZone) => BL.datetime.toString(coding, _date || date, _locale || locale, _timeZone || timeZone);
		context.time = (format, _timeMs, _timeSec) => BL.datetime.toTimeString(format, _timeMs || timeMs, _timeSec || timeSec);
		//}
		try {

			return new vm.Script(code).runInNewContext(context, { timeout: 55 * 1000 });
			//return sandbox(code, context, { timeout: 55 * 1000 }); //55 seconds timeout
		} catch (error) {
			let end;
			if (error && error.stack && (end = error.stack.indexOf('\n\nSyntaxError')) > -1) {
				let start = error.stack.indexOf('=') + 1;
				let startMinus = error.stack.indexOf('\n') + 1;
				let msg = error.stack.substring(start, end);
				let msgs = msg.split('\n');
				let pos = msgs[msgs.length - 1];
				pos = pos.substring(start - startMinus);
				msgs.pop();
				msg = msgs.join('\n') + '\n' + pos;
				throw new Error(error.message + '\n' + msg);
			}
			throw error;
		}
	}


}

module.exports = BetterLogic;
