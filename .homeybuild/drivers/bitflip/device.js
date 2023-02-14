'use strict';

const Homey = require('homey');
var variableManager = require('../../lib/variablemanager.js');


class BitFlipDevice extends Homey.Device {

    onInit() {
        this.registerCapabilityListener('onoff', this.onCapabilityOnOff.bind(this))
    }

    async onCapabilityOnOff( value, opts, callback ) {
        var variable = variableManager.getVariable(this.getData().id);
        if (variable) {
            await variableManager.updateVariable(this.getData().id, value, this.getData().type);

            return true;
        } else {
            throw new Error('Variable not found!');
        }
    }

}

module.exports = BitFlipDevice;
