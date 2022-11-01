"use strict";

const Homey = require('homey');

var util = require('../../lib/util/util.js');
var variableManager = require('../../lib/variablemanager.js');

var devices = [];

class TriggerDriver extends Homey.Driver {
  onInit() {
      this.log('TriggerDevice initialized');
  }

  async onPair( session ) {

    session.setHandler('list_devices', ( data )=> {
        //var bools = variableManager.retrieveVariables('query', null, 'trigger');
        var triggers = variableManager.retrieveVariables(null, null, 'trigger');
        var devices = [];

        triggers.forEach(function (variable) {
            var device = {
                name: variable.name,
                data: {
                    id: variable.name,
                    type: variable.type
                }
            };
            devices.push(device);
        });

        return devices ;
    });

    session.setHandler("add_devices", (device)=> {
        return devices.push(device);
    });
  }
}
module.exports = TriggerDriver;
