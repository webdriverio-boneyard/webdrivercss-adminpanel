'use strict';

angular.module('webdrivercssAdminpanelApp').controller('NavbarCtrl', function($scope, $location) {
    $scope.menu = [{
        'title': 'Home',
        'link': '/'
    }];

    $scope.isActive = function(route) {
        return route === $location.path();
    };
});
