"use strict";

const Homey = require('homey');
const { BL } = require('../bll/bl.js');

var math = require('../util/math.js');
var util = require('../util/util.js');

module.exports = {
    CreateFlowCardConditions: function (variableManager) {
        if (variableManager === undefined) {
            return;
        }

        this.variableManager = variableManager;
        this.homey = variableManager.homey;

        //variable_contains
        let variable_contains = this.homey.flow.getConditionCard('variable_contains');
        variable_contains
            .registerRunListener( async (args, state) => {
                if (args.variable) {
                    if(args && args.value) args.value = await BL.decode(args.value);
                    
                    var variable = variableManager.getVariable(args.variable.name);
                    if (variable && variable.value.toLowerCase().indexOf(args.value.toLowerCase()) > -1) {
                        return true;
                    }
                }
                return false;
            })
            .getArgument('variable')
            .registerAutocompleteListener((query, args) => {
                return Promise.resolve(variableManager.retrieveVariables(query, args, 'string'));
            });

        // variable_starts_with
        let variable_starts_with = this.homey.flow.getConditionCard('variable_starts_with');
        variable_starts_with
            .registerRunListener( async (args, state) => {
                if (args.variable) {
                    var variable = variableManager.getVariable(args.variable.name);
                    if (variable && variable.value.toLowerCase().indexOf(args.value.toLowerCase()) === 0) {
                        return true;
                    }
                }
                return false;
            })
            .getArgument('variable')
            .registerAutocompleteListener((query, args) => {
                return Promise.resolve(variableManager.retrieveVariables(query, args, 'string'));
            });

        // variable_matches_string
        let variable_matches_string = this.homey.flow.getConditionCard('variable_matches_string');
        variable_matches_string
            .registerRunListener( async (args, state) => {
                if (args.variable) {
                    var variable = variableManager.getVariable(args.variable.name);
                    if (variable && variable.value.toLowerCase() === args.value.toLowerCase()) {
                        return true;
                    }
                }
                return false;
            })
            .getArgument('variable')
            .registerAutocompleteListener((query, args) => {
                return Promise.resolve(variableManager.retrieveVariables(query, args, 'string'));
            });

        // variable_matches_number
        let variable_matches_number = this.homey.flow.getConditionCard('variable_matches_number');
        variable_matches_number
            .registerRunListener( async (args, state) => {
                if (args.variable) {
                    var variable = variableManager.getVariable(args.variable.name);
                    if (variable && variable.value === args.value) {
                        return true;
                    }
                }
                return false;
            })
            .getArgument('variable')
            .registerAutocompleteListener((query, args) => {
                return Promise.resolve(variableManager.retrieveVariables(query, args, 'number'));
            });

        // variable_greater_than
        let variable_greater_than = this.homey.flow.getConditionCard('variable_greater_than');
        variable_greater_than
            .registerRunListener( async (args, state) => {
                if (args.variable) {
                    var variable = variableManager.getVariable(args.variable.name);
                    if (variable && variable.value > args.value) {
                        return true;
                    }
                }
                return false;
            })
            .getArgument('variable')
            .registerAutocompleteListener((query, args) => {
                return Promise.resolve(variableManager.retrieveVariables(query, args, 'number'));
            });

        // variable_less_than
        let variable_less_than = this.homey.flow.getConditionCard('variable_less_than');
        variable_less_than
            .registerRunListener( async (args, state) => {
                if (args.variable) {
                    var variable = variableManager.getVariable(args.variable.name);
                    if (variable && variable.value < args.value) {
                        return true;
                    }
                }
                return false;
            })
            .getArgument('variable')
            .registerAutocompleteListener((query, args) => {
                return Promise.resolve(variableManager.retrieveVariables(query, args, 'number'));
            });

        // variable_is_equal
        let variable_is_equal = this.homey.flow.getConditionCard('variable_is_equal');
        variable_is_equal
            .registerRunListener( async (args, state) => {
                if (args.variable) {
                    var variable = variableManager.getVariable(args.variable.name);
                    if (variable) {
                        return variable.value;
                    }
                }
                return false;
            })
            .getArgument('variable')
            .registerAutocompleteListener((query, args) => {
                return Promise.resolve(variableManager.retrieveVariables(query, args, 'boolean'));
            });

        // condition_expression
        let condition_expression = this.homey.flow.getConditionCard('expression');
        condition_expression
            .registerRunListener( async (args, state) => {
                if (args.expression) {
                    try {
                        var expression = util.buildExpression(args.expression, this.homey);
                        return math.eval(expression);
                    } catch (err) {
                        return false;
                    }
                }
            });
    }
};
