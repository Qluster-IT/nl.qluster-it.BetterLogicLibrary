var util = require('./util/util.js');
var FlowCardActionFactory = require('./flow/FlowCardActionFactory.js');
var FlowCardConditionFactory = require('./flow/FlowCardConditionFactory.js');
var FlowCardTriggerFactory = require('./flow/FlowCardTriggerFactory.js');

var newVar = '';
var tokens = [];

const Homey = require('homey');
let homey;

module.exports = {
    init: function(_homey) {
        this.homey = _homey;
        homey = _homey;
        var variables = getVariables();

        FlowCardActionFactory.CreateFlowCardActions(this);
        FlowCardConditionFactory.CreateFlowCardConditions(this);
        FlowCardTriggerFactory.CreateFlowCardTriggers(this);

        //create tokens
        variables.forEach(function(variable) {
            createToken(variable.name, variable.value, variable.type);
        });

        this.homey.settings.on('set',
            function (action) {
                if (action == 'deleteall') {
                    deleteAllInsights();
                    deleteAllTokens();
                    this.homey.settings.set('variables', []);
                }
                if (action == 'changedvariables') {
                    const changeObject = this.homey.settings.get('changedvariables');
                    const newVariable = changeObject.variable;
                    updateVariable(newVariable.name, newVariable.value, newVariable.type, newVariable.remove);
                }
            });
    },
    getVariables: function() {
        return getVariables();
    },
    getVariable: function(variable) {
        return findVariable(getVariables(), variable);
    },
    updateVariable: function(name, value, type) {
        updateVariable(name, value, type);
    }
};




function updateVariable(name, value, type, remove = false) {
    const variables = getVariables();
    const oldVariable = findVariable(variables, name);
    if (oldVariable) {
        variables.splice(variables.indexOf(oldVariable), 1);
    }

    const newVariable = {
        name: name,
        value: value,
        type: type,
        remove: remove,
        lastChanged: getShortDate()
    };

    if (!remove) {
        variables.unshift(newVariable);
        homey.api.realtime('setting_changed', newVariable);
    }

    processValueChanged(variables, oldVariable, newVariable);
}

function findVariable(variables, variable) {
    return variables.filter(function (item) {
        return item.name === variable;
    })[0];
}
function processValueChanged(variables, oldVariable, newVariable) {
    homey.settings.set('variables', variables);

    if (newVariable && newVariable.remove) {
        removeInsights(newVariable.name);
        homey.insights.deleteLog(newVariable.name, function(err, state) {});
        removeToken(newVariable.name);
        return;
    }

    if (newVariable && !oldVariable) {
        createOrUpdateInsights(newVariable.name, newVariable.value, newVariable.type);
        createToken(newVariable.name, newVariable.value, newVariable.type);

    }

    if (newVariable && oldVariable && oldVariable.value !== newVariable.value) {
        createOrUpdateInsights(newVariable.name, newVariable.value, newVariable.type);
        updateToken(newVariable.name, newVariable.value);

        getTrigger('if_variable_changed').trigger({ "variable": newVariable.name, "value": newVariable.value }, newVariable);
        getTrigger('debug_any_variable_changed').trigger({ "variable": newVariable.name, "value": newVariable.value }, newVariable);
        getTrigger('if_one_of_variable_changed').trigger({ "variable": newVariable.name, "value": newVariable.value }, newVariable);
    }

    if (newVariable && newVariable.type == 'boolean') {
       homey.settings.set('boolValueChanged', newVariable);
    }

    if (newVariable && newVariable.type == 'number') {
       homey.settings.set('numValueChanged', newVariable);
       getTrigger('if_number_variable_changed').trigger({ "variable": newVariable.name, "value": newVariable.value }, { oldVariable: oldVariable, newVariable: newVariable });
    }

   if (newVariable) {
       getTrigger('if_variable_set').trigger({ "variable": newVariable.name, "value": newVariable.value }, newVariable);
    }
}

function getTrigger(name)
{
  return homey.flow.getTriggerCard(name);
}

async function createOrUpdateInsights(name, value, type) {
  // no insights for string
  if(type == 'string') {
    return;
  }

  let log;
  try {
    log = await homey.insights.getLog(name);
    console.log("else createEntry  > " + value);
  } catch(e) {
    log = await homey.insights.createLog(name, GetInsightOptions(name, type));
    console.log("if createLog > createEntry > " + value);
  }

  try {
    await log.createEntry(value);
  } catch(err) {
    console.log(err);
  }
};

function GetInsightOptions(name, type)
{
    if (type == 'number')
    {
        return {
          title: { en: name },
          type: 'number',
          units: { en: 'Value' },
          decimals: 2,
          chart: 'stepLine'
        };
    }
    else if (type == 'boolean')
    {
        return {
          title: { en: name },
          type: 'boolean',
          units: { en: 'Value' },
          decimals: 0,
          chart: 'column'
        };
    }
}

function deleteAllInsights() {
    homey.insights.getLogs(function (err, logs) {
        console.log(logs);
        logs.forEach(function (log) {
            homey.insights.deleteLog(log, function (err, state) { });
        });
    });
}

function removeInsights(name) {
    homey.insights.getLog(name,
        function(err, log) {
            if (log) {
                homey.insights.deleteLog(log);
            }
        });
}

function deleteAllTokens() {
    for (var i = tokens.length - 1; i >= 0; i--) {
        tokens[i].unregister().then(() => {}).catch(err => { console.log(err); });
        tokens.splice(i, 1);
    }
}

async function createToken(name, value, type) {
    if (type !== 'trigger') {
        var token = await homey.flow.createToken(name, { type: type, title: name });  
        tokens.push(token);      
        return await token.setValue(value);
        
    }
}

function removeToken(name) {
    for (var i = tokens.length - 1; i >= 0; i--) {
        if (tokens[i].id === name) {
            tokens[i].unregister().then(() => {}).catch(err => { console.log(err); });
            tokens.splice(i, 1);
        }
    }
}

function updateToken(name, value) {
    for (var i = tokens.length - 1; i >= 0; i--) {
        if (tokens[i].id === name) {
            tokens[i].setValue(value);
        }
    }
}

function getShortDate() {
    return new Date().toISOString();
}

function getVariables() {
    var varCollection = homey.settings.get('variables');

    if(!Array.isArray(varCollection)) {
      console.log('varCollection is not array');
      return [];
    }

    if (!varCollection || varCollection === undefined) {
        return [];
    }
    return varCollection;
}
