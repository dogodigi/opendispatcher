var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
dbkjs.modules.feature = {
    id: "dbkf",
    /**
     * URL naar een statisch boringen bestand in gml formaat
     */
    features: [],
    url: "/geoserver/zeeland/ows?",
    namespace: "zeeland",
    /**
     * Laag. Wordt geiniteerd met de functie dbkobject.show() kan worden overruled
     */
    highlightlayer: null,
    timer: null,
    showlabels: true,
    layer: null,
    currentCluster: [],
    selection: null,
    defaultStyle: new OpenLayers.Style({
        graphicWidth: "${mygraphicwidth}",
        graphicHeight: "${mygraphicheight}",
        fontColor: "${myfontcolor}",
        fontSize: "${myfontsize}",
        fontWeight: "${myfontweight}",
        externalGraphic: "${myicon}",
        label: "${labeltext}",
        labelSelect: true,
        labelAlign: "${mylabelalign}",
        labelBackgroundColor: "${labelbackground}",
        labelBorderColor: "${labelborder}",
        labelXOffset: "${mylabelxoffset}",
        labelYOffset: "${mylabelyoffset}"
    }, {
        context: {
            mygraphicheight: function(feature) {
                if (feature.cluster) {
                    if (feature.cluster.length < 10) {
                        return feature.cluster.length + 38;
                    } else if (feature.cluster.length > 10) {
                        return 49;
                    }
                } else {
                    return 38;
                }

            },
            mygraphicwidth: function(feature) {
                if (feature.cluster) {
                    if (feature.cluster.length < 10) {
                        return feature.cluster.length + 24;
                    } else if (feature.cluster.length > 10) {
                        return 35;
                    }
                } else {
                    return 24;
                }
            },
            myfontweight: function(feature) {
                if (feature.cluster) {
                    return "bold";
                } else {
                    return "normal";
                }
            },
            myfontsize: function(feature) {
                return "10.5px";
            },
            mylabelalign: function(feature) {
                if (feature.cluster) {
                    return "cc";
                } else {
                    return "rb";
                }
            },
            mylabelxoffset: function(feature) {
                if (feature.cluster) {
                    return 0;
                } else {
                    return -16;
                }
            },
            mylabelyoffset: function(feature) {
                if (feature.cluster) {
                    return -4;
                } else {
                    return -9;
                }
            },
            myfontcolor: function(feature) {
                if (feature.cluster) {
                    return "#ffffff";
                } else {
                    return "#000000";
                }
            },
            myicon: function(feature) {
                if (feature.cluster) {
                    return "images/building_1.png";
                } else {
                    if (dbkjs.map.zoom < 10) {
                        return "images/building_1.png";
                    } else {
                        return "images/building_1.png";
                    }
                }
            },
            labelbackground: function(feature) {
                if (feature.cluster) {
                    return;
                } else {
                    return "#ffeeff";
                }
            },
            labelborder: function(feature) {
                if (feature.cluster) {
                    return;
                } else {
                    return "#ff9999";
                }
            },
            labeltext: function(feature) {
                if (dbkjs.modules.feature.showlabels) {
                    if (feature.cluster) {
                        var lbl_txt, c;
                        if (feature.cluster.length > 1) {
                            lbl_txt = feature.cluster.length + "";
                        } else {
                            //lbl_txt = feature.cluster[0].attributes.formelenaam;
                            lbl_txt = "";
                        }
                        return lbl_txt;
                    } else {
                        //return feature.attributes.formelenaam;
                        return "";
                    }
                } else {
                    return "";
                }
            }
        }
    }),
    selectStyle: new OpenLayers.Style({
        graphicWidth: "${mygraphicwidth}",
        graphicHeight: "${mygraphicheight}",
        fontColor: "${myfontcolor}",
        fontSize: "${myfontsize}",
        fontWeight: "${myfontweight}",
        externalGraphic: "${myicon}",
        label: "${labeltext}",
        labelSelect: true,
        labelAlign: "${mylabelalign}",
        labelBackgroundColor: "${labelbackground}",
        labelBorderColor: "${labelborder}",
        labelXOffset: "${mylabelxoffset}",
        labelYOffset: "${mylabelyoffset}"
    }, {
        context: {
            mygraphicheight: function(feature) {
                if (feature.cluster) {
                    if (feature.cluster.length < 10) {
                        return feature.cluster.length + 38;
                    } else if (feature.cluster.length > 10) {
                        return 49;
                    }
                } else {
                    return 38;
                }

            },
            mygraphicwidth: function(feature) {
                if (feature.cluster) {
                    if (feature.cluster.length < 10) {
                        return feature.cluster.length + 24;
                    } else if (feature.cluster.length > 10) {
                        return 35;
                    }
                } else {
                    return 24;
                }
            },
            myfontweight: function(feature) {
                if (feature.cluster) {
                    return "bold";
                } else {
                    return "normal";
                }
            },
            myfontsize: function(feature) {
                return "14px";
            },
            mylabelalign: function(feature) {
                if (feature.cluster) {
                    return "cc";
                } else {
                    return "rb";
                }
            },
            mylabelxoffset: function(feature) {
                if (feature.cluster) {
                    return 0;
                } else {
                    return -16;
                }
            },
            mylabelyoffset: function(feature) {
                if (feature.cluster) {
                    return -4;
                } else {
                    return -9;
                }
            },
            myfontcolor: function(feature) {
                if (feature.cluster) {
                    return "#fff722";
                } else {
                    return "#000000";
                }
            },
            myicon: function(feature) {
                if (feature.cluster) {
                    return "images/building_1.png";
                } else {
                    return "images/building_1.png";
                }
            },
            labelbackground: function(feature) {
                if (feature.cluster) {
                    return;
                } else {
                    return "#0048a0";
                }
            },
            labelborder: function(feature) {
                if (feature.cluster) {
                    return;
                } else {
                    return "#d3e7ff";
                }
            },
            labeltext: function(feature) {
                if (dbkjs.modules.feature.showlabels) {
                    if (feature.cluster) {
                        var lbl_txt, c;
                        if (feature.cluster.length > 1) {
                            lbl_txt = feature.cluster.length + "";
                        } else {
                            //lbl_txt = feature.cluster[0].attributes.formelenaam;
                            lbl_txt = "";
                        }
                        return lbl_txt;
                    } else {
                        //return feature.attributes.formelenaam;
                        return "";
                    }
                } else {
                    return "";
                }
            }
        }
    }),
    /**
     * The layer that will hold the incidents
     */

    /**
     * The layer that will hold the incident sketches such as catchement areas and route
     */
    sketch: new OpenLayers.Layer.Vector("feature_sketch", {
        rendererOptions: {
            zIndexing: true
        }
    }),
    getActive: function() {
        var _obj = dbkjs.modules.feature;
        var feature;
        var _search_field = 'id';
        var _search_value;
        if (!dbkjs.util.isJsonNull(dbkjs.options.dbk)) {
            _search_field = 'id';
            _search_value = dbkjs.options.dbk;
        } else if (!dbkjs.util.isJsonNull(dbkjs.options.omsnummer)) {
            _search_field = 'OMSnummer';
            _search_value = dbkjs.options.omsnummer;
        }

        $.each(_obj.layer.features, function(fi, fv) {
            if (fv.cluster) {
                $.each(fv.cluster, function(ci, cv) {
                    if (cv.attributes[_search_field].toString() === _search_value) {
                        feature = cv;
                    }
                });
            } else {
                if (fv.attributes[_search_field].toString() === _search_value) {
                    feature = fv;
                }
            }
        });

        if (feature) {
            dbkjs.options.dbk = feature.attributes.id;
            dbkjs.modules.updateFilter(dbkjs.options.dbk);
            if (dbkjs.map.zoom < 13) {
                dbkjs.map.setCenter(feature.geometry.getBounds().getCenterLonLat(), 13);
            } else {
                dbkjs.map.setCenter(feature.geometry.getBounds().getCenterLonLat());
            }
        }
    },
    register: function(options) {
        var _obj = dbkjs.modules.feature;
        _obj.namespace = options.namespace || _obj.namespace;
        _obj.url = options.url || _obj.url;
        _obj.visibility = options.visible || _obj.visibility;
        _obj.layer = new OpenLayers.Layer.Vector("Feature", {
            rendererOptions: {
                zIndexing: true
            },
            strategies: [
                new OpenLayers.Strategy.Cluster({
                    distance: 60,
                    threshold: 2
                })
            ],
            minResolution: 1
        });
        _obj.layer.setZIndex(2006);
        _obj.sketch.setZIndex(2002);
        _obj.layer.styleMap = new OpenLayers.StyleMap({
            'default': _obj.defaultStyle,
            'select': _obj.selectStyle
        }),
        _obj.layer.displayInLayerSwitcher = false;
        _obj.sketch.displayInLayerSwitcher = false;
        dbkjs.map.addLayers([_obj.sketch, _obj.layer]);
        //Add the layer to the selectControl
        dbkjs.selectControl.setLayer((dbkjs.selectControl.layers || dbkjs.selectControl.layer).concat(_obj.layer));
        _obj.layer.events.on({
            "featureselected": _obj.getfeatureinfo,
            "featuresadded": function() {
                dbkjs.modules.feature.getActive();
            },
            "featureunselected": function(e) {
                $('#infopanel').hide();
            }
        });
        _obj.get();
    },
    get: function() {
        var _obj = dbkjs.modules.feature;
        var mydata = {};
        mydata.bbox = dbkjs.map.getExtent().toBBOX(0);
        mydata.time = new Date().getTime();
        mydata.service = "WFS";
        mydata.version = "1.0.0";
        mydata.request = "GetFeature";
        mydata.typename = _obj.namespace + ":dbkfeature_centroid";
        mydata.maxFeatures = 500;
        mydata.outputFormat = "json";
        //http://safetymaps.nl/geoserver/brabantnoord/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=brabantnoord:dbkfeature_centroid&maxFeatures=50&outputFormat=json
        $.ajax({
            type: "GET",
            url: _obj.url,
            data: mydata,
            dataType: "json",
            success: function(data) {
                var geojson_format = new OpenLayers.Format.GeoJSON();
                _obj.features = geojson_format.read(data);
                _obj.layer.addFeatures(_obj.features);
                _obj.search_dbk();
            },
            error: function() {
                return false;
            },
            complete: function() {
                return false;
            }
        });
    },
    featureInfohtml: function(feature) {
        var ret_title = $('<li></li>');
        ret_title.append('<a href="?regio=' + dbkjs.options.regio.id + '&dbk=' + feature.attributes.id + '">' + feature.attributes.formelenaam + '</a>');
        //var ret_val = $('<td class="dbk_feature" id="dbk_' + feature.attributes.id + '"></td>');
        //ret_val.html(feature.attributes.formelenaam);
        //ret_tr.append(ret_val);

        $(ret_title).click(function() {
            dbkjs.options.dbk = feature.attributes.id;
            dbkjs.modules.updateFilter(feature.attributes.id);
            if (dbkjs.map.zoom < 13) {
                dbkjs.map.setCenter(feature.geometry.getBounds().getCenterLonLat(), 13);
            } else {
                dbkjs.map.setCenter(feature.geometry.getBounds().getCenterLonLat());
            }
            return false;
        });
        return ret_title;
    },
    search_dbk: function() {
        var _obj = dbkjs.modules.feature;
        //Voeg de DBK objecten toe aan de typeahead set..
        var dbk_naam_array = [];

        $.each(_obj.features, function(key, value) {
            dbk_naam_array.push({
                value: value.attributes.formelenaam,
                geometry: value.geometry,
                id: value.attributes.id
            });
        });
        $('#search_input').typeahead({
            name: 'dbk',
            //prefetch: '../data/countries.json',
            local: dbk_naam_array,
            limit: 10
                    //template: '<p class="repo-language">{{name}}&nbsp;<i>({{identificatie}})</i></p>',
        });
        $('#search_input').bind('typeahead:selected', function(obj, datum) {
            //console.log(obj);
            //console.log(datum);
            dbkjs.options.dbk = datum.id;
            dbkjs.modules.updateFilter(datum.id);

            if (dbkjs.map.zoom < 13) {
                dbkjs.map.setCenter(datum.geometry.getBounds().getCenterLonLat(), 13);
            } else {
                dbkjs.map.setCenter(datum.geometry.getBounds().getCenterLonLat());
            }
        });
    },
    search_oms: function() {
        var _obj = dbkjs.modules.feature;
        var dbk_naam_array = [];

        $.each(_obj.features, function(key, value) {
            //alert(value.properties.formelenaam + ' (' + value.properties.identificatie_id + ')');
            if (!dbkjs.util.isJsonNull(value.attributes.OMSnummer)) {
                dbk_naam_array.push({
                    value: '' + value.attributes.OMSnummer + ' - ' + value.attributes.formelenaam,
                    geometry: value.geometry,
                    id: value.attributes.id
                });
            }
        });
        $('#search_input').typeahead({
            name: 'oms',
            //prefetch: '../data/countries.json',
            local: dbk_naam_array,
            limit: 10
                    //template: '<p class="repo-language">{{name}}&nbsp;<i>({{identificatie}})</i></p>',
        });
        $('#search_input').bind('typeahead:selected', function(obj, datum) {
            //console.log(obj);
            //console.log(datum);
            dbkjs.modules.updateFilter(datum.id);

            if (dbkjs.map.zoom < 13) {
                dbkjs.map.setCenter(datum.geometry.getBounds().getCenterLonLat(), 13);
            } else {
                dbkjs.map.setCenter(datum.geometry.getBounds().getCenterLonLat());
            }
        });
    },
    zoomToFeature: function(feature) {
        dbkjs.options.dbk = feature.attributes.id;
        dbkjs.modules.updateFilter(feature.attributes.id);
        if (dbkjs.map.zoom < 13) {
            dbkjs.map.setCenter(feature.geometry.getBounds().getCenterLonLat(), 13);
        } else {
            dbkjs.map.setCenter(feature.geometry.getBounds().getCenterLonLat());
        }
    },
    getfeatureinfo: function(e) {
        var _obj = dbkjs.modules.feature;
        if (typeof(e.feature) !== "undefined") {
            $('#infopanel_b').html('');
            if (e.feature.cluster) {
                if (e.feature.cluster.length === 1) {
                    _obj.zoomToFeature(e.feature.cluster[0]);
                } else {
                    $('#infopanel_f').append('<ul id="Pagination" class="pagination"></ul>');
                    $('#infopanel_f').show();
                    _obj.currentCluster = e.feature.cluster;
                    $("#Pagination").pagination(e.feature.cluster.length, {
                        items_per_page: 10,
                        callback: function(page_index, jq) {
                            // Get number of elements per pagionation page from form
                            var items_per_page = 10;
                            var max_elem = Math.min((page_index + 1) * items_per_page, _obj.currentCluster.length);

                            // Iterate through a selection of the content and build an HTML string
                            var item_ul = $('<ul class="nav nav-pills nav-stacked"></ul>');
                            $('#infopanel_b').html('');

                            for (var i = page_index * items_per_page; i < max_elem; i++)
                            {
                                item_ul.append(_obj.featureInfohtml(_obj.currentCluster[i]));
                            }
                            $('#infopanel_b').append(item_ul);
                        }
                    });
                    $('#infopanel').show(true);
                }
            } else {
                _obj.currentCluster = [];
                _obj.zoomToFeature(e.feature);
                $('#infopanel').hide();
            }
        }
    }
};
