angular
  .module('opendispatcher.controllers')
  .value('searchprovider', 'google')
  .controller('GeocoderController', GeocoderController);

function GeocoderController($scope, GoogleGeocoderFactory, NominatimGeocoderFactory, searchprovider) {
  $scope.selected = undefined;
  $scope.getLocation = function(val) {
    switch (searchprovider) {
      case "nominatim":
        return NominatimGeocoderFactory.search({
            format: 'json',
            countrycodes: 'nl',
            addressdetails: 1,
            q: val
          })
          .$promise.then(function(response) {
            return response.map(function(item) {
              return item.display_name;
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
