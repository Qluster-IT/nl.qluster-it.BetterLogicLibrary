"use strict";

const Homey = require('homey');

var math = require('../util/math.js');
var util = require('../util/util.js');

const { BL } = require('betterlogiclibrary');

let homey;
let lastQuery;

module.exports = {
  CreateFlowCardTriggers: function (variableManager) {
    if (variableManager === undefined) {
      return;
    }

    this.variableManager = variableManager;
    this.homey = variableManager.homey;

    homey = variableManager.homey;


    this.cards = {};

    this.initArgumentReader = async function () {
      for (const flowTypeId in this.homey.manifest.flow) {
        if (Object.hasOwnProperty.call(this.homey.manifest.flow, flowTypeId)) {
          const flowType = this.homey.manifest.flow[flowTypeId];

          let type = flowTypeId == 'actions' ? 'Action' : flowTypeId == 'conditions' ? 'Condition' : 'Trigger';
          for (const flowcard of flowType) {
            if (flowcard.args && flowcard.args.find(x => x.name === 'variable' && x.type === 'autocomplete')) {
              if (!this.cards[flowcard.id]) {
                this.cards[flowcard.id] = { card: await this.homey.flow['get' + type + 'Card'](flowcard.id), names: [], id: flowcard.id };
              }
              await this.setArgumentNames(this.cards[flowcard.id]);
              this.cards[flowcard.id].card.on('update', async () => {
                await this.setArgumentNames(this.cards[flowcard.id]);
                await this.setVariablesFromArguments();
              });
            }
          }
        }
      }
      await this.setVariablesFromArguments();
    };


    this.getTypeFromCardId = (cardId) => {
      return cardId == 'execute_bl_expression_tag' || cardId == 'bl_expression' ? undefined :
        cardId.indexOf('trigger') > -1 ? "trigger" :
          cardId.indexOf('expression') > -1 || cardId.indexOf('if_variable_changed') > -1 || cardId.indexOf('if_variable_set') > -1 ? "any" :
            cardId.indexOf('boolean') > -1 ? "boolean" :
              cardId.indexOf('number') > -1 || cardId.indexOf('_than') > -1 ? "number" :
                cardId.indexOf('string') > -1 || cardId.indexOf('starts_with') || cardId.indexOf('contains') > -1 ? "string" : undefined;

    };
    this.setArgumentNames = async (card) => {
      let args = await card.card.getArgumentValues();
      args = BL._.filter(args, x => x.variable);
      card.type = this.getTypeFromCardId(card.id);
      card.names = BL._.uniq(args.map(x => x.variable.name));
      //console.log(args);      
    };

    this.setVariablesFromArguments = async () => {
      let types = BL._.uniqBy(BL._.map(this.cards, c => { return { type: c.type }; }), 'type');
      types = BL._.filter(types, t => t.type != 'any');
      BL._.each(types, t => t.names = BL._.uniq(BL._.flatMap(BL._.filter(this.cards, c => c.type == t.type), x => x.names)));


      let variables = variableManager.getVariables();
      for (const type of types) {

        for (const name of type.names) {
          if (!BL._.find(variables, v => v.name === name)) {
            variableManager.addVariable(name, type.type);
            variables = variableManager.getVariables();
          }
        }

        for (const variable of variables) {
          if (variable.type !== type.type) continue;
          if (!BL._.find(type.names, v => v === variable.name)) {
            let vari = variableManager.getVariable(variable.name);
            if (vari && vari.auto === true) {
              variableManager.removeVariable(variable.name);
              variables = variableManager.getVariables();
            }
          }
        }
      }

      //this.homey.api.realtime('variable_changed'); // Not needed, will trigger for each change.

    };



    this.initArgumentReader();



    // if_variable_changed
    let if_variable_changed = this.homey.flow.getTriggerCard('if_variable_changed');
    if_variable_changed
      .registerRunListener(async (args, state) => {
        if (args.variable && state.name && args.variable.name == state.name) {
          return true; // true to make the flow continue, or false to abort
        }
        return false; // true to make the flow continue, or false to abort
      })
      .getArgument('variable')
      .registerAutocompleteListener((query, args) => {
        return Promise.resolve(variableManager.retrieveVariables(query, args, 'any'));
      });

    // if_variable_set
    let if_variable_set = this.homey.flow.getTriggerCard('if_variable_set');
    if_variable_set
      .registerRunListener(async (args, state) => {
        if (args.variable && state.name && args.variable.name == state.name) {
          return true; // true to make the flow continue, or false to abort
        }
        return false; // true to make the flow continue, or false to abort
      })
      .getArgument('variable')
      .registerAutocompleteListener((query, args) => {
        return Promise.resolve(variableManager.retrieveVariables(query, args, 'any'));
      });

    // if_one_of_variable_changed
    let if_one_of_variable_changed = this.homey.flow.getTriggerCard('if_one_of_variable_changed');
    if_one_of_variable_changed
      .registerRunListener(async (args, state) => {
        if (args.variable && state.name) {
          try {
            var selectedVariables = args.variable.replace(/^\s+|\s+$/g, "").split(/\s*,\s*/);
            return selectedVariables.indexOf(state.name) >= 0; // true to make the flow continue, or false to abort
          } catch (err) {
            return false;
          }
        }
        return false; // true to make the flow continue, or false to abort
      });

    // if_number_variable_changed
    let if_number_variable_changed = this.homey.flow.getTriggerCard('if_number_variable_changed');
    if_number_variable_changed
      .registerRunListener(async (args, state) => {
        if (args.variable && state && state.oldVariable && state.newVariable) {
          if (args.variable.name === state.newVariable.name) {
            if (args.action === 'changed') {
              if (Math.abs(state.oldVariable.value - state.newVariable.value) >= args.amount) {
                return true;
              }
            }

            if (args.action === 'increased') {

              if ((state.newVariable.value - state.oldVariable.value) >= args.amount) {
                return true;
              }
            }
            if (args.action === 'decreased') {
              if ((state.oldVariable.value - state.newVariable.value) >= args.amount) {
                return true;
              }
            }
          }
        }
        return false; // true to make the flow continue, or false to abort
      })
      .getArgument('variable')
      .registerAutocompleteListener((query, args) => {
        return Promise.resolve(variableManager.retrieveVariables(query, args, 'number'));
      });

    // debug_any_variable_changed
    let debug_any_variable_changed = this.homey.flow.getTriggerCard('debug_any_variable_changed');
    debug_any_variable_changed
      .registerRunListener(async (args, state) => {
        return false; // true to make the flow continue, or false to abort
      });

    let any_variable_changed = this.homey.flow.getTriggerCard('any_variable_changed');
    any_variable_changed
      .registerRunListener(async (args, state) => {
        return false; // true to make the flow continue, or false to abort
      });

  }
};
