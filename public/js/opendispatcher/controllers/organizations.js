(function() {
  'use strict';
  angular
    .module('opendispatcher.controllers')
    .controller('OrganizationsController', OrganizationsController);

  function OrganizationsController($scope, $state, organizations, OrganizationsFactory) {
    $scope.organizations = organizations;
    $scope.deleteOrganization = function(organization) {
      SiteFactory.delete(organization);
      $state.reload();
    };
  }
}());
