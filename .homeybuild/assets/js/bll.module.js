var app = angular.module('bll', []);
app.factory('$bl', ['$q', function($q){ 
    let Homey;
    let $scope;
    
    let factory = {
        init,
        api,
        get,
        set,
        error,
        openURL
    };
    return factory;

    function init(homey, scope) {
        Homey = homey;        
        $scope = scope;
        console.log(Homey);
    }
    function api(type, path, data, callback) {
        let defer = $q.defer();
        Homey.api(type, path, data, (err, val)=> {
            if(err) {
                $scope.$apply(()=> {
                    defer.reject(err);
                    return Homey.alert(err);
                });
            }
            $scope.$apply(()=> {
                if(callback) callback(val);
                defer.resolve(val);
            });
        });
        return defer.promise;
    }

    function get(settingName, callback) {
        let defer = $q.defer();
        Homey.get(settingName, (err, val)=> {
            if(err) {
                $scope.$apply(()=> {
                    defer.reject(err);
                    return Homey.alert(err);
                });
            } 
            else $scope.$apply(()=> {
                if(callback) callback(val);
                defer.resolve(val);
            });
        });
        return defer.promise;
    }
    
    function set(settingName, value, callback) {
        let defer = $q.defer();
        Homey.set(settingName, value, (err, val)=> {
            if(err) {
                $scope.$apply(()=> {
                    defer.reject(err);
                    return Homey.alert(err);
                });
            }
            $scope.$apply(()=> {
                if(callback) callback(val);
                defer.resolve(val);
            });
        });
        return defer.promise;
    }
    function error(err) {
        if(Homey.hideLoadingOverlay) Homey.hideLoadingOverlay();
        Homey.alert(err, 'error');
        return;
    }
    function openURL(url) {
        return Homey.openURL(url);
    }
}]);

app.directive('blHref', function () {
    return function (scope, element, attrs) {
        element.bind('click', function (event) {
            Homey.openURL(attrs.blHref);
        });
    };
});