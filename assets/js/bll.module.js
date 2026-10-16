const blModule = angular.module('bll', []);
blModule.factory('$bl', ['$q', function ($q) {
    let Homey;
    let $scope;
    let defer = $q.defer();

    let factory = {
        init,
        api,
        get,
        set,
        error,
        openURL,
        __,
        ready: defer.promise
    };
    return factory;

    function init(homey, scope) {
        Homey = homey;
        $scope = scope;
        factory.homey = homey;
        defer.resolve();
    }

    function __(str, objs) {
        return Homey.__(...arguments);
    }
    function api(type, path, data, callback) {
        let defer = $q.defer();
        Homey.api(type, path, data, (err, val) => {
            if (err) {
                $scope.$apply(() => {
                    defer.reject(err);
                    return Homey.alert(err);
                });
            }
            $scope.$apply(() => {
                if (callback) callback(val);
                defer.resolve(val);
            });
        });
        return defer.promise;
    }

    function get(settingName, callback) {
        let defer = $q.defer();
        Homey.get(settingName, (err, val) => {
            if (err) {
                $scope.$apply(() => {
                    defer.reject(err);
                    return Homey.alert(err);
                });
            }
            else $scope.$apply(() => {
                if (callback) callback(val);
                defer.resolve(val);
            });
        });
        return defer.promise;
    }

    function set(settingName, value, callback) {
        let defer = $q.defer();
        Homey.set(settingName, value, (err, val) => {
            if (err) {
                $scope.$apply(() => {
                    defer.reject(err);
                    return Homey.alert(err);
                });
            }
            $scope.$apply(() => {
                if (callback) callback(val);
                defer.resolve(val);
            });
        });
        return defer.promise;
    }
    function error(err) {
        if (Homey.hideLoadingOverlay) Homey.hideLoadingOverlay();
        Homey.alert(err, 'error');
        return;
    }
    function openURL(url) {
        return Homey.openURL(url);
    }
}]);

blModule.directive('blHref', function () {
    return function (scope, element, attrs) {
        element.attr('href', '#');
        element.bind('click', function (event) {
            Homey.openURL(attrs.blHref);
        });
    };
});
blModule.filter('__', ['$bl', function ($bl) {
    //let ready = false;
    let strings = {};
    let fn = function (input) {
        if(!$bl.homey) return '...';
        //console.log(1);

        if(!strings[input]) strings[input] = $bl.homey.__(input);
        return strings[input];
    };
    //fn.$stateful = true;
    
    //$bl.ready.then(()=>(ready=true) & (fn.$stateful=false) );
        
    return fn;

}]);

blModule.directive('blTranslate', ['$bl', function ($bl) {
    return {
        restrict: 'A',
        replace: true,        
        link: function compile(scope, element, attrs, controller) {
            let html = attrs.blTranslate || element.html();
            html = $bl.homey.__(html) || html;            
            element.html(html);
        
        }
    };
}]);

blModule.directive('ngIgnoreDirty', [function() {
    return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$setPristine = function() {};
      ctrl.$pristine = false;
    }
  }
}]);