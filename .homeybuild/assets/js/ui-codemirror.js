//'use strict';

/**
 * Binds a CodeMirror widget to a <textarea> element.
 */
angular.module('ui.codemirror', [])
    .constant('uiCodemirrorConfig', {})
    .directive('uiCodemirror', uiCodemirrorDirective);

/**
 * @ngInject
 */
function uiCodemirrorDirective($timeout, uiCodemirrorConfig) {

    return {
        restrict: 'EA',
        require: '?ngModel',
        compile: function compile() {

            // Require CodeMirror
            if (angular.isUndefined(window.CodeMirror)) {
                throw new Error('ui-codemirror needs CodeMirror to work... (o rly?)');
            }

            return postLink;
        }
    };

    function postLink(scope, iElement, iAttrs, ngModel) {

        var codemirrorOptions = angular.extend(
            { value: iElement.text() },
            uiCodemirrorConfig.codemirror || {},
            scope.$eval(iAttrs.uiCodemirror),
            scope.$eval(iAttrs.uiCodemirrorOpts)
        );

        var codemirror = newCodemirrorEditor(iElement, codemirrorOptions);

        configOptionsWatcher(
            codemirror,
            iAttrs.uiCodemirror || iAttrs.uiCodemirrorOpts,
            scope
        );

        configNgModelLink(codemirror, ngModel, scope);

        configUiRefreshAttribute(codemirror, iAttrs.uiRefresh, scope);

        // Allow access to the CodeMirror instance through a broadcasted event
        // eg: $broadcast('CodeMirror', function(cm){...});
        scope.$on('CodeMirror', function (event, callback) {
            if (angular.isFunction(callback)) {
                callback(codemirror);
            } else {
                throw new Error('the CodeMirror event requires a callback function');
            }
        });

        // onLoad callback
        if (angular.isFunction(codemirrorOptions.onLoad)) {
            codemirrorOptions.onLoad(codemirror);
        }
    }

    function newCodemirrorEditor(iElement, codemirrorOptions) {
        var codemirrot;

        if (iElement[0].tagName === 'TEXTAREA') {
            // Might bug but still ...
            codemirrot = window.CodeMirror.fromTextArea(iElement[0], codemirrorOptions);
        } else {
            iElement.html('');
            codemirrot = new window.CodeMirror(function (cm_el) {
                iElement.append(cm_el);
            }, codemirrorOptions);
        }

        return codemirrot;
    }

    function configOptionsWatcher(codemirrot, uiCodemirrorAttr, scope) {
        if (!uiCodemirrorAttr) { return; }

        var codemirrorDefaultsKeys = Object.keys(window.CodeMirror.defaults);
        scope.$watch(uiCodemirrorAttr, updateOptions, true);
        function updateOptions(newValues, oldValue) {
            if (!angular.isObject(newValues)) { return; }
            codemirrorDefaultsKeys.forEach(function (key) {
                if (newValues.hasOwnProperty(key)) {

                    if (oldValue && newValues[key] === oldValue[key]) {
                        return;
                    }

                    codemirrot.setOption(key, newValues[key]);
                }
            });
        }
    }

    function configNgModelLink(codemirror, ngModel, scope) {
        if (!ngModel) { return; }
        // CodeMirror expects a string, so make sure it gets one.
        // This does not change the model.
        ngModel.$formatters.push(function (value) {
            if (angular.isUndefined(value) || value === null) {
                return '';
            } else if (angular.isObject(value) || angular.isArray(value)) {
                throw new Error('ui-codemirror cannot use an object or an array as a model');
            }
            return value;
        });


        // Override the ngModelController $render method, which is what gets called when the model is updated.
        // This takes care of the synchronizing the codeMirror element with the underlying model, in the case that it is changed by something else.
        ngModel.$render = function () {
            //Code mirror expects a string so make sure it gets one
            //Although the formatter have already done this, it can be possible that another formatter returns undefined (for example the required directive)
            var safeViewValue = ngModel.$viewValue || '';
            codemirror.setValue(safeViewValue);
        };


        // Keep the ngModel in sync with changes from CodeMirror
        codemirror.on('change', function (instance) {
            var newValue = instance.getValue();
            if (newValue !== ngModel.$viewValue) {
                scope.$evalAsync(function () {
                    ngModel.$setViewValue(newValue);
                });
            }
        });
        var ExcludedIntelliSenseTriggerKeys =
        {
            "8": "backspace",
            "9": "tab",
            "13": "enter",
            "16": "shift",
            "17": "ctrl",
            "18": "alt",
            "19": "pause",
            "20": "capslock",
            "27": "escape",
            "33": "pageup",
            "34": "pagedown",
            "35": "end",
            "36": "home",
            "37": "left",
            "38": "up",
            "39": "right",
            "40": "down",
            "45": "insert",
            "46": "delete",
            "91": "left window key",
            "92": "right window key",
            "93": "select",
            "107": "add",
            "109": "subtract",
            "110": "decimal point",
            "111": "divide",
            "112": "f1",
            "113": "f2",
            "114": "f3",
            "115": "f4",
            "116": "f5",
            "117": "f6",
            "118": "f7",
            "119": "f8",
            "120": "f9",
            "121": "f10",
            "122": "f11",
            "123": "f12",
            "144": "numlock",
            "145": "scrolllock",
            "186": "semicolon",
            "187": "equalsign",
            "188": "comma",
            "189": "dash",
            "190": "period",
            "191": "slash",
            "192": "graveaccent",
            "220": "backslash",
            "222": "quote"
        }

        codemirror.on("keyup", function (cm, event) {
            if (!cm.state.completionActive && /*Enables keyboard navigation in autocomplete list*/
                !ExcludedIntelliSenseTriggerKeys[(event.keyCode || event.which).toString()]) {        /*Enter - do not open autocomplete list just after item has been selected in it*/
                CodeMirror.commands.autocomplete(cm, null, { completeSingle: false });
            }
        });
    }

    function configUiRefreshAttribute(codeMirror, uiRefreshAttr, scope) {
        if (!uiRefreshAttr) { return; }

        scope.$watch(uiRefreshAttr, function (newVal, oldVal) {
            // Skip the initial watch firing
            if (newVal !== oldVal) {
                $timeout(function () {
                    codeMirror.refresh();
                });
            }
        });
    }

}