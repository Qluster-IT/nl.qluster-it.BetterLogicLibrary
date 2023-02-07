angular.module('variableApp', ['smart-table', 'bll', 'ui.codemirror'])
    .controller('VariableSettingsController', ['$scope', 'bl', function($scope, bl) {
        //console.log(homeyTools);

        var vm = this;
        vm.errorMessage = '';
        vm.showExportToggle = false;
        vm.showImportToggle = false;
        vm.importJson = '';
        vm.selected = {};
        //vm.homey;
        //console.log(window.HT);

        $scope.view = {id:undefined, bottom:undefined};
        const temp = $scope.temp = {dateFormats:{}};
        const vars = $scope.vars = {
            locales: [],
            locale:{
                default:'en'
            },
            moduleExampleValue:'The last one is: {[ _.last(["1", "2"]) ]}.',
            moduleExampleResult:'The last one is 2.',
            dateExampleValue:'Today is a {[ date("dddd") ]}',
            dateExampleResult:'Today is a donderdag',
            datesExampleValue:undefined,
            datesExampleResult:{"DATETIMELONG":"donderdag 10 november 2022 om 13:53:48 Midden-Europese standaardtijd","DATETIME":"10 november 2022 om 13:53:48 CET","datetime":"10 nov. 2022 13:53:48","datetimeshort":"10-11-2022 13:53","DATELONG":"donderdag 10 november 2022","DATE":"10 november 2022","date":"10 nov. 2022","dateshort":"10-11-2022","TIMELONG":"13:53:48 Midden-Europese standaardtijd","TIME":"13:53:48 CET","time":"13:53:48","timeshort":"13:53","yy":"22","yyyy":"2022","M":"11","MM":"11","MMM":"nov.","MMMM":"november","d":"10","dd":"10","ddd":"do","dddd":"donderdag","H":"13","HH":"13","m":"53","mm":"53","s":"48","ss":"48","f":"8","ff":"89","fff":"898","PERIOD":"’s middags","period":"’s middags","ERA":"na Christus","era":"n.Chr."},

            dateOptions : [
                {
                    id:'Date & Time',
                    formats:['DATETIMELONG', 'DATETIME', 'datetime', 'datetimeshort']
                },
                {
                    id:'Date',
                    formats:['DATELONG', 'DATE', 'date', 'dateshort']
                },
                {
                    id:'Time',
                    formats:['TIMELONG', 'TIME', 'time', 'timeshort']
                },
                {
                    id:'Year',
                    formats:['yy', 'yyyy']
                },
                {
                    id:'Month',
                    formats:['M', 'MM', 'MMM', 'MMMM']
                },
                {
                    id:'Day',
                    formats:['d', 'dd', 'ddd', 'dddd']
                },                
                {
                    id:'Hour',
                    formats:['H', 'HH']
                },              
                {
                    id:'Hour 12-hour cycle',
                    formats:['h', 'hh', 'tt']
                },
                {
                    id:'Minute',
                    formats:['m', 'mm']
                },
                {
                    id:'Second',
                    formats:['s', 'ss']
                },
                {
                    id:'Fractional second',
                    formats:['f', 'ff', 'fff']
                },
                {
                    id:'TimeZone',
                    formats:['KK', 'kk']
                },
                {
                    id:'Other',
                    formats:['PERIOD', 'period', 'ERA', 'era', 'ISO', 'dd "text" yy', '""']
                }
            ],
            formats :undefined


        };
        vars.datesExampleValue = _.flatMap(vars.dateOptions, 'formats');
        vars.dateFormats = _.filter(vars.dateOptions, (v,i)=>i<=2);
        $scope.editorOptions = getEditorOptions();
        
        $scope.updateModuleExample = async function() {
            await bl.api("POST", "/decode", {text:vars.moduleExampleValue}, (x)=> vars.moduleExampleResult = x);
        };

        $scope.updateDateExample = async function() {
            await bl.api("POST", "/decode", {text:vars.dateExampleValue}, (x)=> vars.dateExampleResult = x);
        };
        
        $scope.updateDatesExample = async function() {
            await bl.api("POST", "/date", {format:vars.datesExampleValue}, (x)=> vars.datesExampleResult = x);
        };
        $scope.setFormatExample = async function(format) {
            if(!vars.locale.dateFormats[format] || !vars.locale.dateFormats[format].length) temp.dateFormats[format] = undefined;
            else await bl.api("POST", "/date", {format:vars.locale.dateFormats[format]}, (x)=> temp.dateFormats[format] = x);
        };
        
        $scope.setCustomFormat = async function(format) {
            if(!format.name || !format.format) temp.dateFormats[format.format] = undefined;
            else await bl.api("POST", "/date", {format:format.format}, (x)=> temp.dateFormats[format.format] = x);
        };

        $scope.setLocale = async function() {
            console.log(JSON.stringify(vars.locale.dateFormats));
            for (const formatKey in vars.locale.dateFormats) {
                if (Object.hasOwnProperty.call(vars.locale.dateFormats, formatKey)) {
                    const format = vars.locale.dateFormats[formatKey];
                    if(!format || !format.length) delete vars.locale.dateFormats[formatKey];
                }
            }
            await bl.set('locale', vars.locale, ()=> {
                $scope.updateExamples();
                let dates = _.uniqBy(_.flatMap(vm.variables, 'lastChanged'));
                bl.api("POST", "/date", {date:dates, format:'datetime'}, (x)=> vars.variableDates = x);
            });
        };

        $scope.updateExamples = function() {
            $scope.updateModuleExample();
            $scope.updateDateExample();
            $scope.updateDatesExample();
        };
        $scope.addCustomFormat = function() {
            if(!vars.locale.customDateFormats) vars.locale.customDateFormats = [];
            vars.locale.customDateFormats.push({name:'', format:''});
        };

        $scope.removeCustomFormat = function(index) {
            if(vars.locale.customDateFormats) vars.locale.customDateFormats.splice(index,1);
        };



        $scope.getFunctionFromSettings = function () {
            vm.homey.get('javascript_functions', (err, newFunctions) => {
                if (!err && !newFunctions) {
                    newFunctions = [];
                }
                $scope.$apply(() => {
                    $scope.functions = newFunctions;
                    $scope.messages = err;
                });
            });
        };

        $scope.savefunctions = function () {
            vm.homey.set('javascript_functions', $scope.functions);
            vm.homey.alert(vm.homey.__("settings.functions_saved") || 'Functions saved');
        };

        $scope.addFunction = function () {
            try {
                console.log('addFunction');
                if ($scope.functions && $scope.functions.filter(function (e) { return e.name == $scope.newFunction.name; }).length > 0) {
                    $scope.messages = vm.homey.__("settings.function_exists") || "Function already exists.";
                    return;
                }

                var func = {
                    name: $scope.newFunction.name,
                    value: "function() {\r\n\t\r\n}",
                    remove: false
                };
                $scope.functions.push(func);
                $scope.storeFunction();
                $scope.messages = '';
                $scope.newFunction = {};
                console.log('addFunction done');
            } catch (error) {
                console.log('addFunction error: ' + error);
                $scope.messages = error;
                //$scope.messages = JSON.stringify($scope.functions) + '\r\n\r\n' +  JSON.stringify($scope.newFunction) ;
            }
        };
        $scope.deleteAll = function () {
            vm.homey.confirm(vm.homey.__("settings.delete_all_confirm") || 'Are you sure you wish to delete ALL functions?',  'warning', function (err, val) {
                if(err) return vm.homey.alert(err);
                if(!val) return;
                $scope.$apply(function () {
                    $scope.functions = [];
                    $scope.storeFunction();
                });
            });
        };
        $scope.removeFunction = function (row) {
            vm.homey.confirm(vm.homey.__("settings.delete_confirm", { functionName: row.name }) || ('Are you sure you wish to delete function ' + row.name + '?'),  'warning', function (err, val) {
                if(err) return vm.homey.alert(err);
                if(!val) return;
                var index = $scope.functions.indexOf(row);
                $scope.$apply(function () {
                    $scope.functions.splice(index, 1);
                    $scope.storeFunction();
                });
            });
        };
        $scope.editFunction = function (row) {
            $scope.editFunctionItem = row;
        };
        $scope.saveActiveFunction = function (close) {
            $scope.storeFunction();
            if (close) $scope.editFunctionItem = null;
        };

        $scope.storeFunction = function () {
            vm.homey.set('javascript_functions', angular.copy($scope.functions));
        };




        vm.init = function(homey, scope) {
            vm.homey = homey;
            bl.init(homey, $scope);
            bl.get("locale", (x)=> {
                vars.locale = x;
                if(x && !x.dateFormats) x.dateFormats={};
            });
            bl.api("GET", "/locales", null, (x)=> vars.locales = x );

            $scope.updateExamples();
            $scope.getFunctionFromSettings();

            
            loadVariables();
            vm.homey.on('setting_changed', function (name) {
                console.log(name);
                loadVariables();
            });

            function loadVariables() {
                vm.homey.get('variables', function(err, newVariables) {
                    console.log(newVariables);
    
                    if (!newVariables) {
                        newVariables = [];
                    }
                    let dates = _.uniqBy(_.flatMap(newVariables, 'lastChanged'));
                    bl.api("POST", "/date", {date:dates, format:'datetime'}, (x)=> vars.variableDates = x);
    
                    scope.$apply(function() {
                        vm.variables = newVariables;
                    });
                });
            }
            $scope.updateDateExample();
            $scope.updateDatesExample();
        };
        vm.addVariable = function() {
            if (vm.variables && vm.variables.filter(function(e) { return e.name == vm.newVariable.name; }).length > 0) {
                vm.errorMessage = "Variable does already exist in database.";
                return;
            }
            var variable = {
                name: vm.newVariable.name,
                type: vm.newVariable.type,
                value: vm.newVariable.value,
                lastChanged: getShortDate(),
                remove: false
            };
            vm.variables.push(variable);
            storeVariable(variable);
            vm.errorMessage = '';
            vm.newVariable = {};
        };
        vm.deleteAll = function() {
            vm.homey.confirm('Are you sure you wish to delete ALL variables?', 'warning', function(err, val) {
                if(err) return vm.homey.alert(err);
                if(val) $scope.$apply(()=> {
                    vm.homey.set('variables',[] );
                    vm.variables = [];
                });
                
            });
        };
        vm.removeVariable = function(row) {
            var index = vm.variables.indexOf(row);
            var toDeleteVariable = vm.variables[index];

            if(!toDeleteVariable) return;
            vm.homey.confirm(`Are you sure you wish to delete the variable ${toDeleteVariable.name}?`, 'warning', function (err, val) {
                if(err) return vm.homey.alert(err);
                if(val) $scope.$apply(()=> {
                    toDeleteVariable.remove = true;
                    vm.variables.splice(index, 1);
                    storeVariable(toDeleteVariable);
                });
            });
        };

        vm.showExport = function() {
            vm.showExportToggle = !vm.showExportToggle;
        };
        vm.showImport = function() {
            vm.showImportToggle = !vm.showImportToggle;
        };

        vm.import = function() {
            var newVars = angular.fromJson(vm.importJson);
            vm.deleteAll();
            newVars.forEach(function(variable) {
                storeVariable(variable);
            });
            vm.variables = newVars;
        };

        vm.editVariable = function(variable) {
            vm.selected = angular.copy(variable);
        };

        vm.saveVariable = function(row) {
            vm.selected.lastChanged = getShortDate();
            var index = vm.variables.indexOf(row);
            var indexDisplay = $scope.displayedCollection.indexOf(row);
            vm.variables[index] = angular.copy(vm.selected);
            $scope.displayedCollection[indexDisplay] = angular.copy(vm.selected);
            storeVariable(vm.selected);
            vm.reset();
        };

        vm.triggerVariable = function(row) {
            vm.selected = angular.copy(row);
            vm.selected.lastChanged = getShortDate();
            vm.selected.value = getShortDate();

            var index = vm.variables.indexOf(row);
            var indexDisplay = $scope.displayedCollection.indexOf(row);

            vm.variables[index] = angular.copy(vm.selected);
            $scope.displayedCollection[indexDisplay] = angular.copy(vm.selected);
            storeVariable(vm.selected);
            vm.reset();
        };

        vm.reset = function() {
            vm.selected = {};
        };

        vm.selectUpdate = function(type) {
            if (type === 'boolean') {
                vm.newVariable.value = false;
                return;
            }
            if (type === 'number') {
                vm.newVariable.value = 0;
                return;
            }
            vm.newVariable.value = '';
            return;
        }

        vm.getTemplate = function(variable) {
            if (variable.name === vm.selected.name && variable.type === vm.selected.type) return 'edit';
            else return 'display';
        };

        function storeVariable(variable) {
            var changeObject = {
                variable: variable
            };
            vm.homey.set('changedvariables', changeObject, function (err) { console.log(err)});
        }

        function deleteAllVariables() {
            //I need to pass in this dummy or else it does not work....?
            var dummyVar = {
                name: "",
                type: "",
                value: "",
                lastChanged: getShortDate(),
                remove: false
            };
            var dummyChangedObject = {
                variable: dummyVar
            };

            vm.homey.set('deleteall', dummyChangedObject, function (err) { console.log(err)});            
        }

        
    function getEditorOptions() {
        
        var r = {
            //hintOptions: {
            //    tables: {
            //        users: ["name", "score", "birthDate"],
            //        countries: ["name", "population", "size"]
            //    }
            //},
            autoCloseBrackets:true,
            lineWrapping: true,
            lineNumbers: true,
            //readOnly: 'nocursor',
            mode: 'javascript',//'sql',
            autoRefresh: true,
            theme: 'mdn-like',
            scrollbarStyle: "simple",

            indentWithTabs: true,
            smartIndent: true,
            matchBrackets: true,
            autofocus: true,
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],

            extraKeys: {
                "F11": function (cm) {
                    cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                },
                "Esc": function (cm) {
                    if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                },
                "Ctrl-Space": "autocomplete",
                "Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }
            }
        };
        return r;
    }

    }]);

function getShortDate() {
    return new Date().toISOString();
}

function setVariables(variables) {}