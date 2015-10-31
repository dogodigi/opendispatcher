(function() {
  'use strict';
  angular
    .module('opendispatcher.controllers')
    .controller('OrganizationController', OrganizationController);

  function OrganizationController($scope, $state, organization, leafletData) {
    if (organization) {
      $scope.organization = organization;
      if (organization.Region) {
        leafletData.getMap().then(function(map) {
          map.fitBounds(L.geoJson($scope.organization.Region.data).getBounds());
        });
      }
    }
    $scope.cancel = function() {
      $state.go('sites');
    };
  }
}());
