/*!
 *  Copyright (c) 2014 Milo van der Linden (milo@dogodigi.net)
 *
 *  This file is part of safetymapDBK
 *
 *  safetymapDBK is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  safetymapDBK is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with safetymapDBK. If not, see <http://www.gnu.org/licenses/>.
 *
 */

var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
dbkjs.modules.feature = {
    id: "dbk.modules.feature",
    /**
     * URL naar een statisch boringen bestand in gml formaat
     */
    features: [],
    /**
     * Laag. Wordt geiniteerd met de functie dbkobject.show() kan worden overruled
     */
    highlightlayer: null,
    timer: null,
    showlabels: true,
    layer: null,
    currentCluster: [],
    selection: null,
    /**
     * The layer that will hold the incidents
     */

    /**
     * The layer that will hold the incident sketches such as catchement areas and route
     */
//    sketch: new OpenLayers.Layer.Vector("Feature_sketch", {
//        rendererOptions: {
//            zIndexing: true
//        }
//    }),
    caches: {},
    getActive: function() {
        var _obj = dbkjs.modules.feature;
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
    },
    register: function(options) {
        var _obj = dbkjs.modules.feature;
        dbkjs.gui.createRefreshButton(_obj);
        _obj.namespace = options.namespace || _obj.namespace;
        _obj.url = options.url || _obj.url;
        _obj.visibility = options.visible || _obj.visibility;
        _obj.layer = new OpenLayers.Layer.Vector("Feature", {
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
        //_obj.sketch.setZIndex(2002);
        _obj.layer.displayInLayerSwitcher = false;
        //_obj.sketch.displayInLayerSwitcher = false;
        dbkjs.map.addLayer(_obj.layer);
        //Add the layer to the selectControl
        dbkjs.selectControl.setLayer((dbkjs.selectControl.layers || dbkjs.selectControl.layer).concat(_obj.layer));
        dbkjs.selectControl.activate();
        _obj.layer.events.on({
            "featureselected": _obj.getfeatureinfo,
            "featuresadded": function() {},
            "featureunselected": function(e) {}
        });

        _obj.get();
    },
    get: function() {
        var _obj = dbkjs.modules.feature;
        if(_obj.layer){
            _obj.layer.destroyFeatures();
        }
        var params = {
            srid: dbkjs.options.projection.srid,
            timestamp: new Date().getTime()
        };
        $.getJSON(dbkjs.dataPath + 'features.json', params).done(function(data) {
            var geojson_format = new OpenLayers.Format.GeoJSON();
                _obj.features = geojson_format.read(data);
//                var test = data.features.where( "( el, i, res, param ) => el.properties.gevaarlijkestof !== null");
//                console.log(test.length + ' DBK Features met gevaarlijke stoffen');
//                var test = data.features.where( "( el, i, res, param ) => el.properties.OMSNummer !== null");
//                console.log(test.length + ' DBK Features met OMS nummer');
//                var test = data.features.where( "( el, i, res, param ) => el.properties.typeFeature === 'Object'");
//                console.log(test.length + ' DBK objecten');
//                var test = data.features.where( "( el, i, res, param ) => el.properties.typeFeature === 'Gebied'");
//                console.log(test.length + ' DBK gebieden');
            if(dbkjs.modules.filter && dbkjs.modules.filter.selectie.length > 0 ) {
                var selfeat = [];
                $.each(_obj.features, function(fix,feat){
                    if($.inArray(feat.attributes.identificatie, dbkjs.modules.filter.selectie) !== -1){
                        //create a subselection from the features
                        selfeat.push(feat);
                    }
                });
                if(selfeat.length > 0){
                    _obj.layer.addFeatures(selfeat);
                }
            } else {
                if(_obj.features){
                    _obj.layer.addFeatures(_obj.features);
                }
            }
            $('#btn_refresh > i').removeClass('fa-spin');
                _obj.search_dbk();
        }).fail(function( jqxhr, textStatus, error ) {
            $('#btn_refresh > i').removeClass('fa-spin');
            dbkjs.options.feature = null;
            dbkjs.gui.showError('Features konden niet worden ingelezen');
        });
    },
    featureInfohtml: function(feature) {
        var ret_title = $('<li></li>');
        ret_title.append('<a id="' + feature.attributes.identificatie + '" href="#">' + feature.attributes.formeleNaam + '</a>');
        return ret_title;
    },
    search_dbk: function() {
        var _obj = dbkjs.modules.feature;
        var dbk_naam_array = _obj.getDbkSearchValues();
        dbkjs.gui.updateSearchInput(_obj, dbk_naam_array);
    },
    search_oms: function() {
        var _obj = dbkjs.modules.feature;
        var dbk_naam_array = _obj.getOmsSearchValues();
        dbkjs.gui.updateSearchInput(_obj, dbk_naam_array);
    },
    getDbkSearchValues: function() {
        var _obj = dbkjs.modules.feature;
        var dbk_naam_array = [];
        if(_obj.caches.hasOwnProperty('dbk')) {
            return _obj.caches.dbk;
        }
        $.each(_obj.features, function(key, feature) {
            // Extend feature object with value and id for searching
            feature.value = feature.attributes.formeleNaam + ' ' + feature.attributes.informeleNaam;
            feature.id = feature.attributes.identificatie;
            dbk_naam_array.push(feature);
        });
        _obj.caches.dbk = dbk_naam_array;
        return _obj.caches.dbk;
    },
    getOmsSearchValues: function() {
        var _obj = dbkjs.modules.feature,
            dbk_naam_array = [];
        if(_obj.caches.hasOwnProperty('oms')) {
            return _obj.caches.oms;
        }
        $.each(_obj.features, function(key, feature) {
            if (!dbkjs.util.isJsonNull(feature.attributes.OMSNummer)) {
                // Extend feature object with value and id for searching
                feature.value = feature.attributes.OMSNummer + ' ' + feature.attributes.formeleNaam;
                feature.id = feature.attributes.identificatie;
                dbk_naam_array.push(feature);
            }
        });
        _obj.caches.oms = dbk_naam_array;
        return _obj.caches.oms;
    },
    handleDbkOmsSearch: function(object) {
        var _obj = dbkjs.modules.feature;
        dbkjs.modules.updateFilter(object.id);
        dbkjs.protocol.jsonDBK.process(object);
        _obj.zoomToFeature(object);
    },
    zoomToFeature: function(feature) {
        if(feature.attributes && feature.attributes.identificatie){
            dbkjs.options.dbk = feature.attributes.identificatie;
        } else {
            //Geen DBK (meer) geselecteerd, bijv. bij zoeken op adres.
            dbkjs.options.dbk = 0;
        }
        dbkjs.modules.updateFilter(dbkjs.options.dbk);
        if(!dbkjs.options.zoomToPandgeometrie) {
            if (dbkjs.map.zoom < dbkjs.options.zoom) {
                dbkjs.map.setCenter(feature.geometry.getBounds().getCenterLonLat(), dbkjs.options.zoom);
            } else {
                dbkjs.map.setCenter(feature.geometry.getBounds().getCenterLonLat());
            }
        } else {
            this.zoomToPandgeometrie();
        }
        // getActive() changed, hide it
        this.layer.redraw();
    },
    zoomToPandgeometrie: function() {
        // Pandgeometrie layer must be loaded

        var bounds = dbkjs.protocol.jsonDBK.layerPandgeometrie.getDataExtent();
        if(bounds) {
            var margin = dbkjs.options.zoomToPandgeometrieMargin || 50;
            var boundCoords = bounds.toArray();
            var extendedBounds = OpenLayers.Bounds.fromArray([
                boundCoords[0] - margin,
                boundCoords[1] - margin,
                boundCoords[2] + margin,
                boundCoords[3] + margin]);
            dbkjs.map.zoomToExtent(extendedBounds);
        }
    },
    getfeatureinfo: function(e) {
        var _obj = dbkjs.modules.feature;
        if (typeof(e.feature) !== "undefined") {
            dbkjs.gui.infoPanelUpdateHtml('');
            if (e.feature.cluster) {
                if (e.feature.cluster.length === 1) {
                    _obj.zoomToFeature(e.feature.cluster[0]);
                } else {
                    _obj.currentCluster = e.feature.cluster.slice();
                    _obj.currentCluster.sort(function(lhs, rhs) {
                        return lhs.attributes.formeleNaam.localeCompare(rhs.attributes.formeleNaam);
                    });
                    if(dbkjs.viewmode === 'fullscreen') {
                        var item_ul = $('<ul id="dbklist" class="nav nav-pills nav-stacked"></ul>');
                        for(var i = 0; i < _obj.currentCluster.length; i++) {
                            item_ul.append(_obj.featureInfohtml(_obj.currentCluster[i]));
                        }
                        dbkjs.gui.infoPanelAddItems(item_ul);
                        dbkjs.util.getModalPopup('infopanel').setHideCallback(function() {
                            if(_obj.layer.selectedFeatures.length === 0) {
                                return;
                            }
                            for(var i = 0; i < _obj.layer.features.length; i++) {
                                dbkjs.selectControl.unselect(_obj.layer.features[i]);
                            }
                        });
                        $("#dbklist").on("click", "a", _obj.handleFeatureTitleClick);
                        dbkjs.util.getModalPopup('infopanel').show();
                    } else {
                        dbkjs.gui.infoPanelUpdateTitle('<i class="fa fa-info-circle"></i> &nbsp;Informatie');
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
                dbkjs.protocol.jsonDBK.process(e.feature);
                _obj.zoomToFeature(e.feature);
                if(dbkjs.viewmode === 'fullscreen') {
                    dbkjs.util.getModalPopup('infopanel').hide();
                } else {
                    dbkjs.gui.infoPanelHide();
                }
            }
        }
    },
    handleFeatureTitleClick: function(e) {
        var _obj = dbkjs.modules.feature;
        e.preventDefault();
        dbkjs.options.dbk = $ (this).attr("id");
        var feature = _obj.getActive();
        dbkjs.protocol.jsonDBK.process(feature);
        _obj.zoomToFeature(feature);
        return false;
    }
};
