"use strict";

const Homey = require('homey');

var util = require('../../lib/util/util.js');
var variableManager = require('../../lib/variablemanager.js');

var devices = [];

class BitFlipDriver extends Homey.Driver {
  onInit() {
    this.log('BitFlipDriver initialized');
    devices = this.getDevices();

    this.homey.settings.on('set',
        function (action) {
            if (action == 'boolValueChanged') {
                const changedVariable = this.homey.settings.get('boolValueChanged');

                if (changedVariable.type == 'boolean') {
                    var device = devices.find(function (dev) {                        
                        if(dev.getData) return dev.getData().id == changedVariable.name;
                        else return dev.data.id == changedVariable.name;
                    });

                    if (device) {
                        device.setCapabilityValue('onoff', changedVariable.value);
                    }
                }
            }
            Promise.resolve();
        });
  }



  async onPair( session ) {

    session.setHandler('list_devices', ( data )=> {
        var vars = variableManager.getVariables();
        //var bools = variableManager.retrieveVariables('query', null, 'boolean');
        var booleans = variableManager.retrieveVariables(null, null, 'boolean');
        
        var devices = [];

        booleans.forEach(function (variable) {
            console.log(variable);
            var device = {
                name: variable.name,
                data: {
                    id: variable.name,
                    type: variable.type,
                    value: variable.value
                }
            };
            devices.push(device);
        });

        return devices;
    });

    session.setHandler("add_devices", (device)=> {
        return devices.push(device);
    });
  }
}
module.exports = BitFlipDriver;
