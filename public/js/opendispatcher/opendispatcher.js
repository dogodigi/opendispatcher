/**
 * Module
 */
var opendispatcher = angular.module('opendispatcher', ['leaflet-directive', 'ui.bootstrap']);

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
      myPoly = L.geoJson({
        "type": "Feature",
        "properties": {},
        "geometry": data.organisation.area.geometry
      });
      data.organisation.feature = myPoly;
      organisation = data.organisation;
      organisation.layers = [];

      angular.forEach(organisation.wms, function(v, k) {
        if (v.getcapabilities) {
          var deferCapabilities = $q.defer();
          //var parser = new ol.format.WMSCapabilities();
          var params = $httpParamSerializer(
            angular.extend({
              SERVICE: 'WMS',
              VERSION: '1.1.1', // For example, '1.1.1'
              REQUEST: 'GetCapabilities'
            }, v.params));
          $http.get(
            "/proxy/?q=" + encodeURIComponent('http://geo04.safetymaps.nl' + v.url + params), {
              //transformResponse: function(data) {
              //result = parser.read(data);
              //return result.Capability.Layer;
              //}
            }).then(function(response) {
            layers.push({
              name: v.name,
              status: response.status,
              data: response.data
            });
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

opendispatcher.controller('odIndexController', ['$scope', '$uibModal', 'organisationService', 'leafletData',
  function($scope, $uibModal, organisationService, leafletData) {
    var myBaseLayer = {
      name: 'OpenStreetMap (XYZ)',
      url: 'http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png',
      type: 'xyz',
      layerOptions: {
        subdomains: '1234',
        attribution: "&copy; <a href='http://www.openstreetmap.org/'>OpenStreetMap</a> and contributors, under an <a href='http://www.openstreetmap.org/copyright' title='ODbL'>open license</a>. Tiles Courtesy of <a href='http://www.mapquest.com/'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png'>"
      }
    };
    angular.extend($scope, {
      //override defaults
      defaults: {
        zoomControl: true
      },
      controls: {},
      layers: {
        baselayers: {
          xyz: myBaseLayer
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
    leafletData.getMap('map').then(function(map) {
      angular.extend($scope.controls, {
        minimap: {
          type: 'minimap',
          layer: myBaseLayer,
          toggleDisplay: true
        }
      });
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
    });
  }
]);
