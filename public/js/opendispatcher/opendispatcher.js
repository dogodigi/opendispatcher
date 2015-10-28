/**
 * Module
 */
var opendispatcher = angular.module('opendispatcher', ['openlayers-directive', 'ui.bootstrap']);

/**
 * Services
 */
opendispatcher.service('organisationService', function($http, $httpParamSerializer, $q) {
  var promises = [];
  var deferOrganisation = $q.defer();
  var organisation = {};
  var layers = [];
  this.load = function() {
    return $http.get("api/organisation.json").then(function(response) {
      var data = response.data;
      myPoly = new ol.format.GeoJSON().readFeature({
        "type": "Feature",
        "properties": {},
        "geometry": data.organisation.area.geometry
      });
      data.organisation.feature = myPoly;
      //transform will alter the geometry!
      myPoly.getGeometry().transform('EPSG:4326', 'EPSG:3857');
      organisation = data.organisation;
      organisation.layers = [];

      angular.forEach(organisation.wms, function(v, k) {
        if (v.getcapabilities) {
          var deferCapabilities = $q.defer();
          var parser = new ol.format.WMSCapabilities();
          var params = $httpParamSerializer(
            angular.extend({
              SERVICE: 'WMS',
              VERSION: '1.1.1', // For example, '1.1.1'
              REQUEST: 'GetCapabilities'
            }, v.params));
          $http.get(
            "/proxy/?q=" + encodeURIComponent('http://geo04.safetymaps.nl' + v.url + params), {
              transformResponse: function(data) {
                result = parser.read(data);
                return result.Capability.Layer;
              }
            }).then(function(response) {
            layers.push({
              name: v.name,
              status: response.status,
              data: response.data
            });
            //organisation.layers.push({name: v.name, status: response.status, data: response.data});
            deferCapabilities.resolve();
          });
          promises.push(deferCapabilities.promise);
        }
      });
      $q.all(promises).then(function() {
        organisation.layers = layers;
        deferOrganisation.resolve();
      });
      return deferOrganisation.promise;
    });
  };

  this.data = function() {
    return organisation;
  };
});

opendispatcher.service('sitesService', function() {
  var sites = {};
  this.get = function() {
    $http.get('api/features.json').success(function(data) {
      $scope.geojson.data = data;
    });
  };
});

/**
 * Controllers
 */
opendispatcher.controller('organisationController', function($scope, $uibModalInstance, organisation) {
  $scope.organisation = organisation;
});

opendispatcher.controller('odIndexController', ['$scope', '$uibModal', 'organisationService', 'olData',
  function($scope, $uibModal, organisationService, olData) {
    angular.extend($scope, {
      //override defaults
      defaults: {
        controls: {
          zoom: false,
          rotate: true
        },
        interactions: {
          mouseWheelZoom: true
        }
      },
      previousDisabled: true,
      nextDisabled: true
    });
    $scope.open = function(id) {
      var modalInstance = $uibModal.open({
        animation: true,
        controller: 'organisationController',
        templateUrl: '/templates/viewer/' + id,
        resolve: {
          organisation: function() {
            return $scope.organisation;
          }
        }
      });
    };
    var history = new historyControl();
    history.on('change:backDisabled', function() {
      console.log('change:backDisabled');
      console.log($scope);
      $scope.previousDisabled = history.get('backDisabled');
    });
    history.on('change:forwardDisabled', function() {
      $scope.nextDisabled = history.get('forwardDisabled');
    });

    olData.getMap('map').then(function(olMap){
      var map = olMap.getView();

      organisationService.load().then(function() {
        $scope.organisation = organisationService.data();
        console.log($scope.organisation.layers);
        history.setMap(olMap);
        map.fit($scope.organisation.feature.getGeometry(), olMap.getSize());
      });
      angular.extend($scope, {
        zoomIn: function() {
          map.setZoom(map.getZoom() + 1);
        },
        zoomOut: function() {
          map.setZoom(map.getZoom() - 1);
        },
        historyPrevious: function() {
          history.goBack();
        },
        historyNext: function() {
          history.goForward();
        },
        //@todo work in progress
        toggleMiniMap: function() {
          console.log('toggleMiniMap');
        },
        permaLink: function() {
          console.log('permaLink');
        },
        zoomExtent: function() {
          map.fit($scope.organisation.feature.getGeometry(), olMap.getSize());
        }
      });
    });
    /*
    leafletData.getMap('map').then(function(map) {
      var mapHistory = new L.HistoryControl({
        useExternalControls: true
      }).addTo(map);
      map.on('historybackenabled', function() {
        $scope.previousDisabled = false;
      });
      map.on('historybackdisabled', function() {
        $scope.previousDisabled = true;
      });
      map.on('historyforwardenabled', function() {
        $scope.nextDisabled = false;
      });
      map.on('historyforwarddisabled', function() {
        $scope.nextDisabled = true;
      });
      organisationService.load().then(function() {
        $scope.organisation = organisationService.data();
        console.log($scope.organisation.layers);
        map.fitBounds($scope.organisation.feature.getBounds());
        mapHistory.clearHistory();
      });
      angular.extend($scope, {
        zoomIn: function() {
          map.setZoom(map.getZoom() + 1);
        },
        zoomOut: function() {
          map.setZoom(map.getZoom() - 1);
        },
        historyPrevious: function() {
          mapHistory.goBack();
        },
        historyNext: function() {
          mapHistory.goForward();
        },
        //@todo work in progress
        toggleMiniMap: function() {
          console.log('toggleMiniMap');
        },
        permaLink: function() {
          console.log('permaLink');
        },
        zoomExtent: function() {
          map.fitBounds(myPoly.getBounds());
        }
      });
    });*/
  }
]);
