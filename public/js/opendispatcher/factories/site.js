(function() {
  'use strict';
  angular
    .module('opendispatcher.factories')
    .factory('SiteFactory', SiteFactory);

  function SiteFactory($resource) {
    return $resource('/new/api/site/:id', {}, {
      show: {
        method: 'GET'
      },
      update: {
        method: 'PUT',
        params: {
          id: '@id',
          uncache: true
        }
      },
      delete: {
        method: 'DELETE',
        params: {
          id: '@id'
        }
      }
    });
  }

}());
