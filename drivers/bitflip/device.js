'use strict';

const Homey = require('homey');
var variableManager = require('../../lib/variablemanager.js');


class BitFlipDevice extends Homey.Device {

    async onInit() {
        this.registerCapabilityListener('onoff', this.onCapabilityOnOff.bind(this));
        const variable = variableManager.getVariable(this.getData().id);
        if (!variable || variable.type !== 'boolean') {
            this.error(`Boolean variable not found: ${this.getData().id}`);
            return;
        }
        try {
            await this.setCapabilityValue('onoff', variable.value);
        } catch (error) {
            this.error(`Could not initialize device ${variable.name}:`, error);
        }
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
