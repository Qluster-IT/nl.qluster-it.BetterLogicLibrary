'use strict';

var variableManager = require('./lib/variablemanager.js');
const Homey = require('homey');
let timezone;

const util = require('util');

const {BL} = require('./lib/bll/bl.js');
const sandbox = require('./bll/sandbox');


class BetterLogic extends Homey.App {	
	
	static get dateTime() { return this._dateTime; }
	static set dateTime(v) { this._dateTime = v; }

	getNow (format) {
		let r = new Date().toLocaleString('nl',
		{
		hour12: false,
		timeZone: timezone,
		hour: "2-digit",
		minute: "2-digit",
		day: "2-digit",
		month: "2-digit",
		seconds: "2-digit", // not included in nl.
		year: "numeric"
		});

		switch (format) {
			case "#DD": return r.substr(0,2);
			case "#MM": return r.substr(3,2);
			case "#YYYY": return r.substr(6,4);
			case "#HH": return r.substr(11,2);
			case "#mm": return r.substr(14,2);
			case "#SS": return new Date().getUTCSeconds().toString().padStart(2, "0");
			default: return r;
		}

	}

	async onInit() {
		BetterLogic.homey = this.homey;		

		if (process.env.DEBUG === '1') require('inspector').open(9232, '0.0.0.0', true);
    	this.log('BetterLogic is running...');
		
		timezone = this.homey.clock.getTimezone();
		
				
		this.bl = new BL({
			homey:this.homey,
			modules:[
				"_",
				"math",
				"datetime",
			]
		});
		let timeoutset = false;
		setTimeout(async ()=> {
			if(!timeoutset)(timeoutset=true) | await this.homey.api.realtime("running");
		}, 10*10000);
		
		BL.decode
		
		this.bl.then(async (x)=> {
			
			if(!timeoutset)(timeoutset=true) | await this.homey.api.realtime("running");
			let a = BL.L;
			//this.dateTime = new DateTime(this.homey.i18n.getLanguage(), timezone);
			//console.log(this.dateTime.toString('ddd'));



			
			variableManager.init(this.homey);
				
			// get_stamp
			let format_datetime = this.homey.flow.getActionCard('format_datetime');
			format_datetime
			.registerRunListener( async (args, state) => {
				return {result:BL.L.dateTime.toString(args.format.name)};
			})
			.getArgument('format')
			.registerAutocompleteListener((query, args) => {
				
				

				let r = [
					{name:'shortdate'},
					{name:'date'},
					{name:'DATE'},
					{name:'LONGDATE'},
					{name:'dd-MM-yyyy'},
					{name:'dd-MM-yyyy hh:mm'},
					{name:'dd-MM-yyyy hh:mm:ss'},
					{name:'hh:mm'},
					{name:'hh:mm:ss'},
				];
				BL.L._.each(r, x=>x.description=BL.datetime.toString(x.name) );
				if(query && query.length) r.unshift({name:query, description:BL.datetime.toString(query)});
				return r;
			});

			
			let execute_bl_expression = this.homey.flow.getActionCard('execute_bl_expression');
			execute_bl_expression.registerRunListener(async (args, state) => {
				if(args.code && !args.expression) {
					let val = JSON.stringify(await this.runSandBox(args.code));
					// if (true) {
					// 	this.homey.api.realtime('log', {
					// 	  text: util.format(val),
					// 	  script: "id"
					// 	});
					//   }
					// return {string:val};
					throw new Error("Result = " + val);
				}
				try {
				
					var result = args.variable ? variableManager.getVariable(args.variable.name) : null;
					if(!result) {
						return Promise.reject(new Error('Variable not found (' + args.variable.name + ')'));
					}

					if (args.expression !== undefined && args.expression !== 'undefined') {
						
						let value = await this.runSandBox(args.expression);
						return variableManager.updateVariable(result.name, value, result.type);
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

			
			
			this.homey.flow.getActionCard('execute_bl_expression_tag').registerRunListener(async (args, state) => {
				try {
					if (args.expression !== undefined && args.expression !== 'undefined') {
						let value = this.runSandBox(args.expression);
						let tokens = { text: '', number: 0, boolean: false };
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
					return new Error(error);
				}
			});



			this.homey.settings.on('set', async (settingName)=> {
				if (settingName == 'javascript_functions') {
					this.setFunctions();
				}
			});
	
			await this.setFunctions();
		});
		

		


		
		// if(!await this.homey.settings.get('notification_update_variablesinflows')) {
		// 	this.homey.notifications.createNotification({excerpt : "The Better Logic App has been transferred to a new developer and rewriten to SDK3.\nVariables can now be created directly from within AND and THEN cards!\nJust type a name and select it from the list!\nAnd also, the Delete All button now has a Confirm before all are variables deleted.\nSee the Forum Topic for more info or to request a feature." });  
		// 	this.homey.settings.set('notification_update_variablesinflows', true);
		// }

	}

	
	async setFunctions() {
		this.functions = await this.homey.settings.get('javascript_functions');
		//this.log('this.functions', typeof(this.functions), this.functions);
		this.context = {
			_: BL._,
			math : BL.math,
			datetime : BL.datetime,
			date : (coding)=> BL.datetime.toString(coding)			
		};
		if (this.functions && this.functions.length > 0) for (let i = 0; i < this.functions.length; i++) {
			try {
				const funcObj = this.functions[i];

				let func = funcObj.value.parseFunction();
				this.log('func', func);
				this.context[funcObj.name] = func;
			} catch (error) {
				this.log('Error creating function ' + this.functions[i].name);
				this.error(error);
			}
		}
	}
	//		(?'Before'(?:[^{])?)\{\[(.*?)\]\}(?(R&Before)(?'After'(?:[^}])))(?(R&After)(?:.))
	//		(?:[^{])?\{\[(.*?)\]\}(?:[^}])?
	//		(?<B>(?:{)?){\[(((?!]})(.))+?)\]}(?(R&B)|(?!}))
	//		(?'b'(?:{)?){\[(((?!]})(.))+?)\]}(?(R&b)(?<A>(?!})))

	codingRegExp = /(?:(?<!{)){\[(((?!]})(.))+?)\]}(?:(?!}))/gsi;
	runCoding({ text })  {
		try {
				
			let codingsToRun = {};
			let codings = text.matchAll(this.codingRegExp);
			let codingsFound = codings? [...codings] : [];
			
			for (let i = 0; i < codingsFound.length; i++) {
				const code = codingsFound[i][1];
				if(!codingsToRun[code]) codingsToRun[code] = this.runSandBox(code);
			}


			text = text.replaceAll(this.codingRegExp, (val, index)=> {
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

	async runTempCode(code) {
		let val = await BL.toString(code);//await this.runSandBox(code);
		let r = {number:0, boolean:false,string:''}; 
		switch (typeof(val)) {
			case "string": 
			case "boolean": 
			case "number": 
				r[typeof(val)] = val; return r;		
			default:
				return r;
		}
	}



	runSandBox(code) {
		var context = this.context;
		return sandbox(code, context, {timeout:55*1000}); //55 seconds timeout
	}


}

module.exports = BetterLogic;
