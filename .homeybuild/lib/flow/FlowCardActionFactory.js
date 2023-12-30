"use strict";

const Homey = require('homey');
//const DateTime = require('../../bll/dateTime.js');

const { BL } = require("betterlogiclibrary");

var math = require('../util/math.js');
var util = require('../util/util.js');

module.exports = {
    CreateFlowCardActions: function (variableManager) {
        if (variableManager === undefined) {
            return;
        }

        this.variableManager = variableManager;
        this.homey = variableManager.homey;

        // set string
        let set_string_variable = this.homey.flow.getActionCard('set_string_variable');
        set_string_variable.registerRunListener(async (args, state) => {
            if (args.variable && args.variable.name) {
                var result = variableManager.getVariable(args.variable.name);

                if (args && args.value) args.value = await BL.decode(args.value);

                if (result) {
                    return await variableManager.updateVariable(args.variable.name, args.value, 'string');
                } else throw new Error(this.homey.__('errors.variable_not_found', { variablename: args.variable.name }));
                //throw new Error('String variable not found (' + args.variable.name + ')');
            }
        })
            .getArgument('variable').registerAutocompleteListener((query, args) => {
                return variableManager.retrieveVariables(query, args, 'string');
            });

        // set number
        let set_number_variable = this.homey.flow.getActionCard('set_number_variable');
        set_number_variable.registerRunListener(async (args, state) => {
            if (args.variable && args.variable.name) {
                var result = variableManager.getVariable(args.variable.name);

                if (result) {
                    return await variableManager.updateVariable(args.variable.name, args.value, 'number');
                } else throw new Error(this.homey.__('errors.variable_not_found', { variablename: args.variable.name }));
                //throw new Error('Number variable not found (' + args.variable.name + ')');
            }
        })
            .getArgument('variable').registerAutocompleteListener((query, args) => {
                return Promise.resolve(variableManager.retrieveVariables(query, args, 'number'));
            });

        // increment number
        let increment_number_variable = this.homey.flow.getActionCard('increment_number_variable');

        increment_number_variable.registerRunListener(async (args, state) => {
            if (args.variable && args.variable.name) {
                var result = variableManager.getVariable(args.variable.name);

                if (result) {
                    return await variableManager.updateVariable(args.variable.name, result.value + args.value, 'number');
                } else throw new Error(this.homey.__('errors.variable_not_found', { variablename: args.variable.name }));
                //throw new Error('Number variable not found (' + args.variable.name + ')');
            }
        })
            .getArgument('variable')
            .registerAutocompleteListener((query, args) => {
                return Promise.resolve(variableManager.retrieveVariables(query, args, 'number'));
            });

        // decrement number
        let decrement_number_variable = this.homey.flow.getActionCard('decrement_number_variable');

        decrement_number_variable.registerRunListener(async (args, state) => {
            if (args.variable && args.variable.name) {
                var result = variableManager.getVariable(args.variable.name);

                if (result) {
                    return await variableManager.updateVariable(args.variable.name, result.value - args.value, 'number');
                } else throw new Error(this.homey.__('errors.variable_not_found', { variablename: args.variable.name }));
                //throw new Error('Number variable not found (' + args.variable.name + ')');
            }
        })
            .getArgument('variable')
            .registerAutocompleteListener((query, args) => {
                return Promise.resolve(variableManager.retrieveVariables(query, args, 'number'));
            });

        // execute expressoin
        let execute_expression = this.homey.flow.getActionCard('execute_expression');

        execute_expression.registerRunListener(async (args, state) => {
            if (args.expression && args.variable && args.variable.name) {
                try {
                    var result = variableManager.getVariable(args.variable.name);
                    var expression = util.buildExpression(args.expression, this.homey);

                    if (args && args.value) args.value = await BL.decode(args.value);

                    if (result) {
                        var newValue = math.evaluate(expression);

                        return await variableManager.updateVariable(args.variable.name, newValue, 'number');
                    } else throw new Error(this.homey.__('errors.variable_not_found', { variablename: args.variable.name }));
                    //throw new Error('Variable not found (' + args.variable.name + ')');
                } catch (err) {
                    throw new Error('Error executing expression: ' + err.message);
                }
            }
        })
            .getArgument('variable')
            .registerAutocompleteListener((query, args) => {
                return Promise.resolve(variableManager.retrieveVariables(query, args, 'number'));
            });

        // set boolean
        let set_boolean_variable = this.homey.flow.getActionCard('set_boolean_variable');

        set_boolean_variable.registerRunListener(async (args, state) => {
            if (args.variable && args.variable.name) {
                var result = variableManager.getVariable(args.variable.name);

                if (result) {
                    return await variableManager.updateVariable(args.variable.name, (args.boolean_value === 'true'), 'boolean');
                } else throw new Error(this.homey.__('errors.variable_not_found', { variablename: args.variable.name }));
                //throw new Error('Boolean variable not found (' + args.variable.name + ')');
            }
        })
            .getArgument('variable')
            .registerAutocompleteListener((query, args) => {
                return Promise.resolve(variableManager.retrieveVariables(query, args, 'boolean'));
            });

        let set_boolean_variable_v2 = this.homey.flow.getActionCard('set_boolean_variable_v2');

        set_boolean_variable_v2.registerRunListener(async (args, state) => {
            if (args.variable && args.variable.name) {
                var result = variableManager.getVariable(args.variable.name);

                if (result) {
                    return await variableManager.updateVariable(args.variable.name, args.value, 'boolean');
                } else throw new Error(this.homey.__('errors.variable_not_found', { variablename: args.variable.name }));
                //throw new Error('Boolean variable not found (' + args.variable.name + ')');
            }
        })
            .getArgument('variable')
            .registerAutocompleteListener((query, args) => {
                return Promise.resolve(variableManager.retrieveVariables(query, args, 'boolean'));
            });


        // flip Boolean
        let flip_boolean_variable = this.homey.flow.getActionCard('flip_boolean_variable');

        flip_boolean_variable.registerRunListener(async (args, state) => {
            if (args.variable && args.variable.name) {
                var result = variableManager.getVariable(args.variable.name);

                if (result) {
                    return await variableManager.updateVariable(args.variable.name, !result.value, 'boolean');
                } else throw new Error(this.homey.__('errors.variable_not_found', { variablename: args.variable.name }));
                //throw new Error('Boolean variable not found (' + args.variable.name + ')');
            }
        })
            .getArgument('variable')
            .registerAutocompleteListener((query, args) => {
                return Promise.resolve(variableManager.retrieveVariables(query, args, 'boolean'));
            });

        // trigger variable
        let trigger_variable = this.homey.flow.getActionCard('trigger_variable');

        trigger_variable.registerRunListener(async (args, state) => {
            if (args.variable && args.variable.name) {
                var result = variableManager.getVariable(args.variable.name);

                if (result) {
                    return await variableManager.updateVariable(args.variable.name, new Date().toISOString(), 'trigger');
                } else throw new Error(this.homey.__('errors.variable_not_found', { variablename: args.variable.name }));
                //return Promise.reject(new Error('Trigger variable not found (' + args.variable.name + ')'));
            }
        })
            .getArgument('variable')
            .registerAutocompleteListener((query, args) => {
                return Promise.resolve(variableManager.retrieveVariables(query, args, 'trigger'));
            });

        // set variable
        let set_a_variable = this.homey.flow.getActionCard('set_a_variable');

        set_a_variable.registerRunListener(async (args, state) => {
            if (args.variable && args.variable.name) {
                var result = variableManager.getVariable(args.variable.name);
                if (args && args.value) args.value = await BL.decode(args.value);

                if (result) {
                    if (result.type === "boolean") {
                        if (args.value === "true" || args.value === "false") {
                            return await variableManager.updateVariable(result.name, (args.value === 'true'), result.type);
                        }
                        throw new Error(this.homey.__('Boolean_invalid_value'));
                    }
                    else if (result.type === "number") {
                        if (!isNaN(parseFloat(args.value))) {
                            return await variableManager.updateVariable(result.name, parseFloat(args.value), result.type);
                        }
                        throw new Error(this.homey.__('Number_invalid_value'));
                    }
                    else if (result.type === "string") {
                        if (typeof args.value === "string") {
                            return await variableManager.updateVariable(result.name, args.value, result.type);
                        }
                        throw new Error(this.homey.__('String_invalid_value'));
                    }
                    return true;
                }
                throw new Error(this.homey.__('errors.variable_not_found', { variablename: args.variable.name }));
            }
            return true;
        })
            .getArgument('variable')
            .registerAutocompleteListener((query, args) => {
                return Promise.resolve(variableManager.retrieveVariables(query, args, 'any'));
            });
    }
};
