'use strict';

var variableManager = require('./lib/variablemanager.js');
const Homey = require('homey');
const DateTime = require('./lib/util/dateTime.js');
let timezone;

const _ = require('lodash-core');


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

		this.dateTime = new DateTime(this.homey.i18n.getLanguage(), timezone);
		console.log(this.dateTime.toString('ddd'));

		

	    variableManager.init(this.homey);

		
		if(!await this.homey.settings.get('notification_update_variablesinflows')) {
			this.homey.notifications.createNotification({excerpt : "The Better Logic App has been transferred to a new developer and rewriten to SDK3.\nVariables can now be created directly from within AND and THEN cards!\nJust type a name and select it from the list!\nAnd also, the Delete All button now has a Confirm before all are variables deleted.\nSee the Forum Topic for more info or to request a feature." });  
			this.homey.settings.set('notification_update_variablesinflows', true);
		}



			
		// get_stamp
		let format_datetime = this.homey.flow.getActionCard('format_datetime');
		format_datetime
		.registerRunListener( async (args, state) => {
			return {result:this.homey.app.dateTime.toString(args.format.name)};
		})
		.getArgument('format')
		.registerAutocompleteListener((query, args) => {
			let r = [
				{name:'dd-MM-yyyy'},
				{name:'dd-MM-yyyy hh:mm'},
				{name:'dd-MM-yyyy hh:mm:ss'},
				{name:'hh:mm'},
				{name:'hh:mm:ss'},
			];
			_.each(r, x=>x.description=this.homey.app.dateTime.toString(x.name) );
			r.unshift({name:query, description:this.homey.app.dateTime.toString(query)});
			return r;
		});


	}

}

module.exports = BetterLogic;
