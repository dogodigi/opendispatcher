(function() {
  'use strict';
  angular
    .module('opendispatcher.factories')
    .factory('HazardsFactory', HazardsFactory);

  function HazardsFactory($resource) {
    return $resource('/new/api/site/:id/hazards', {}, {
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
