angular
  .module('opendispatcher.controllers')
  .controller('HazardsController', HazardsController);

function HazardsController($scope, $state, hazards) {
  $scope.hazards = hazards;
}
