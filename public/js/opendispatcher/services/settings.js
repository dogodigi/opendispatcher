(function() {
  'use strict';
  angular
    .module('opendispatcher.services')
    .service('SettingsService', SettingsService);

  function SettingsService($http, $httpParamSerializer, $q) {
    var organisation = {};

    this.load = function() {
      var deferOrganisation = $q.defer();
      var promises = [];
      return $http.get("api/organisation.json").then(function(response) {
        var data = response.data;
        var myPoly = L.geoJson({
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
                    layerParams: {
                      layers: val.Name
                    }
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
                layerParams: {
                  layers: name
                }
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
  }
}());
