"use strict";

const Homey = require('homey');

var math = require('../util/math.js');
var util = require('../util/util.js');
const _ = require('lodash-core');

let homey;
let lastQuery;

module.exports = {
    CreateFlowCardTriggers: function (variableManager) {
        if (variableManager === undefined) {
            return;
        }

        this.variableManager = variableManager;
        this.homey = variableManager.homey;


        this.cards = {};

        this.initArgumentReader = async function() {
          for (const flowTypeId in this.homey.manifest.flow) {
            if (Object.hasOwnProperty.call(this.homey.manifest.flow, flowTypeId)) {
              const flowType = this.homey.manifest.flow[flowTypeId];
              
              let type = flowTypeId=='actions' ? 'Action' : flowTypeId=='conditions' ? 'Condition' : 'Trigger';
              for (const flowcard of flowType) {
                if(flowcard.args && flowcard.args.find(x=>x.name==='variable' && x.type==='autocomplete')) {
                  if(!this.cards[flowcard.id]) {
                    this.cards[flowcard.id] = {card:await this.homey.flow['get'+type+'Card'](flowcard.id), names:[], id:flowcard.id };
                  }
                  await this.setArgumentNames(this.cards[flowcard.id]);
                  this.cards[flowcard.id].card.on('update', async ()=> { 
                    await this.setArgumentNames(this.cards[flowcard.id]); 
                    await this.setVariablesFromArguments();
                  });
                }
              }
            }
          }      
          await this.setVariablesFromArguments();
        };
    
        let retrieveCountdowns = (query, args) => {
          let allVariables =variableManager.getVariables();
          let l = allVariables.filter(util.contains(query));
          let added = false;
          if(query && query.length && !allVariables.find(x=>x.name.toLowerCase()===(''||query).toLowerCase())) {
            l.unshift({name:query, type:'number', description:'Create new countdown'});
            added = true;
          } //else lastQuery = null;
    
          if(lastQuery && lastQuery.length && !query.startsWith(lastQuery) && !l.find(x=>x.name.toLowerCase()===(''||lastQuery).toLowerCase()) && !allVariables.find(x=>x.name.toLowerCase()===(''||lastQuery).toLowerCase())) {
            let a = {name:lastQuery, type:'number', description:'Just added'};
            if(added) l.splice(1,0,a);
            else l.unshift(a);
          }
          if(query && query.length) lastQuery = query;
          
          return l;
        };
    
        this.setArgumentNames = async (card) => {
          let args = await card.card.getArgumentValues();
          card.names = _.uniq(args.map(x=>x.variable.name));
          console.log(args);      
        };
    
        this.setVariablesFromArguments = async ()=> {
          let allNames = _.uniq(_.flatMap(this.cards, x=> x.names));
          let variables = variableManager.getVariables();
          for (const name of allNames) {
            if(!_.find(variables, v=>v.name===name)) {
              variableManager.addVariable(name);
              variables = variableManager.getVariables();
            }
          }
          for (const variable of variables) {        
            if(!_.find(allNames, v=>v===variable.name)) {
              let vari = variableManager.getVariable(variable.name);
              if(vari && vari.auto===true) {
                variableManager.removeVariable(variable.name);
                variables = variableManager.getVariables();
              }
            }
          }
        };
    
    
    
        this.initArgumentReader();



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
