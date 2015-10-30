/**
 * Module
 */
var opendispatcher = angular.module('opendispatcher', ['leaflet-directive', 'ui.bootstrap', 'angular.filter', 'angularRangeSlider']);

/**
 * Services
 */
opendispatcher.service('organisationService', function($http, $httpParamSerializer, $q) {
  var organisation = {};

  this.load = function() {
    var deferOrganisation = $q.defer();
    var promises = [];
    return $http.get("api/organisation.json").then(function(response) {
      var data = response.data;
      myPoly = L.geoJson({
        "type": "Feature",
        "properties": {},
        "geometry": data.organisation.area.geometry
      });
      data.organisation.feature = myPoly;
      organisation = data.organisation;
      var overlays = {};
      var baselayers = {};
      angular.forEach(organisation.wms, function(v, k) {
        if (v.getcapabilities && v.baselayer === false) {
          var deferCapabilities = $q.defer();
          //var parser = new ol.format.WMSCapabilities();
          var params = $httpParamSerializer(
            angular.extend({
              SERVICE: 'WMS',
              VERSION: '1.1.1', // For example, '1.1.1'
              REQUEST: 'GetCapabilities'
            }, v.params));
          $http.get(
            "/ogc/?q=" + encodeURIComponent('http://geo04.safetymaps.nl' + v.url + params), {}).then(function(response) {
            if (response.data.WMT_MS_Capabilities && response.data.WMT_MS_Capabilities.Capability) {
              angular.forEach(response.data.WMT_MS_Capabilities.Capability.Layer.Layer, function(val, key) {
                //overlays[v.name] = overlays[v.name] || [];
                var title = val.Title || val.Name;
                if (!val.Name) {
                  console.log(val);
                }
                overlays[val.Name] = {
                  name: val.Name,
                  url: v.url,
                  type: v.layertype.toLowerCase(),
                  title: title,
                  group: v.name,
                  layerParams: {layers: val.Name}
                };
              });
            } else {
              console.log(response);
            }
            deferCapabilities.resolve();
          });
          promises.push(deferCapabilities.promise);
        } else {
          //simple layer. Add directly
          //split the name
          var group = v.parent || "#overlaypanel_b2";
          group = group.trim() === '#overlaypanel_b2' ? 'Systeem' : group;
          group = group.trim() === '#overlaypanel_b1' ? 'Bereikbaarheidskaart' : group;
          var nameArray = v.name.split("\\");
          if (nameArray.length > 1) {
            group = nameArray[0];
            name = nameArray[1];
            title = nameArray[1];
          } else {
            name = v.name;
            title = v.name;
          }
          var type = v.layertype.toLowerCase();
          if (v.baselayer) {
            baselayers[name] = {
              name: name,
              url: v.url,
              type: type,
              data: v
            };
          } else {
            overlays[name] = {
              name: name,
              title: name,
              group: group,
              type: type,
              url: v.url,
              layerParams: {layers: name}
            };
          }
        }
      });
      $q.all(promises).then(function() {
        organisation.layers = ({
          type: 'layers',
          overlays: overlays,
          baselayers: baselayers
        });
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
opendispatcher.controller('settingsController', function($scope, $uibModalInstance, organisation, overlays, baselayers) {
  $scope.organisation = organisation;
  $scope.overlays = overlays;
  $scope.baselayers = baselayers;
  $scope.toggleOverlay = function(overlay) {
    if (!overlay.visible) {
      overlay.visible = true;
      //turn the layer on
    } else {
      overlay.visible = false;
      //turn the layer off
    }
  };
  $scope.toggleBaselayer = function(baselayer) {
    if (!baselayer.visible) {
      baselayer.visible = true;
      //turn the layer on
    } else {
      baselayer.visible = false;
      //turn the layer off
    }
  };
});

opendispatcher.controller('odIndexController', ['$scope', '$uibModal', 'organisationService', 'leafletData',
  function($scope, $uibModal, organisationService, leafletData) {
    var myBaseLayer = {
      name: 'MapQuest',
      url: 'http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png',
      type: 'xyz',
      layerOptions: {
        subdomains: '1234',
        showLegend: false,
        showOnSelector: false,
        attribution: "&copy; <a href='http://www.openstreetmap.org/'>OpenStreetMap</a> and contributors, under an <a href='http://www.openstreetmap.org/copyright' title='ODbL'>open license</a>. Tiles Courtesy of <a href='http://www.mapquest.com/'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png'>"
      }
    };
    angular.extend($scope, {
      //override defaults
      loading: true,
      defaults: {
        zoomControl: false,
        layersControl: false
      },
      controls:{},
      layers: {
        baselayers: {
          mapquest: myBaseLayer
        },
        overlays: {

        }
      },
      previousDisabled: true,
      nextDisabled: true
    });

    $scope.open = function(id) {
      var modalInstance = $uibModal.open({
        animation: true,
        controller: 'settingsController',
        templateUrl: '/templates/viewer/' + id,
        size: 'lg',
        resolve: {
          organisation: function() {
            return $scope.organisation;
          },
          overlays: function(){
            return $scope.layers.overlays;
          },
          baselayers: function(){
            return $scope.layers.baselayers;
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

        angular.extend($scope.layers.overlays, $scope.organisation.layers.overlays);
        angular.extend($scope.layers.baselayers, $scope.organisation.layers.baselayers);
        map.fitBounds($scope.organisation.feature.getBounds());
        mapHistory.clearHistory();
        $scope.loading = false;
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
