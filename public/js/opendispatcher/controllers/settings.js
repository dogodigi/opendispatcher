angular
  .module('opendispatcher.controllers')
  .controller('SettingsController', SettingsController);

function SettingsController($scope, $uibModalInstance, organisation, overlays, baselayers) {
  $scope.organisation = organisation;
  $scope.overlays = overlays;
  $scope.baselayers = baselayers;
  $scope.toggleOverlay = function(overlay) {
    if (!overlay.visible) {
      overlay.visible = true;
      //turn the layer on
    } else {
      overlay.visible = false;
      //turn the layer off
    }
  };
  $scope.toggleBaselayer = function(baselayer) {
    if (!baselayer.visible) {
      baselayer.visible = true;
      //turn the layer on
    } else {
      baselayer.visible = false;
      //turn the layer off
    }
  };
}
