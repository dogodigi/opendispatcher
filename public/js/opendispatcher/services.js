(function () {
  'use strict';
  var services = angular.module('opendispatcher.services', ['ngResource']);

  // Application Services
  services.factory('HazardsFactory', function ($resource) {
    return $resource('/new/api/site/:id/hazards', {}, {
      query: { method: 'GET', isArray: true },
      create: { method: 'POST' }
    });
  });
  services.factory('OrganizationsFactory', function ($resource) {
    return $resource('/new/api/organizations', {}, {
      query: { method: 'GET', isArray: true },
      create: { method: 'POST' }
    });
  });
  services.factory('OrganizationFactory', function ($resource) {
    return $resource('/new/api/organization/:id', {}, {
      query: { method: 'GET'},
    });
  });
  services.factory('SitesFactory', function ($resource) {
    return $resource('/new/api/sites', {}, {
      query: { method: 'GET', isArray: true },
      create: { method: 'POST' }
    });
  });
  services.factory('SiteFactory', function ($resource) {
      return $resource('/new/api/site/:id', {}, {
          show: { method: 'GET' },
          update: { method: 'PUT', params: {id: '@id', uncache: true} },
          delete: { method: 'DELETE', params: {id: '@id'} }
      });
  });

  // General Services
  services.factory('GoogleGeocoderFactory', function ($resource) {
    return $resource('//maps.googleapis.com/maps/api/geocode/json', {}, {
      search: {
        method: 'GET',
      }
    });
  });
  services.factory('NominatimGeocoderFactory', function ($resource) {
    return $resource('nominatim', {}, {
      search: {
        method: 'GET',
        isArray: true
      }
    });
  });

  // Uncache helper
  services.factory('uncacheInterceptor', function($cacheFactory) {
  	var cache = $cacheFactory.get('$http');
  	return {
  		response: function(response) {
  			// if 'uncache' is set as true
  			if (response.config.params && response.config.params.uncache) {
  				// remove the 'cached' resource
  				cache.remove(response.config.url);
  			}
  			return response;
  		}
  	};
  });
}());
