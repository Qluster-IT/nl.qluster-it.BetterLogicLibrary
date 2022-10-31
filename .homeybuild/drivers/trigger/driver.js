"use strict";

const Homey = require('homey');

var util = require('../../lib/util/util.js');
var variableManager = require('../../lib/variablemanager.js');

var devices = [];

class TriggerDriver extends Homey.Driver {
  onInit() {
      this.log('TriggerDevice initialized');
  }

  onPair( socket ) {

    socket.on('list_devices', function( data, callback ) {
        var bools = variableManager.retrieveVariables('query', null, 'trigger');
        var devices = [];

        bools.forEach(function (variable) {
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

    socket.on("add_devices", function(device, callback) {
        devices.push(device);
    });
  }
}
module.exports = TriggerDriver;
