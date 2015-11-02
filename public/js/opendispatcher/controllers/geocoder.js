angular
  .module('opendispatcher.controllers')
  .value('searchprovider', 'mapzen')
  .controller('GeocoderController', GeocoderController);

function GeocoderController($scope, GoogleGeocoderFactory, NominatimGeocoderFactory, MapzenGeocoderFactory, searchprovider, leafletData) {
  $scope.onSelect = function($item, $model, $label) {
    console.log($item.location);
    //zoom to item.location

    //$scope.$item = $item;
    leafletData.getMap().then(function(map) {
      map.fitBounds(L.geoJson($item.location).getBounds());
    });
    $scope.$model = $model;
    $scope.$label = $label;
  };
  $scope.getLocation = function(val) {
    switch (searchprovider) {
      case "nominatim":
        return NominatimGeocoderFactory.search({
            format: 'json',
            q: val
          })
          .$promise.then(function(response) {
            return response.map(function(item) {
              return {
                label: item.display_name,
                location: item.geojson
              };
            });
          });
      case "mapzen":
        return MapzenGeocoderFactory.autocomplete({
            format: 'json',
            text: val
          })
          .$promise.then(function(response) {
            return response.map(function(item) {
              return {
                label: item.properties.label,
                location: item.geometry
              };
            });
          });
      default:
        return GoogleGeocoderFactory.search({
            address: val,
            sensor: false
          })
          .$promise.then(function(response) {
            return response.results.map(function(item) {
              return {
                label: item.formatted_address,
                location: null
              };
            });
          });
    }
  };
}
