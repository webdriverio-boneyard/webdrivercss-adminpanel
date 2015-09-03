'use strict';

angular.module('webdrivercssAdminpanelApp').factory('ImageRepository', function($q, $http) {

    var deferred  = $q.defer(),
        method = 'GET',
        url = '/api/repositories';

    $http({method: method, url: url }).success(function(regression) {

        deferred.resolve(regression.repositories);

    }).error(function() {

        deferred.reject();

    });

    return deferred.promise;

});
