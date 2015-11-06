angular
  .module('opendispatcher.factories')
  .factory('BagGeocoderFactory', BagGeocoderFactory)
  .factory('GoogleGeocoderFactory', GoogleGeocoderFactory)
  .factory('NominatimGeocoderFactory', NominatimGeocoderFactory)
  .factory('MapzenGeocoderFactory', MapzenGeocoderFactory);

function BagGeocoderFactory($resource) {
  return $resource('/api/autocomplete', {}, {
    autocomplete: {
      method: 'GET',
      isArray: true
    }
  });
}

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
