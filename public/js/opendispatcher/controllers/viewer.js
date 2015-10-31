(function() {
  'use strict';
  angular
    .module('opendispatcher.controllers')
    .controller('ViewerController', ['$scope', '$uibModal', 'SettingsService', 'leafletData', ViewerController]);

  function ViewerController($scope, $uibModal, SettingsService, leafletData) {
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
      controls: {},
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
        controller: 'SettingsController',
        templateUrl: '/templates/viewer/' + id,
        size: 'lg',
        resolve: {
          organisation: function() {
            return $scope.organisation;
          },
          overlays: function() {
            return $scope.layers.overlays;
          },
          baselayers: function() {
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
      SettingsService.load().then(function() {
        $scope.organisation = SettingsService.data();

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
          map.fitBounds($scope.organisation.feature.getBounds());
        }
      });
    });
  }
}());
