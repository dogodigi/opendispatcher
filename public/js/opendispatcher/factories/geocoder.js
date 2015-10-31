angular
  .module('opendispatcher.factories')
  .factory('GoogleGeocoderFactory', GoogleGeocoderFactory)
  .factory('NominatimGeocoderFactory', NominatimGeocoderFactory);

function GoogleGeocoderFactory($resource) {
  return $resource('//maps.googleapis.com/maps/api/geocode/json', {}, {
    search: {
      method: 'GET',
    }
  });
}

function NominatimGeocoderFactory($resource) {
  return $resource('nominatim', {}, {
    search: {
      method: 'GET',
      isArray: true
    }
  });
}
