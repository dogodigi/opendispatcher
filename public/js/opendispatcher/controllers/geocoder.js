angular
  .module('opendispatcher.controllers')
  .value('searchprovider', 'mapzen')
  .controller('GeocoderController', GeocoderController);

function GeocoderController($scope, GoogleGeocoderFactory, NominatimGeocoderFactory, MapzenGeocoderFactory, searchprovider) {
  $scope.selected = undefined;
  $scope.getLocation = function(val) {
    switch (searchprovider) {
      case "nominatim":
        return NominatimGeocoderFactory.search({
            format: 'json',
            addressdetails: 1,
            q: val,
            email:'info@opendispatcher.org'
          })
          .$promise.then(function(response) {
            return response.map(function(item) {
              return item.display_name;
            });
          });
      case "mapzen":
        return MapzenGeocoderFactory.autocomplete({
            format: 'json',
            addressdetails: 1,
            text: val
          })
          .$promise.then(function(response) {
            return response.map(function(item) {
              return item.properties.label;
            });
          });
      default:
        return GoogleGeocoderFactory.search({
            address: val,
            sensor: false
          })
          .$promise.then(function(response) {
            return response.results.map(function(item) {
              return item.formatted_address;
            });
          });
    }
  };
}
