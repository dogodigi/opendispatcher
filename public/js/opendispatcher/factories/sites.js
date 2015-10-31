(function() {
  'use strict';

  angular
    .module('opendispatcher.factories')
    .factory('SitesFactory', SitesFactory);

  function SitesFactory($resource) {
    return $resource('/new/api/sites', {}, {
      query: {
        method: 'GET',
        isArray: true
      },
      create: {
        method: 'POST'
      }
    });
  }
}());
