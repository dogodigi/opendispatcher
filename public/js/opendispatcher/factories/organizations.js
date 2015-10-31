(function() {
  'use strict';
  angular
    .module('opendispatcher.factories')
    .factory('OrganizationsFactory', OrganizationsFactory);

  function OrganizationsFactory($resource) {
    return $resource('/new/api/organizations', {}, {
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
