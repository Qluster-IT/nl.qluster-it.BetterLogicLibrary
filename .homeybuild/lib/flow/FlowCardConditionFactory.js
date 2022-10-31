"use strict";

const Homey = require('homey');

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
            .on('run', async (args, state) => {
                if (args.variable) {
                    var variable = variableManager.getVariable(args.variable.name);
                    if (variable && variable.value.toLowerCase().indexOf(args.value.toLowerCase()) > -1) {
                        return true;
                        return;
                    }
                }
                return false;
            })
            .getArgument('variable')
            .registerAutocompleteListener((query, args) => {
                return Promise.resolve(variableManager.getVariables().filter(util.filterVariable(query, 'string')));
            });

        // variable_starts_with
        let variable_starts_with = this.homey.flow.getConditionCard('variable_starts_with');
        variable_starts_with
            .on('run', async (args, state) => {
                if (args.variable) {
                    var variable = variableManager.getVariable(args.variable.name);
                    if (variable && variable.value.toLowerCase().indexOf(args.value.toLowerCase()) === 0) {
                        return true;
                        return;
                    }
                }
                return false;
            })
            .getArgument('variable')
            .registerAutocompleteListener((query, args) => {
                return Promise.resolve(variableManager.getVariables().filter(util.filterVariable(query, 'string')));
            });

        // variable_matches_string
        let variable_matches_string = this.homey.flow.getConditionCard('variable_matches_string');
        variable_matches_string
            .on('run', async (args, state) => {
                if (args.variable) {
                    var variable = variableManager.getVariable(args.variable.name);
                    if (variable && variable.value.toLowerCase() === args.value.toLowerCase()) {
                        return true;
                        return;
                    }
                }
                return false;
            })
            .getArgument('variable')
            .registerAutocompleteListener((query, args) => {
                return Promise.resolve(variableManager.getVariables().filter(util.filterVariable(query, 'string')));
            });

        // variable_matches_number
        let variable_matches_number = this.homey.flow.getConditionCard('variable_matches_number');
        variable_matches_number
            .on('run', async (args, state) => {
                if (args.variable) {
                    var variable = variableManager.getVariable(args.variable.name);
                    if (variable && variable.value === args.value) {
                        return true;
                        return;
                    }
                }
                return false;
            })
            .getArgument('variable')
            .registerAutocompleteListener((query, args) => {
                return Promise.resolve(variableManager.getVariables().filter(util.filterVariable(query, 'number')));
            });

        // variable_greater_than
        let variable_greater_than = this.homey.flow.getConditionCard('variable_greater_than');
        variable_greater_than
            .on('run', async (args, state) => {
                if (args.variable) {
                    var variable = variableManager.getVariable(args.variable.name);
                    if (variable && variable.value > args.value) {
                        return true;
                        return;
                    }
                }
                return false;
            })
            .getArgument('variable')
            .registerAutocompleteListener((query, args) => {
                return Promise.resolve(variableManager.getVariables().filter(util.filterVariable(query, 'number')));
            });

        // variable_less_than
        let variable_less_than = this.homey.flow.getConditionCard('variable_less_than');
        variable_less_than
            .on('run', async (args, state) => {
                if (args.variable) {
                    var variable = variableManager.getVariable(args.variable.name);
                    if (variable && variable.value < args.value) {
                        return true;
                        return;
                    }
                }
                return false;
            })
            .getArgument('variable')
            .registerAutocompleteListener((query, args) => {
                return Promise.resolve(variableManager.getVariables().filter(util.filterVariable(query, 'number')));
            });

        // variable_is_equal
        let variable_is_equal = this.homey.flow.getConditionCard('variable_is_equal');
        variable_is_equal
            .on('run', async (args, state) => {
                if (args.variable) {
                    var variable = variableManager.getVariable(args.variable.name);
                    if (variable) {
                        return variable.value;
                        return;
                    }
                }
                return false;
            })
            .getArgument('variable')
            .registerAutocompleteListener((query, args) => {
                return Promise.resolve(variableManager.getVariables().filter(util.filterVariable(query, 'boolean')));
            });

        // condition_expression
        let condition_expression = this.homey.flow.getConditionCard('expression');
        condition_expression
            .on('run', async (args, state) => {
                if (args.expression) {
                    try {
                        var expression = util.buildExpression(args.expression);
                        return math.eval(expression);
                        return;
                    } catch (err) {
                        return false;
                        return;
                    }
                }
            });
    }
}
