'use strict';

angular.module('webdrivercssAdminpanelApp').controller('MainCtrl', function($scope, $location, repositories, $routeParams) {

    function processRepositories() {
        $scope.noReposFound = Object.keys($scope.repositories).length === 0;

        if ($routeParams.id && Object.keys($scope.repositories).length) {
            $scope.dir = $routeParams.id;
            $scope.diffs = $scope.repositories[$routeParams.id].diffs;
            $scope.shots = $scope.repositories[$routeParams.id].images;
        }
    }

    $scope.noReposFound = true;

    $scope.repositories = {};

    repositories.getRepositories()
        .then(function(data) {
            $scope.repositories = data;
            processRepositories();
        });

    $scope.project = $routeParams.id;
    $scope.diffs = [];
    $scope.shots = [];

    $scope.api = document.location.protocol + '//' + document.location.hostname + ':' + document.location.port + '/api/repositories/';

    $scope.deleteRepository = function() {
        if ($scope.project) {
            if (confirm('Are you sure you want to delete ' + $scope.project)) {
                repositories.deleteRepository($scope.project)
                    .then(function() {
                        alert($scope.project + ' has been deleted.');
                        $location.path("/");
                    });
            }
        } else {
            alert('Please select a repository.');
        }
    };

    angular.forEach($scope.diffs, function(diff) {
        $scope.shots.splice($scope.shots.indexOf(diff.replace(/diff/, 'regression')), 1);
        $scope.shots.splice($scope.shots.indexOf(diff.replace(/diff/, 'baseline')), 1);
    });

})
;
