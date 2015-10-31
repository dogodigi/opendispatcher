angular
  .module('opendispatcher.controllers')
  .controller('NavigationController', NavigationController);

function NavigationController($scope, $location) {
  $scope.isActive = function(viewLocation) {
    return viewLocation === $location.path();
  };
}
