var util = require('./util/util.js');
var FlowCardActionFactory = require('./flow/FlowCardActionFactory.js');
var FlowCardConditionFactory = require('./flow/FlowCardConditionFactory.js');
var FlowCardTriggerFactory = require('./flow/FlowCardTriggerFactory.js');

var newVar = '';
var tokens = [];

const Homey = require('homey');
const { BL } = require('betterlogiclibrary');
let homey;

let lastQuery = {};
let variableManager = module.exports = {
    init: function (_homey) {
        this.homey = _homey;
        homey = _homey;
        var variables = getVariables();

        FlowCardActionFactory.CreateFlowCardActions(this);
        FlowCardConditionFactory.CreateFlowCardConditions(this);
        FlowCardTriggerFactory.CreateFlowCardTriggers(this);

        //create tokens
        variables.forEach(function (variable) {
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
                    try {
                        updateVariable(newVariable.name, newVariable.value, newVariable.type, newVariable.remove);
                    } catch (error) {
                        this.homey.error('Setting.On(\'changedvariables\') error: ', error);
                    }
                }
            });


            
    },
    getVariables: function () {
        return getVariables();
    },
    getVariable: function (variable) {
        return findVariable(getVariables(), variable);
    },
    updateVariable: async function (name, value, type) {
        return await updateVariable(name, value, type);
    },

    addVariable: function (name, type, value, auto = true) {
        //createToken(name, value, type);
        return updateVariable(name, value !== undefined && value !== null ? value :
            type === "string" ? "" :
                type === "boolean" ? false :
                    type === "number" ? 0 :
                        type === "trigger" ? -1 :
                            null,
            type, false, auto);//, value,, undefined, auto);
    },
    removeVariable: function (name) {
        return updateVariable(name, null, null, true);
    },
    retrieveVariables: (query, args, type) => {
        let AllTypesVariables = variableManager.getVariables();
        let allVariables = type == 'any' ? AllTypesVariables.filter(util.contains(query)) : AllTypesVariables.filter(util.filterVariable(query, type));// variableManager.getVariables();
        let l = allVariables.filter(util.contains(query));
        let added = false;
        //if (type != 'any' && query && query.length && !AllTypesVariables.find(x => x.name.toLowerCase() === ('' || query).toLowerCase())) {
        if (query && query.length && !AllTypesVariables.find(x => x.name.toLowerCase() === ('' || query).toLowerCase())) {
            l.unshift({ name: query, type: type, description: 'Create new ' + type });
            added = true;
        }

        //if (type != 'any' && lastQuery[type] && lastQuery[type].length && !query.startsWith(lastQuery[type]) && !l.find(x => x.name.toLowerCase() === ('' || lastQuery[type]).toLowerCase()) && !AllTypesVariables.find(x => x.name.toLowerCase() === ('' || lastQuery[type]).toLowerCase())) {
        if (lastQuery[type] && lastQuery[type].length && !query.startsWith(lastQuery[type]) && !l.find(x => x.name.toLowerCase() === ('' || lastQuery[type]).toLowerCase()) && !AllTypesVariables.find(x => x.name.toLowerCase() === ('' || lastQuery[type]).toLowerCase())) {
            let a = { name: lastQuery[type], type: type, description: 'Just added' };
            if (added) l.splice(1, 0, a);
            else l.unshift(a);
        }
        if (query && query.length) lastQuery[type] = query;

        return l;
    }
};




async function updateVariable(name, value, type, remove = false, auto = false) {
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
    if (auto) newVariable.auto = true;
    if (oldVariable && oldVariable.auto && !auto) newVariable.auto = true;

    if (!remove) {
        variables.unshift(newVariable);
        homey.api.realtime('variable_changed', { variable: newVariable, date: BL.datetime.toString('datetime', newVariable.lastChanged) });
    } else {
        oldVariable.remove = true;
        homey.api.realtime('variable_changed', { variable: oldVariable, date: BL.datetime.toString('datetime', oldVariable.lastChanged) });
    }

    return await processValueChanged(variables, oldVariable, newVariable);
}

async function notify(tag, error) {
    try {
        await homey.notifications.createNotification({ excerpt: tag + (error.message || error) });//.then(()=>{}).catch(()=>{});
    } catch (errorInner) { }
}

function findVariable(variables, variable) {
    return variables.filter(function (item) {
        return item.name === variable;
    })[0];
}
async function processValueChanged(variables, oldVariable, newVariable) {
    homey.settings.set('variables', variables);

    if (newVariable && newVariable.remove) {
        removeInsights(newVariable.name).catch(error => notify(`Error while removing insights for variable ${newVariable.name}: `, error));
        removeToken(newVariable.name).catch(error => notify(`Error while removing token for variable ${newVariable.name}: `, error));
        return;
    }

    if (newVariable && !oldVariable) {
        await createOrUpdateInsights(newVariable.name, newVariable.value, newVariable.type).catch(error => notify(`Error while creating insights for new variable ${newVariable.name}: `, error));
        await createToken(newVariable.name, newVariable.value, newVariable.type).catch(error => notify(`Error while creating token for new variable ${newVariable.name}: `, error));
    }

    if (newVariable && oldVariable && oldVariable.value !== newVariable.value) {
        try {
            await createOrUpdateInsights(newVariable.name, newVariable.value, newVariable.type).catch(error=>notify(`Error while updating insights for variable ${newVariable.name}: `, error));
            await updateToken(newVariable.name, newVariable.value).catch(error=>notify(`Error while updating token for variable ${newVariable.name}: `, error));;;;

            getTrigger('if_variable_changed').trigger({ "variable": newVariable.name, "value": newVariable.value }, newVariable).catch(error=>notify(`Error triggering if_variable_changed for variable ${newVariable.name}: `, error));
            getTrigger('debug_any_variable_changed').trigger({ "variable": newVariable.name, "value": newVariable.value }, newVariable).catch(error=>notify(`Error triggering debug_any_variable_changed for variable ${newVariable.name}: `, error));
            getTrigger('if_one_of_variable_changed').trigger({ "variable": newVariable.name, "value": newVariable.value }, newVariable).catch(error=>notify(`Error triggering if_one_of_variable_changed for variable ${newVariable.name}: `, error));
            let tokens = { variableName: newVariable.name, variableType: newVariable.type, variableValueString: '', variableValueNumber: 0, variableValueBoolean: false };
            switch (newVariable.type) {
                case "string": tokens.variableValueString = newVariable.value; break;
                case "number": tokens.variableValueNumber = newVariable.value; break;
                case "boolean": tokens.variableValueBoolean = newVariable.value; break;
                case "trigger": tokens.variableValueString = newVariable.value; break;
            }
            getTrigger('any_variable_changed').trigger(tokens, newVariable).catch(error=>notify(`Error triggering any_variable_changed for variable ${newVariable.name}: `, error));
        } catch (error) {
            try {
                await homey.notifications.createNotification({ excerpt: `Error while updating changed variable ${newVariable.name}:` + (error.message || error) });
            } catch (errorInner) { }
        }

    }

    if (newVariable && newVariable.type == 'boolean') {
        homey.settings.set('boolValueChanged', newVariable);
    }

    if (newVariable && newVariable.type == 'number') {
        homey.settings.set('numValueChanged', newVariable);
        getTrigger('if_number_variable_changed').trigger({ "variable": newVariable.name, "value": newVariable.value }, { oldVariable: oldVariable, newVariable: newVariable }).catch(error=>notify(`Error triggering if_number_variable_changed for variable ${newVariable.name}: `, error));
    }

    if (newVariable) {
        getTrigger('if_variable_set').trigger({ "variable": newVariable.name, "value": newVariable.value }, newVariable).catch(error=>notify(`Error triggering if_variable_set for variable ${newVariable.name}: `, error));
    }
}

function getTrigger(name) {
    return homey.flow.getTriggerCard(name);
}

async function createOrUpdateInsights(name, value, type) {
    // no insights for string
    if (type == 'string' || type == 'trigger' || type == 'boolean') {
        return;
    }

    let log;
    try {
        log = await homey.insights.getLog(name);
        console.log("else createEntry  > " + value);
    } catch (e) {
        try {
            log = await homey.insights.createLog(name, GetInsightOptions(name, type));
            console.log("if createLog > createEntry > " + value);
        } catch (error) {
            console.log("if createLog > createEntry > " + value + " -- ERROR ");
            homey.error(error);
        }
    }

    try {
        if (log) await log.createEntry(value);
    } catch (err) {
        console.log(err);
    }
}

function GetInsightOptions(name, type) {
    if (type == 'number') {
        return {
            title: { en: name },
            type: 'number',
            units: { en: 'Value' },
            decimals: 2,
            chart: 'stepLine'
        };
    }
    else if (type == 'boolean') {
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

async function removeInsights(name) {
    try {
        let log = await homey.insights.getLog(name);
        return await homey.insights.deleteLog(log);
    } catch (error) {
        console.log('ERROR removeInsights: ' + error.toString());

    }
}

function deleteAllTokens() {
    for (var i = tokens.length - 1; i >= 0; i--) {
        tokens[i].unregister().then(() => { }).catch(err => { console.log(err); });
        tokens.splice(i, 1);
    }
}

async function createToken(name, value, type) {
    if (type !== 'trigger') {
        let token;
        try {
            token = await homey.flow.getToken(name);
            if (!BL._.find(tokens => x.name == token.name)) tokens.push(token);
        } catch (error) {

        }
        try {
            if (!token) {
                token = await homey.flow.createToken(name, { type: type, title: name });
                tokens.push(token);
            }
        } catch (error) {
            homey.error('homey.flow.createToken', error);
            token = BL._.find(tokens, t => t.name === name);
        }
        try {
            if (token) return await token.setValue(value);
        } catch (error) {
            homey.error('value: ', value);
            homey.error(error);
        }

    }
}

async function removeToken(name) {
    for (var i = tokens.length - 1; i >= 0; i--) {
        if (tokens[i].id === name) {
            let t = tokens[i];            
            tokens.splice(i, 1);
            await t.unregister();
        }
    }
}

async function updateToken(name, value) {
    for (var i = tokens.length - 1; i >= 0; i--) {
        if (tokens[i].id === name) {
            try {
                await tokens[i].setValue(value);
            } catch (error) {
                homey.error('value: value', value);
                homey.error(error);
                throw error;
            }
        }
    }
}

function getShortDate() {
    return new Date().toISOString();
}

function getVariables() {
    var varCollection = homey.settings.get('variables');

    if (!Array.isArray(varCollection)) {
        console.log('varCollection is not array');
        return [];
    }

    if (!varCollection || varCollection === undefined) {
        return [];
    }
    return varCollection;
}
