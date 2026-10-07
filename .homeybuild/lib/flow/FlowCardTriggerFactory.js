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

    const _this = this;
    this.variableManager = variableManager;
    this.homey = variableManager.homey;

    homey = variableManager.homey;

    const sustainedTypes = ['number', 'string', 'boolean'];
    this.sustainedCards = {
      number: { card: null },
      boolean: { card: null },
      string: { card: null }
    }
    this.sustained = {
      number: { variables: {} },
      boolean: { variables: {} },
      string: { variables: {} }
    };


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




    /* Sustained Start */
    this.oldSustained = {};

    this.homey.settings.unset('Sustained_trigger');


    sustainedTypes.forEach(sustainedType => {
      this.oldSustained[sustainedType] = this.homey.settings.get(`Sustained_${sustainedType}`);

      const sustained_card = this.homey.flow.getTriggerCard(`variable_${sustainedType}_sustained`);
      this.sustainedCards[sustainedType].card = sustained_card;
      sustained_card
        .on('update', (() => {
          refreshSustained(sustainedType);
        }))
        .registerRunListener((args, state) => {
          let r = args.variable && args.variable.name && state.variable && state.variable.name && args.variable.name === state.variable.name &&
            args.condition === state.condition &&
            args.value === state.value &&
            args.time === state.time &&
            args.unit === state.unit &&
            args.execute === state.execute
            ;
          return Promise.resolve(r);
        })
        .getArgument('variable').registerAutocompleteListener((query, args) => {
          return Promise.resolve(variableManager.retrieveVariables(query, args, sustainedType));
        });
      refreshSustained(sustainedType);
    });


    /* Sustained End */

    this.updateSustained = function (variable) {
      if (_this.sustained && _this.sustained[variable.type] && _this.sustained[variable.type].variables[variable.name] && _this.sustained[variable.type].variables[variable.name].sustained) {
        for (let iSustained = 0; iSustained < _this.sustained[variable.type].variables[variable.name].sustained.length; iSustained++) {
          const sustained = _this.sustained[variable.type].variables[variable.name].sustained[iSustained];
          updateSustained(sustained, _this.sustained[variable.type], variable);
        }
      }
    }

    function updateSustained(sustained, sustainedType, variable) {
      if (!validateSustained(sustained, variable.value)) {
        clearTimeoutSustained(sustained);
        delete sustained.triggered;
        delete sustained.valueTrue;
        delete sustained.valueTrueSet;
        saveSustained(variable.type);
        //delete sustained.nextTimeout;
      } else if (!sustained.timeoutId) {
        sustained.valueTrue = variable?.value;
        sustained.valueTrueSet = variable?.lastChangedTick;
        if (!(sustained.triggered && sustained.triggered >= sustained.nextTimeout && sustained.execute === 'one_time')) {
          let time = calculateDuration(sustained.time, sustained.unit);
          sustained.nextTimeout = (sustained.valueTrueSet || Date.now()) + time;
        }
        let timeout = sustained.nextTimeout - Date.now();
        if (timeout <= 0) timeout = 1;
        setTimeoutSustained(sustained, sustainedType.variables[variable.name], timeout);
        saveSustained(variable.type);
      }
    }

    function refreshSustained(type) {
      const sustainedType = _this.sustained[type];
      _this.sustainedCards[type].card.getArgumentValues()
        .then(args => {
          let variablesArgs = args;

          for (let iVariable = 0; iVariable < variablesArgs.length; iVariable++) {
            const variableArg = variablesArgs[iVariable];

            if (!sustainedType.variables[variableArg.variable.name]) sustainedType.variables[variableArg.variable.name] = { sustained: [] };
            let sustained;
            if (!(sustained = sustainedType.variables[variableArg.variable.name].sustained.find(x =>
              x.condition === variableArg.condition &&
              x.value === variableArg.value &&
              x.time === variableArg.time &&
              x.unit === variableArg.unit &&
              x.execute === variableArg.execute
            )))
              sustainedType.variables[variableArg.variable.name].sustained.push((sustained = {
                condition: variableArg.condition,
                value: variableArg.value,
                time: variableArg.time,
                unit: variableArg.unit,
                execute: variableArg.execute,
              }));
            let oldSustained = _this.oldSustained && _this.oldSustained[type] && _this.oldSustained[type].variables && _this.oldSustained[type].variables[variableArg.variable.name] && _this.oldSustained[type].variables[variableArg.variable.name].sustained
              ? _this.oldSustained[type].variables[variableArg.variable.name].sustained.find(x =>
                x.condition === variableArg.condition &&
                x.value === variableArg.value &&
                x.time === variableArg.time &&
                x.unit === variableArg.unit &&
                x.execute === variableArg.execute
              ) : null;
            //if (!sustained.hasOwnProperty('valueTrue')) {
            
            sustainedType.variables[variableArg.variable.name].type = type;
            if (oldSustained) {
              sustained.valueTrue = oldSustained.valueTrue;
              sustained.valueTrueSet = oldSustained.valueTrueSet;
            } else {
              try {
                const variable = variableManager.getVariable(variableArg.variable.name);
                sustained.valueTrue = variable?.value;
                sustained.valueTrueSet = variable?.lastChangedTick;
              } catch (error) { }
            }
            //}

            //Add get values from device
            if (!validateSustained(sustained, sustained.valueTrue)) {
              clearTimeoutSustained(sustained);
              delete sustained.triggered;
              delete sustained.valueTrue;
              delete sustained.valueTrueSet;
            } else {
              if (!sustained.timeoutId) {
                let oldSustained;
                if (_this.oldSustained && _this.oldSustained[type] && _this.oldSustained[type].variables && _this.oldSustained[type].variables[variableArg.variable.name] &&
                  (oldSustained = _this.oldSustained[type].variables[variableArg.variable.name].sustained.find(x =>
                    x.condition === variableArg.condition &&
                    x.value === variableArg.value &&
                    x.time === variableArg.time &&
                    x.unit === variableArg.unit &&
                    x.execute === variableArg.execute
                  ))) {
                  sustained.triggered = oldSustained.triggered;
                  sustained.nextTimeout = oldSustained.nextTimeout;
                } else if (!sustained.nextTimeout) {
                  let time = calculateDuration(sustained.time, sustained.unit);
                  sustained.nextTimeout = (sustained.valueTrueSet || Date.now()) + time;
                }

                let timeout = sustained.nextTimeout - Date.now();
                if (timeout <= 0) timeout = 1;
                setTimeoutSustained(sustained, sustainedType.variables[variableArg.variable.name], timeout);
              }
            }
          }

          if (sustainedType && sustainedType.variables)
            for (const variableKey in sustainedType.variables) {
              if (!Object.hasOwn(sustainedType.variables, variableKey)) continue;
              const variable = sustainedType.variables[variableKey];

              for (let iSustained = 0; iSustained < variable.sustained.length; iSustained++) {
                const sustained = variable.sustained[iSustained];
                const sustainedArgs = BL._.filter(args, arg =>
                  arg.variable.name === variableKey &&
                  arg.condition === sustained.condition &&
                  arg.value === sustained.value &&
                  arg.time === sustained.time &&
                  arg.unit === sustained.unit &&
                  arg.execute === sustained.execute
                );
                if (sustainedArgs.length === 0) {
                  // removetimeout.
                  clearTimeoutSustained(sustained);
                  variable.sustained.splice(iSustained, 1);
                  iSustained--;
                }
              }
              if (variable.sustained.length === 0) delete sustainedType.variables[variableKey];


            }

          saveSustained(type);
          delete _this.oldSustained[type];
        });
    }


    function saveSustained(type) {
      _this.homey.log(`Sustained_${type}`, JSON.stringify(_this.sustained[type]));
      _this.homey.settings.set(`Sustained_${type}`, _this.sustained[type]);
    }

    function validateSustained(sustained, variableValue) {
      if (variableValue === null || variableValue === undefined) return false;
      let value = sustained.value;

      try {
        switch (sustained.condition) {
          case 'equal_to':
            if (variableValue === value) return true;
            break;
          case 'not_equal_to':
            if (variableValue !== value) return true;
            break;
          case 'contains':
            if (variableValue.indexOf(value) > -1) return true;
            break;
          case 'greater_than':
            if (variableValue > value) return true;
            break;
          case 'greater_than_equal':
            if (variableValue >= value) return true;
            break;
          case 'less_than':
            if (variableValue < value) return true;
            break;
          case 'less_than_equal':
            if (variableValue <= value) return true;
            break;
          default:
            break;
        }
      } catch (error) {

      }
      return false;
    }
    function clearTimeoutSustained(sustained) {
      if (sustained.timeoutId) {
        _this.homey.clearTimeout(sustained.timeoutId);
        delete sustained.timeoutId;
      }
    }
    function setTimeoutSustained(sustained, variable, time) {
      clearTimeoutSustained(sustained);
      if (sustained.triggered && sustained.triggered >= sustained.nextTimeout && sustained.execute === 'one_time') {
        return;
      }
      
      let timeOuter = _this.homey.setTimeout(() => {
        timeoutSustained(sustained, variable);
      }, time);
      let timeoutId = timeOuter[Symbol.toPrimitive]();
      sustained.timeoutId = timeoutId;
    }
    function timeoutSustained(sustained, variable) {
      if (sustained.triggered && sustained.triggered >= sustained.nextTimeout && sustained.execute === 'one_time') {
        clearTimeoutSustained(sustained);
        return;
      }
      let time = calculateDuration(sustained.time, sustained.unit);
      let state = BL._.clone(sustained);
      let executed = false;
      if (validateSustained(sustained, sustained.valueTrue)) {
        executed = true;
        sustained.triggered = Date.now();
        _this.sustainedCards[variable.type].card.trigger(null, state);
      }
      if (sustained.execute === 'every_time' || !executed) {
        sustained.nextTimeout = Date.now() + time;

        setTimeoutSustained(sustained, variable, time);
      }
      saveSustained(variable.type);

    }
    function calculateDuration(time, unit) {
      if (isNaN(time)) {
        throw new Error('invalid time: ', time);
      }

      switch (unit) {
        case 'milliseconds':
          return time;
        case 'seconds':
          return 1e3 * time;
        case 'minutes':
          return 1e3 * time * 60;
        case 'hours':
          return 1e3 * time * 60 * 60;
        case 'days':
          return 1e3 * time * 60 * 60 * 24;
        default:
          throw new Error('invalid unit');
      }
    }


    return this;
  }
};
