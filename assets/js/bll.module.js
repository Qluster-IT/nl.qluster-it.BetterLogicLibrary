var app = angular.module('bll', []);
app.factory('bl', ['$q', function($q){ 
    let Homey;
    let $scope;
    
    return {
        init,
        api,
        get,
        set
    };

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
            $scope.$apply(()=> {
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
}]);

