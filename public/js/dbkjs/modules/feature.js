/*!
 *  Copyright (c) 2014 Milo van der Linden (milo@dogodigi.net)
 *
 *  This file is part of opendispatcher/safetymapsDBK
 *
 *  opendispatcher is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  opendispatcher is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with opendispatcher. If not, see <http://www.gnu.org/licenses/>.
 *
 */

/* global i18n */

var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
/**
 * @memberof dbkjs.modules
 * @exports feature
 * @todo Complete documentation.
 */
dbkjs.modules.feature = {
  /**
   * @constant
   * @type dbkjs.Module.id
   * @default
   */
  id: "dbk.modules.feature",
  /**
   * URL naar een statisch boringen bestand in gml formaat
   */
  features: [],
  /**
   * Laag. Wordt geiniteerd met de functie dbkobject.show() kan worden overruled
   */
  highlightlayer: null,
  /**
   *
   */
  timer: null,
  /**
   *
   */
  showlabels: true,
  /**
   *
   */
  layer: null,
  /**
   *
   */
  currentCluster: [],
  /**
   *
   */
  selection: null,
  /**
   *
   */
  caches: {},
  /**
   *
   */
  getActive: function() {
    var _obj = dbkjs.modules.feature;
    if (_obj.active) {
      return feature;
    } else {
      var feature;
      var _search_field = 'identificatie';
      var _search_value;
      if (!dbkjs.util.isJsonNull(dbkjs.options.dbk)) {
        _search_field = 'identificatie';
        _search_value = dbkjs.options.dbk;
      } else if (!dbkjs.util.isJsonNull(dbkjs.options.omsnummer)) {
        _search_field = 'OMSNummer';
        _search_value = dbkjs.options.omsnummer;
      }
      if (_search_value) {
        $.each(_obj.layer.features, function(fi, fv) {
          if (fv.cluster) {
            $.each(fv.cluster, function(ci, cv) {
              if (cv.attributes[_search_field]) {
                if (cv.attributes[_search_field].toString() === _search_value.toString()) {
                  feature = cv;
                }
              }
            });
          } else {
            if (fv.attributes[_search_field]) {
              if (fv.attributes[_search_field].toString() === _search_value.toString()) {
                feature = fv;
              }
            }
          }
        });

        if (feature) {
          dbkjs.options.dbk = feature.attributes.identificatie;
          dbkjs.modules.updateFilter(dbkjs.options.dbk);
          return feature;
        } else {
          return false;
        }
      }
    }
  },
  /**
   *
   */
  register: function(options) {
    var _obj = dbkjs.modules.feature;
    dbkjs.gui.createRefreshButton(_obj);

    //Add the features to the layer control under "system"
    _obj.id = OpenLayers.Util.createUniqueID("dbkjs_layer_");
    _obj.div = $('<div class="panel"></div>');
    _obj.div.attr('id', 'panel_' + _obj.id);
    var dv_panel_heading = $('<div class="panel-heading"></div>');
    var dv_panel_title = $('<h4 class="panel-title"></div>');
    var parent = '#overlay_tab2';
    var name = i18n.t('app.features');
    dv_panel_title.append(name + '&nbsp;<a class="accordion-toggle" data-toggle="collapse" href="#collapse_' +
      _obj.id + '" data-parent="' + parent + '" ></a>');
    dv_panel_heading.append(dv_panel_title);
    _obj.div.append(dv_panel_heading);
    dv_panel_content = $('<div id="collapse_' + _obj.id + '" class="panel-collapse collapse"></div>');
    _obj.div.append(dv_panel_content);
    $(parent).append(_obj.div);
    $(parent).sortable({
      handle: '.panel'
    });
    dv_panel_heading.addClass('active');
    dv_panel_heading.addClass('layActive');

    _obj.namespace = options.namespace || _obj.namespace;
    _obj.url = options.url || _obj.url;
    _obj.visibility = options.visible || _obj.visibility;
    _obj.layer = new OpenLayers.Layer.Vector(i18n.t('app.features'), {
      rendererOptions: {
        zIndexing: true
      },
      strategies: [
        new OpenLayers.Strategy.Cluster({
          distance: 100,
          threshold: 2
        })
      ],
      styleMap: dbkjs.config.styles.dbkfeature
    });
    _obj.layer.setZIndex(2006);
    _obj.layer.displayInLayerSwitcher = false;
    dbkjs.map.addLayer(_obj.layer);
    dbkjs.selectControl.setLayer((dbkjs.selectControl.layers || dbkjs.selectControl.layer).concat(_obj.layer));
    dbkjs.selectControl.activate();
    _obj.layer.events.on({
      "featureselected": _obj.getfeatureinfo,
      "featuresadded": function() {},
      "featureunselected": function(e) {}
    });
    dv_panel_heading.click(function(e) {
      dbkjs.disableloadlayer = true;
      if (!dv_panel_heading.hasClass('active')) {
        _obj.layer.setVisibility(true);
        dv_panel_heading.addClass('active');
        dv_panel_heading.addClass('layActive');
        $('#tb01').removeClass('btn-warning');
      } else {
        _obj.layer.setVisibility(false);
        dv_panel_heading.removeClass('active');
        dv_panel_heading.removeClass('layActive');
        $('#tb01').addClass('btn-warning');
      }
    });
    _obj.get();
  },
  /**
   *
   */
  get: function() {
    var _obj = dbkjs.modules.feature;
    if (_obj.layer) {
      _obj.layer.destroyFeatures();
    }
    var params = {
      srid: dbkjs.options.projection.srid,
      timestamp: new Date().getTime()
    };
    dbkjs.util.loadingStart(_obj.layer);
    $.getJSON(dbkjs.dataPath + 'features.json', params).done(function(data) {
      var geojson_format = new OpenLayers.Format.GeoJSON();
      _obj.features = geojson_format.read(data);
      if (dbkjs.modules.filter && dbkjs.modules.filter.selectie.length > 0) {
        var selfeat = [];
        $.each(_obj.features, function(fix, feat) {
          if ($.inArray(feat.attributes.identificatie, dbkjs.modules.filter.selectie) !== -1) {
            //create a subselection from the features
            selfeat.push(feat);
          }
        });
        if (selfeat.length > 0) {
          _obj.layer.addFeatures(selfeat);
        }
      } else {
        if (_obj.features) {
          _obj.layer.addFeatures(_obj.features);
        }
      }
      dbkjs.util.loadingEnd(_obj.layer);
      $('#btn_refresh > i').removeClass('fa-spin');
      _obj.search_dbk();
    }).fail(function(jqxhr, textStatus, error) {
      $('#btn_refresh > i').removeClass('fa-spin');
      dbkjs.options.feature = null;
      dbkjs.gui.showError(" " + i18n.t('app.errorfeatures'));
    });
  },
  /**
   *
   */
  featureInfohtml: function(feature) {
    var _obj = dbkjs.modules.feature;
    var ret_title = $('<li></li>');
    var link = '<a id="' +
      feature.attributes.identificatie +
      '" href="#">' +
      feature.attributes.formeleNaam;
    if (!dbkjs.util.isJsonNull(feature.attributes.informeleNaam)) {
      link += ' (' + feature.attributes.informeleNaam + ')';
    }
    ret_title.append(link + '</a>');
    if (dbkjs.viewmode === 'fullscreen') {
      $(ret_title).click(function() {
        dbkjs.protocol.jsonDBK.process(feature, function() {
          _obj.zoomToFeature(feature);
        });
        return false;
      });
    }
    return ret_title;
  },
  /**
   *
   */
  search_dbk: function() {
    var _obj = dbkjs.modules.feature;
    var dbk_naam_array = _obj.getDbkSearchValues();
    if (dbkjs.viewmode !== 'fullscreen') {
      dbkjs.gui.updateSearchInput(_obj, 'dbk', dbk_naam_array);
    } else {
      $('#search_input').typeahead('destroy');
      $('#search_input').val('');
      $('#search_input').typeahead({
        name: 'dbk',
        local: dbk_naam_array,
        limit: 10
      });
      $('#search_input').bind('typeahead:selected', function(obj, datum) {
        _obj.handleDbkOmsSearch(datum);
      });
    }
  },
  /**
   *
   */
  search_oms: function() {
    var _obj = dbkjs.modules.feature;
    var oms_naam_array = _obj.getOmsSearchValues();
    if (dbkjs.viewmode !== 'fullscreen') {
      dbkjs.gui.updateSearchInput(_obj, 'oms', oms_naam_array);
    } else {
      $('#search_input').typeahead('destroy');
      $('#search_input').val('');
      $('#search_input').typeahead({
        name: 'oms',
        local: dbk_naam_array,
        limit: 10
      });
      $('#search_input').bind('typeahead:selected', function(obj, datum) {
        _obj.handleDbkOmsSearch(datum);
      });
    }
  },
  /**
   * Override this function to customize the search (and display) string of DBK's,
   * for example to include address:
   * @example
   *     dbkjs.modules.feature.getDbkSearchValue = function(feature) {
   *       var t = feature.attributes.formeleNaam + ' ' +
   *         (dbkjs.util.isJsonNull(feature.attributes.informeleNaam) ?
   *           '' :
   *           feature.attributes.informeleNaam);
   *       if(feature.attributes.adres && feature.attributes.adres.length > 0) {
   *         var a = feature.attributes.adres[0];
   *         t += ", " + a.openbareRuimteNaam;
   *         t += !dbkjs.util.isJsonNull(a.huisnummer) ? " " + a.huisnummer : "";
   *         t += !dbkjs.util.isJsonNull(a.huisletter) ? a.huisletter : "";
   *         t += !dbkjs.util.isJsonNull(a.huisnummertoevoeging) ? " " +
   *           a.huisnummertoevoeging : "";
   *         if(!dbkjs.util.isJsonNull(a.postcode) || !dbkjs.util.isJsonNull(a.woonplaatsNaam)) {
   *             t += ", ";
   *         }
   *         t += !dbkjs.util.isJsonNull(a.postcode) ? a.postcode : "";
   *         t += !dbkjs.util.isJsonNull(a.woonplaatsNaam) ? " " + a.woonplaatsNaam : "";
   *       }
   *       return t;
   *     }
   */

  getDbkSearchValue: function(feature) {
    return feature.attributes.formeleNaam + ' ' + (dbkjs.util.isJsonNull(feature.attributes.informeleNaam) ? '' : feature.attributes.informeleNaam);
  },
  /**
   *
   */
  getDbkSearchValues: function() {
    var _obj = dbkjs.modules.feature;
    var dbk_naam_array = [];
    if (_obj.caches.hasOwnProperty('dbk')) {
      return _obj.caches.dbk;
    }
    $.each(_obj.features, function(key, value) {
      dbk_naam_array.push({
        value: _obj.getDbkSearchValue(value),
        geometry: value.geometry,
        id: value.attributes.identificatie,
        attributes: value.attributes
      });
    });
    _obj.caches.dbk = dbk_naam_array;
    return _obj.caches.dbk;
  },
  /**
   *
   */
  getOmsSearchValues: function() {
    var _obj = dbkjs.modules.feature,
      oms_naam_array = [];
    if (_obj.caches.hasOwnProperty('oms')) {
      return _obj.caches.oms;
    }
    $.each(_obj.features, function(key, feature) {
      if (!dbkjs.util.isJsonNull(feature.attributes.OMSNummer)) {
        // Extend feature object with value and id for searching
        feature.value = feature.attributes.OMSNummer + ' ' + feature.attributes.formeleNaam;
        feature.id = feature.attributes.identificatie;
        oms_naam_array.push(feature);
      }
    });
    _obj.caches.oms = oms_naam_array;
    return _obj.caches.oms;
  },
  /**
   *
   */
  handleDbkOmsSearch: function(object) {
    var _obj = dbkjs.modules.feature;
    if (dbkjs.viewmode !== 'fullscreen') {
      dbkjs.modules.updateFilter(object.id);
      dbkjs.protocol.jsonDBK.process(object);
      _obj.zoomToFeature(object);
    } else {
      dbkjs.protocol.jsonDBK.process(object, function() {
        _obj.zoomToFeature(object);
      });
    }
  },
  /**
   *
   */
  zoomToFeature: function(feature) {
    dbkjs.options.dbk = feature === null ? null : feature.attributes.identificatie;
    dbkjs.modules.updateFilter(dbkjs.options.dbk);
    if (dbkjs.options.dbk) {
      if (!dbkjs.options.zoomToPandgeometrie) {
        if (dbkjs.map.zoom < dbkjs.options.zoom) {
          dbkjs.map.setCenter(feature.geometry.getBounds().getCenterLonLat(), dbkjs.options.zoom);
        } else {
          dbkjs.map.setCenter(feature.geometry.getBounds().getCenterLonLat());
        }
      } else {
        this.zoomToPandgeometrie();
      }
      this.layer.redraw();
    }
  },
  /**
   *
   */
  updateFilter: function() {
    this.layer.redraw();
  },  
  /**
   *
   */
  zoomToPandgeometrie: function() {
    // Pandgeometrie layer must be loaded

    var bounds = dbkjs.protocol.jsonDBK.layerPandgeometrie.getDataExtent();
    if (bounds) {
      var margin = dbkjs.options.zoomToPandgeometrieMargin || 50;
      var boundCoords = bounds.toArray();
      var extendedBounds = OpenLayers.Bounds.fromArray([
        boundCoords[0] - margin,
        boundCoords[1] - margin,
        boundCoords[2] + margin,
        boundCoords[3] + margin
      ]);
      dbkjs.map.zoomToExtent(extendedBounds);
    }
  },
  /**
   *
   */
  getfeatureinfo: function(e) {
    var _obj = dbkjs.modules.feature;
    if (typeof(e.feature) !== "undefined") {
      dbkjs.gui.infoPanelUpdateHtml('');
      if (e.feature.cluster) {
        if (e.feature.cluster.length === 1) {
          // XXX should never come here because feature.cluster should be false, only do else part here
          _obj.zoomToFeature(e.feature.cluster[0]);
        } else {
          _obj.currentCluster = e.feature.cluster.slice();
          _obj.currentCluster.sort(function(lhs, rhs) {
            if (!lhs.attributes.formeleNaam || !rhs.attributes.formeleNaam) {
              return 0;
            }
            return lhs.attributes.formeleNaam.localeCompare(rhs.attributes.formeleNaam);
          });
          if (dbkjs.viewmode === 'fullscreen') {
            var item_ul = $('<ul id="dbklist" class="nav nav-pills nav-stacked"></ul>');
            for (var i = 0; i < _obj.currentCluster.length; i++) {
              item_ul.append(_obj.featureInfohtml(_obj.currentCluster[i]));
            }
            dbkjs.gui.infoPanelAddItems(item_ul);
            dbkjs.util.getModalPopup('infopanel').setHideCallback(function() {
              if (_obj.layer.selectedFeatures.length === 0) {
                return;
              }
              for (var i = 0; i < _obj.layer.features.length; i++) {
                dbkjs.selectControl.unselect(_obj.layer.features[i]);
              }
            });
            $("#dbklist").on("click", "a", _obj.handleFeatureTitleClick);
            dbkjs.util.getModalPopup('infopanel').show();
          } else {
            dbkjs.gui.infoPanelUpdateTitle('<i class="fa fa-info-circle"></i> ' + i18n.t('app.results'));
            dbkjs.gui.infoPanelAddPagination();
            dbkjs.gui.infoPanelShowFooter();

            $("#Pagination").pagination(e.feature.cluster.length, {
              items_per_page: 10,
              callback: function(page_index, jq) {
                var items_per_page = 10;
                var max_elem = Math.min((page_index + 1) * items_per_page, _obj.currentCluster.length);
                var item_ul = $('<ul id="dbklist" class="nav nav-pills nav-stacked"></ul>');
                dbkjs.gui.infoPanelUpdateHtml('');
                for (var i = page_index * items_per_page; i < max_elem; i++) {
                  item_ul.append(_obj.featureInfohtml(_obj.currentCluster[i]));
                }
                dbkjs.gui.infoPanelAddItems(item_ul);
                $("#dbklist").on("click", "a", _obj.handleFeatureTitleClick);
              }
            });
            dbkjs.gui.infoPanelShow();
          }
        }
      } else {
        _obj.currentCluster = [];
        _obj.showFeatureInfo(e.feature);
      }
    }
  },
  /**
   *
   */
  showFeatureInfo: function(feature) {
    var _obj = dbkjs.modules.feature;
    dbkjs.protocol.jsonDBK.process(feature);
    if (dbkjs.viewmode === 'fullscreen') {
      dbkjs.util.getModalPopup('infopanel').hide();
    } else {
      dbkjs.gui.infoPanelHide();
    }
  },
  /**
   * @event
   */
  handleFeatureTitleClick: function(e) {
    var _obj = dbkjs.modules.feature;
    e.preventDefault();
    dbkjs.options.dbk = $(this).attr("id");
    var feature = _obj.getActive();
    dbkjs.protocol.jsonDBK.process(feature);
    return false;
  }
};
