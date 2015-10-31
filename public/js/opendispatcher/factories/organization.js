angular
  .module('opendispatcher.factories')
  .factory('OrganizationFactory', OrganizationFactory);

function OrganizationFactory($resource) {
  return $resource('/new/api/organization/:id', {}, {
    query: {
      method: 'GET'
    },
  });
}
