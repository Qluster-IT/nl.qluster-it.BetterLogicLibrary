'use strict';

var variableManager = require('./lib/variablemanager.js');
const Homey = require('homey');

class BetterLogic extends Homey.App {

	async onInit() {

		
		if (process.env.DEBUG === '1') require('inspector').open(9232, '0.0.0.0', true);
    	this.log('BetterLogic is running...');
	    variableManager.init(this.homey);

		
		if(!await this.homey.settings.get('notification_update_variablesinflows')) {
			this.homey.notifications.createNotification({excerpt : "The Better Logic App has been transferred to a new developer and rewriten to SDK3.\nVariables can now be created directly from within AND and THEN cards!\nJust type a name and select it from the list!\nAnd also, the Delete All button now has a Confirm before all are variables deleted.\nSee the Forum Topic for more info or to request a feature." });  
			this.homey.settings.set('notification_update_variablesinflows', true);
		}

	}

}

module.exports = BetterLogic;
