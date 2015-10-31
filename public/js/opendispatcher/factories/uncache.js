angular
  .module('opendispatcher.factories')
  .factory('UncacheInterceptor', UncacheInterceptor);

function UncacheInterceptor($cacheFactory) {
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
}
