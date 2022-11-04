const BetterLogic = require('../../app.js');

exports.findVariable = function (partialWord, type) {
    return function(element) {
        return element.type === type && (!partialWord || element.name.toLowerCase().indexOf(partialWord.toLowerCase()) > -1);
    };
};

exports.filterVariable = function(partialWord, type) {
    return function(element) {
        return element.type === type && (!partialWord || element.name.toLowerCase().indexOf(partialWord.toLowerCase()) > -1 );
    };
};


exports.contains = function(partialWord) {
    return function(element) {
        return !partialWord || element.name.toLowerCase().indexOf(partialWord.toLowerCase()) > -1;
    };
};

exports.buildExpression = function (expression, homey) {
    var variableManager = require('../variablemanager.js');
    var arr = [],
        re = /(\$.*?\$)/g,
        item;

    while (item = re.exec(expression))
        arr.push(item[1]);

    arr.forEach(function (item) {
        var variableName = item.replace(/\$/g, "");
        var variable = {};
        var date = new Date();
        
        //var localDateTime = new Date(BetterLogic.sys.date);
        //let now = Date.now();
        if (variableName == 'timenow') {
            variable.value = Math.floor(Date.now() / 1000);
        }
        else if (variableName == '#timenow') {
            variable.value = Math.floor(Date.now() / 1000);
        }
        else if (variableName == '#timestamp') {
            variable.value = Date.now();
        }        
        else if (variableName == '#DD') {
            variable.value = homey.app.getNow('#DD');
        }
        else if (variableName == '#MM') {
            variable.value =  homey.app.getNow('#MM');
        }
        else if (variableName == '#YYYY') {
            variable.value =  homey.app.getNow('#YYYY');
        }
        else if (variableName == '#HH') {            
            variable.value =  homey.app.getNow('#HH');
        }
        else if (variableName == '#mm') {
            variable.value =  homey.app.getNow('#mm');
        }
        else if (variableName == '#SS') {
            variable.value = homey.app.getNow('#SS');
        }
        else {
            variable = variableManager.getVariable(variableName);
        }

        if(variable) {
          expression = expression.replace(item, variable.value);
        }
        else {
          throw new Error('Variablename ' + variableName + ' not found');
        }
    });
    return expression;
}
