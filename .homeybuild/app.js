'use strict';

var variableManager = require('./lib/variablemanager.js');
const Homey = require('homey');

class BetterLogic extends Homey.App {

	onInit() {

		
		if (process.env.DEBUG === '1') require('inspector').open(9232, '0.0.0.0', true);
    	this.log('BetterLogic is running...');
	    variableManager.init(this.homey);
	}

}

module.exports = BetterLogic;
