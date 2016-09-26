'use strict';

angular.module('webdrivercssAdminpanelApp').factory('ImageRepository', function($q, $http) {

    function getRepositories() {
        var deferred = $q.defer(),
            method = 'GET',
            url = '/api/repositories';

        $http({method: method, url: url}).success(function(regression) {
            deferred.resolve(regression.repositories);
        }).error(function(e) {
            deferred.reject(e);
        });

        return deferred.promise;
    }

    function deleteRepository(file) {
        var deferred = $q.defer(),
            method = 'DELETE',
            url = '/api/repositories/' + file;

        $http({method: method, url: url}).success(function(regression) {
            deferred.resolve(regression.repositories);
        }).error(function(e) {
            deferred.reject(e);
        });

        return deferred.promise;
    }

    return {
        getRepositories: getRepositories,
        deleteRepository: deleteRepository
    }

});
