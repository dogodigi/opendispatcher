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
        $('#btngrp_navigation').append(
            '<a id="btn_refresh" class="btn btn-default navbar-btn" href="#" title="'+
            i18n.t('app.refresh') + '"><i class="icon-refresh"></i></a>'
        );
        $('#btn_refresh').click(function() {
            _obj.get();
        });
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
        $.getJSON('api/features.json', params).done(function(data) {
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
                _obj.layer.addFeatures(selfeat);
            } else {
                _obj.layer.addFeatures(_obj.features);
            }

                _obj.search_dbk();
        }).fail(function( jqxhr, textStatus, error ) {
            dbkjs.options.feature = null;
            dbkjs.util.alert('Fout', ' Features konden niet worden ingelezen', 'alert-danger');
        });
    },
    featureInfohtml: function(feature) {
        var _obj = dbkjs.modules.feature;
        var ret_title = $('<li></li>');
        ret_title.append('<a href="#">' + feature.attributes.formeleNaam + '</a>');
        //var ret_val = $('<td class="dbk_feature" id="dbk_' + feature.attributes.id + '"></td>');
        //ret_val.html(feature.attributes.formeleNaam);
        //ret_tr.append(ret_val);

        $(ret_title).click(function() {
            //dbkjs.options.dbk = feature.attributes.identificatie;
            dbkjs.modules.updateFilter(feature.attributes.identificatie);
            dbkjs.protocol.jsonDBK.process(feature);
            _obj.zoomToFeature(feature);
            return false;
        });
        return ret_title;
    },
    search_dbk: function() {
        var _obj = dbkjs.modules.feature;
        var dbk_naam_array = _obj.getDbkSearchValues();
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
    },
    search_oms: function() {
        var _obj = dbkjs.modules.feature;
        var dbk_naam_array = _obj.getOmsSearchValues();
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
    },
    getDbkSearchValues: function() {
        var _obj = dbkjs.modules.feature;
        var dbk_naam_array = [];
        if(_obj.caches.hasOwnProperty('dbk')) {
            return _obj.caches.dbk;
        }
        $.each(_obj.features, function(key, value) {
            dbk_naam_array.push({
                value: value.attributes.formeleNaam + ' ' + value.attributes.informeleNaam,
                geometry: value.geometry,
                id: value.attributes.identificatie,
                attributes: value.attributes
            });
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
        if (dbkjs.map.zoom < dbkjs.options.zoom) {
            dbkjs.map.setCenter(feature.geometry.getBounds().getCenterLonLat(), dbkjs.options.zoom);
        } else {
            dbkjs.map.setCenter(feature.geometry.getBounds().getCenterLonLat());
        }
        // getActive() changed, hide it
        this.layer.redraw();
    },
    getfeatureinfo: function(e) {
        var _obj = dbkjs.modules.feature;
        if (typeof(e.feature) !== "undefined") {
            $('#infopanel_b').html('');
            if (e.feature.cluster) {
                if (e.feature.cluster.length === 1) {
                    _obj.zoomToFeature(e.feature.cluster[0]);
                } else {
                    _obj.currentCluster = e.feature.cluster;
                    if(dbkjs.viewmode === 'fullscreen') {
                        var item_ul = $('<ul class="nav nav-pills nav-stacked"></ul>');
                        $('#infopanel_b').html('');
                        for(var i = 0; i < _obj.currentCluster.length; i++) {
                            item_ul.append(_obj.featureInfohtml(_obj.currentCluster[i]));
                        }
                        $('#infopanel_b').append(item_ul);
                        dbkjs.util.getModalPopup('infopanel').setHideCallback(function() {
                            if(_obj.layer.selectedFeatures.length === 0) {
                                return;
                            }
                            for(var i = 0; i < _obj.layer.features.length; i++) {
                                dbkjs.selectControl.unselect(_obj.layer.features[i]);
                            }
                        });
                        dbkjs.util.getModalPopup('infopanel').show();
                    } else {
                        $('#infopanel_f').append('<ul id="Pagination" class="pagination"></ul>');
                        $('#infopanel_f').show();

                        $("#Pagination").pagination(e.feature.cluster.length, {
                            items_per_page: 10,
                            callback: function(page_index, jq) {
                                var items_per_page = 10;
                                var max_elem = Math.min((page_index + 1) * items_per_page, _obj.currentCluster.length);
                                var item_ul = $('<ul class="nav nav-pills nav-stacked"></ul>');
                                $('#infopanel_b').html('');
                                for (var i = page_index * items_per_page; i < max_elem; i++) {
                                    item_ul.append(_obj.featureInfohtml(_obj.currentCluster[i]));
                                }
                                $('#infopanel_b').append(item_ul);
                            }
                        });
                        $('#infopanel').show();
                    }
                }
            } else {
                _obj.currentCluster = [];
                dbkjs.protocol.jsonDBK.process(e.feature);
                _obj.zoomToFeature(e.feature);
                if(dbkjs.viewmode === 'fullscreen') {
                    dbkjs.util.getModalPopup('infopanel').hide();
                } else {
                    $('#infopanel').hide();
                }
            }
        }
    }
};
