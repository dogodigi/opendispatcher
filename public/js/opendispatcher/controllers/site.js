angular
  .module('opendispatcher.controllers')
  .controller('SiteController', SiteController);


function SiteController($scope, $state, $stateParams, SiteFactory, SitesFactory) {
  $scope.updateSite = function() {
    SiteFactory.update($scope.site);
    $state.go('sites');
  };
  $scope.cancel = function() {
    $state.go('sites');
  };
  $scope.updateAssistance = function(value) {
    $scope.boolAssistanceClass = value;
    if ($scope.site) {
      $scope.site.assistance = value;
    }
  };
  $scope.addSite = function() {
    if (!$scope.site) {
      $scope.site = {};
    }
    $scope.site.assistance = $scope.site.assistance || false;
    SitesFactory.create($scope.site);
    $state.go('sites');
  };
  // Make sure creating a New Site does not trigger show()
  if ($stateParams.id) {
    $scope.site = SiteFactory.show({
      id: $stateParams.id
    });
  }
}
