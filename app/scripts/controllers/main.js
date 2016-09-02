'use strict';

angular.module('webdrivercssAdminpanelApp').controller('MainCtrl', function ($scope, repositories, $routeParams) {
    function repositoriesEndpoint() {
      var protocol = document.location.protocol;
      var hostname = document.location.hostname;
      var port = document.location.port;
      var url = port ? hostname + ':' + port : hostname;

      return protocol + '//' + url + '/api/repositories/';
    }

    $scope.repositories = repositories;
    $scope.project = $routeParams.id;
    $scope.noReposFound = Object.keys($scope.repositories).length === 0;

    $scope.diffs = [];
    $scope.shots = [];
    $scope.api = repositoriesEndpoint();

    if($routeParams.id && Object.keys(repositories).length) {
        $scope.dir   = $routeParams.id;
        $scope.diffs = repositories[$routeParams.id].diffs;
        $scope.shots = repositories[$routeParams.id].images;
    }

    angular.forEach($scope.diffs, function(diff) {
        $scope.shots.splice($scope.shots.indexOf(diff.replace(/diff/,'regression')),1);
        $scope.shots.splice($scope.shots.indexOf(diff.replace(/diff/,'baseline')),1);
    });

});
