(function() {
  'use strict';
  angular
    .module('opendispatcher.services')
    .service('SitesService', SitesService);

  function SitesService() {
    var sites = {};
    this.get = function() {
      $http.get('api/features.json').success(function(data) {
        $scope.geojson.data = data;
      });
    };
  }
}());
