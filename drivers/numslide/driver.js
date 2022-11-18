"use strict";

const Homey = require('homey');

var util = require('../../lib/util/util.js');
var variableManager = require('../../lib/variablemanager.js');

let devices = [];

class NumSlideDriver extends Homey.Driver {
  onInit() {
      this.log('NumSlideDriver initialized');
      devices = this.getDevices();

      this.homey.settings.on('set',
          function (action) {
              if (action == 'numValueChanged') {
                  const changedVariable = this.homey.settings.get('numValueChanged');

                  if (changedVariable.type == 'number') {
                      var device = devices.find(function (dev) {
                        if(dev.getData) return dev.getData().id == changedVariable.name;
                        else return dev.data.id == changedVariable.name;
                      });

                      if (device) {
                          device.setCapabilityValue('dim', changedVariable.value);
                      }
                  }
              }
              Promise.resolve();
          });
  }

  async onPair( session ) {
    var myData;

    session.setHandler('start', (data)=> {
        myData = data;
    });

    session.setHandler('list_devices', (data)=> {
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
                        min: myData.min*1,
                        max: myData.max*1,
                        step: myData.step*1
                    }
                }
            };
            devices.push(device);

        });

        return devices;
    });
    session.setHandler("add_device", (device)=> {
        //devices = this.getDevices();
        return devices.push(device);
    });
  }
}
module.exports = NumSlideDriver;
