'use strict';

angular.module('webdrivercssAdminpanelApp').controller('MainCtrl', function($scope, $http) {
    $http.get('/api/awesomeThings').success(function(awesomeThings) {
        $scope.awesomeThings = awesomeThings;
    });
});
