"use strict";

const Homey = require('homey');

var util = require('../../lib/util/util.js');
var variableManager = require('../../lib/variablemanager.js');

let devices = [];

class NumSlideDriver extends Homey.Driver {
    onInit() {
        this.log('NumSlideDriver initialized');

        this.homey.settings.on('set',
            (action) => {
                if (action == 'numValueChanged') {
                    const changedVariable = this.homey.settings.get('numValueChanged');

                    if (changedVariable.type == 'number') {
                        // Look up the current devices, so devices paired or deleted after startup are handled.
                        var device = this.getDevices().find(function (dev) {
                            return dev.getData().id == changedVariable.name;
                        });

                        if (device) {
                            device.setCapabilityValue('dim', changedVariable.value)
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
        var myData;

        session.setHandler('start', (data) => {
            myData = data;
        });

        session.setHandler('list_devices', (data) => {
            //var nums = variableManager.retrieveVariables('query', null, 'number');
            var numbers = variableManager.retrieveVariables(null, null, 'number');
            var devices = [];

            numbers.forEach(function (variable) {
                console.log(variable);
                var device = {
                    name: variable.name,
                    state: { dim: variable.value },
                    data: {
                        id: variable.name,
                        type: variable.type
                    },
                    capabilitiesOptions: {
                        dim: {
                            title: variable.name,
                            min: myData.min * 1,
                            max: myData.max * 1,
                            step: myData.step * 1
                        }
                    }
                };
                devices.push(device);

            });

            return devices;
        });
        session.setHandler("add_device", (device) => {
            //devices = this.getDevices();
            return devices.push(device);
        });
    }
}
module.exports = NumSlideDriver;
