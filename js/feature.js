var dbkfeature = {
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
                    if (map.zoom < 10) {
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
                if (dbkfeature.showlabels) {
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
                if (dbkfeature.showlabels) {
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
    activateDBK: function(id) {
        //eenmalig afvuren wanneer een laag wordt geladen. Niet herhalen tijdens het in en uitzoomen!
        dbk = id;
        preparatie.updateFilter(id);
        preventie.updateFilter(id);
        gevaren.updateFilter(id);
        dbkobject.updateFilter(id);
        var feature;
        $.each(this.layer.features, function(fi, fv) {
            if (fv.cluster) {
                $.each(fv.cluster, function(ci, cv) {
                    if (cv.attributes.id.toString() === id) {
                        feature = cv;
                    }
                });
            }
            else {
                if (fv.attributes.id.toString() === id) {
                    feature = fv;
                }
            }
        });
        if (feature) {
            if (map.zoom < 13) {
                map.setCenter(feature.geometry.getBounds().getCenterLonLat(), 13);
            } else {
                map.setCenter(feature.geometry.getBounds().getCenterLonLat());
            }
        }

    },
    show: function() {
        this.layer = new OpenLayers.Layer.Vector("Feature", {
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
        this.layer.setZIndex(2006);
        this.sketch.setZIndex(2002);
        this.layer.styleMap = new OpenLayers.StyleMap({
            'default': this.defaultStyle,
            'select': this.selectStyle
        }),
        this.layer.displayInLayerSwitcher = false;
        this.sketch.displayInLayerSwitcher = false;
        map.addLayers([this.sketch, this.layer]);
        this.layer.events.on({
            "featureselected": this.getfeatureinfo,
            "featuresadded": function() {
                if (typeof(dbk) !== "undefined" && dbk !== '') {
                    dbkfeature.activateDBK(dbk);
                    //release the dbk object
                    dbk = '';
                }

            },
            "featureunselected": function(e) {
                $('#infopanel').hide();
            }
        });
        this.get();
    },
    get: function() {
        var mydata = {};
        mydata.bbox = map.getExtent().toBBOX(0);
        mydata.time = new Date().getTime();
        mydata.service = "WFS";
        mydata.version = "1.0.0";
        mydata.request = "GetFeature";
        mydata.typename = this.namespace + ":dbkfeature_centroid";
        mydata.maxFeatures = 500;
        mydata.outputFormat = "json";
        //http://safetymaps.nl/geoserver/brabantnoord/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=brabantnoord:dbkfeature_centroid&maxFeatures=50&outputFormat=json
        var _this = this;
        $.ajax({
            type: "GET",
            url: this.url,
            data: mydata,
            dataType: "json",
            success: function(data) {
                var geojson_format = new OpenLayers.Format.GeoJSON();
                dbkfeature.features = geojson_format.read(data);

                _this.layer.addFeatures(dbkfeature.features);
                dbkfeature.search_dbk();
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
        ret_title.append('<a href="?regio=' + regio.id + '&dbk=' + feature.attributes.id + '">' + feature.attributes.formelenaam + '</a>');
        //var ret_val = $('<td class="dbk_feature" id="dbk_' + feature.attributes.id + '"></td>');
        //ret_val.html(feature.attributes.formelenaam);
        //ret_tr.append(ret_val);

        $(ret_title).click(function() {
            dbk = feature.attributes.id;
            preparatie.updateFilter(feature.attributes.id);
            preventie.updateFilter(feature.attributes.id);
            gevaren.updateFilter(feature.attributes.id);
            dbkobject.updateFilter(feature.attributes.id);
            if (map.zoom < 13) {
                map.setCenter(feature.geometry.getBounds().getCenterLonLat(), 13);
            } else {
                map.setCenter(feature.geometry.getBounds().getCenterLonLat());
            }
            return false;
        });
        return ret_title;
    },
    search_dbk: function() {
        //Voeg de DBK objecten toe aan de typeahead set..
        var dbk_naam_array = [];

        $.each(dbkfeature.features, function(key, value) {
            //alert(value.properties.formelenaam + ' (' + value.properties.identificatie_id + ')');
            dbk_naam_array.push({
                value: value.attributes.formelenaam + ' ' + value.attributes.identificatie_id,
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
            dbk = datum.id;
            preparatie.updateFilter(datum.id);
            preventie.updateFilter(datum.id);
            gevaren.updateFilter(datum.id);
            dbkobject.updateFilter(datum.id);
            if (map.zoom < 13) {
                map.setCenter(datum.geometry.getBounds().getCenterLonLat(), 13);
            } else {
                map.setCenter(datum.geometry.getBounds().getCenterLonLat());
            }
        });
    },
    search_oms: function() {
        //Voeg de DBK objecten toe aan de typeahead set..
        var dbk_naam_array = [];

        $.each(dbkfeature.features, function(key, value) {
            //alert(value.properties.formelenaam + ' (' + value.properties.identificatie_id + ')');
            if (!isJsonNull(value.attributes.OMSnummer)) {
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
            preparatie.updateFilter(datum.id);
            preventie.updateFilter(datum.id);
            gevaren.updateFilter(datum.id);
            dbkobject.updateFilter(datum.id);
            if (map.zoom < 13) {
                map.setCenter(datum.geometry.getBounds().getCenterLonLat(), 13);
            } else {
                map.setCenter(datum.geometry.getBounds().getCenterLonLat());
            }
        });
    },
    zoomToFeature: function(feature) {
        dbk = feature.attributes.id;
        preparatie.updateFilter(feature.attributes.id);
        preventie.updateFilter(feature.attributes.id);
        gevaren.updateFilter(feature.attributes.id);
        dbkobject.updateFilter(feature.attributes.id);
        if (map.zoom < 13) {
            map.setCenter(feature.geometry.getBounds().getCenterLonLat(), 13);
        } else {
            map.setCenter(feature.geometry.getBounds().getCenterLonLat());
        }
    },
    getfeatureinfo: function(e) {
        if (typeof(e.feature) !== "undefined") {
            $('#infopanel_b').html('');
            if (e.feature.cluster) {
                if (e.feature.cluster.length === 1) {
                    dbkfeature.zoomToFeature(e.feature.cluster[0]);
                } else {
                    $('#infopanel_f').append('<ul id="Pagination" class="pagination"></ul>');
                    dbkfeature.currentCluster = e.feature.cluster;
                    $("#Pagination").pagination(e.feature.cluster.length, {
                        items_per_page: 10,
                        callback: function(page_index, jq) {
                            // Get number of elements per pagionation page from form
                            var items_per_page = 10;
                            var max_elem = Math.min((page_index + 1) * items_per_page, dbkfeature.currentCluster.length);

                            // Iterate through a selection of the content and build an HTML string
                            var item_ul = $('<ul class="nav nav-pills nav-stacked"></ul>');
                            $('#infopanel_b').html('');

                            for (var i = page_index * items_per_page; i < max_elem; i++)
                            {
                                item_ul.append(dbkfeature.featureInfohtml(dbkfeature.currentCluster[i]));
                            }
                            $('#infopanel_b').append(item_ul);
                        }
                    });
                    $('#infopanel').show(true);
                }
            } else {
                dbkfeature.currentCluster = [];
                dbkfeature.zoomToFeature(e.feature);
                $('#infopanel').hide();
            }
        }
    }
};
modules.push(dbkfeature);

