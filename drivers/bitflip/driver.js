"use strict";

const Homey = require('homey');

var util = require('../../lib/util/util.js');
var variableManager = require('../../lib/variablemanager.js');

var devices = [];

class BitFlipDriver extends Homey.Driver {
    onInit() {
        this.log('BitFlipDriver initialized');

        this.homey.settings.on('set',
            (action) => {
                if (action == 'boolValueChanged') {
                    const changedVariable = this.homey.settings.get('boolValueChanged');

                    if (changedVariable.type == 'boolean') {
                        // Look up the current devices, so devices paired or deleted after startup are handled.
                        var device = this.getDevices().find(function (dev) {
                            return dev.getData().id == changedVariable.name;
                        });

                        if (device) {
                            device.setCapabilityValue('onoff', changedVariable.value)
                                .catch(error => this.reportDeviceError(changedVariable.name, error));
                        }
                    }
                }
                Promise.resolve();
            });
    }

    reportDeviceError(name, error) {
        this.error(`Error while setting device ${name}:`, error);
        this.homey.notifications.createNotification({ excerpt: `Error while setting device ${name}: ` + (error.message || error) })
            .catch(notificationError => this.error('Notification failed', notificationError));
    }



    async onPair(session) {

        session.setHandler('list_devices', (data) => {
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

        session.setHandler("add_devices", (device) => {
            return devices.push(device);
        });
    }
}
module.exports = BitFlipDriver;
