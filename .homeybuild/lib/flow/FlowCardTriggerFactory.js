"use strict";

const Homey = require('homey');

var math = require('../util/math.js');
var util = require('../util/util.js');

module.exports = {
    CreateFlowCardTriggers: function (variableManager) {
        if (variableManager === undefined) {
            return;
        }

        this.variableManager = variableManager;
        this.homey = variableManager.homey;

        // if_variable_changed
        let if_variable_changed = this.homey.flow.getTriggerCard('if_variable_changed');
        if_variable_changed
            .on('run', async (args, state) => {
                if (args.variable && state.name && args.variable.name == state.name) {
                    return true; // true to make the flow continue, or false to abort
                    return;
                }
                return false; // true to make the flow continue, or false to abort
            })
            .getArgument('variable')
            .registerAutocompleteListener((query, args) => {
                return Promise.resolve(variableManager.getVariables().filter(util.contains(query)));
            });

        // if_variable_set
        let if_variable_set = this.homey.flow.getTriggerCard('if_variable_set');
        if_variable_set
            .on('run', async (args, state) => {
                if (args.variable && state.name && args.variable.name == state.name) {
                    return true; // true to make the flow continue, or false to abort
                    return;
                }
                return false; // true to make the flow continue, or false to abort
            })
            .getArgument('variable')
            .registerAutocompleteListener((query, args) => {
                return Promise.resolve(variableManager.getVariables().filter(util.contains(query)));
            });

        // if_one_of_variable_changed
        let if_one_of_variable_changed = this.homey.flow.getTriggerCard('if_one_of_variable_changed');
        if_one_of_variable_changed
            .on('run', async (args, state) => {
                if (args.variable && state.name) {
                    try {
                        var selectedVariables = args.variable.replace(/^\s+|\s+$/g, "").split(/\s*,\s*/);
                        return selectedVariables.indexOf(state.name) >= 0; // true to make the flow continue, or false to abort
                        return;
                    } catch (err) {
                        return false;
                        return;
                    }
                }
                return false; // true to make the flow continue, or false to abort
            });

        // if_number_variable_changed
        let if_number_variable_changed = this.homey.flow.getTriggerCard('if_number_variable_changed');
        if_number_variable_changed
            .on('run', async (args, state) => {
                if (args.variable && state && state.oldVariable && state.newVariable) {
                    if (args.variable.name === state.newVariable.name) {
                        if (args.action === 'changed') {
                            if (Math.abs(state.oldVariable.value - state.newVariable.value) >= args.amount) {
                                return true;
                                return;
                            }
                        }

                        if (args.action === 'increased') {

                            if ((state.newVariable.value - state.oldVariable.value) >= args.amount) {
                                return true;
                                return;
                            }
                        }
                        if (args.action === 'decreased') {
                            if ((state.oldVariable.value - state.newVariable.value) >= args.amount) {
                                return true;
                                return;
                            }
                        }
                    }
                }
                return false; // true to make the flow continue, or false to abort
            })
            .getArgument('variable')
            .registerAutocompleteListener((query, args) => {
                return Promise.resolve(variableManager.getVariables().filter(util.filterVariable(query, 'number')));
            });

        // debug_any_variable_changed
        let debug_any_variable_changed = this.homey.flow.getTriggerCard('debug_any_variable_changed');
        debug_any_variable_changed
            .on('run', async (args, state) => {
                return false; // true to make the flow continue, or false to abort
            });
    }
}
