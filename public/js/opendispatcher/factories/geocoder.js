angular
  .module('opendispatcher.factories')
  .factory('GoogleGeocoderFactory', GoogleGeocoderFactory)
  .factory('NominatimGeocoderFactory', NominatimGeocoderFactory)
  .factory('MapzenGeocoderFactory', MapzenGeocoderFactory);

function GoogleGeocoderFactory($resource) {
  return $resource('//maps.googleapis.com/maps/api/geocode/json', {}, {
    search: {
      method: 'GET',
    }
  });
}
function NominatimGeocoderFactory($resource) {
  return $resource('/nominatim/', {}, {
    search: {
      method: 'GET',
      isArray: true
    }
  });
}
function MapzenGeocoderFactory($resource) {
  return $resource('/mapzen/', {}, {
    autocomplete: {
      method: 'GET',
      isArray: true
    },
    search: {
      method: 'GET',
      isArray: true
    }
  });
}
