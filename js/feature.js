var dbkfeature = {
    id: "dbkf",
    /**
     * URL naar een statisch boringen bestand in gml formaat
     */

    url: "/geoserver/zeeland/ows?",
    namespace: "zeeland",
    /**
     * Laag. Wordt geiniteerd met de functie dbkobject.show() kan worden overruled
     */
    highlightlayer: null,
    timer: null,
    showlabels: false,
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
                    return feature.cluster.length + 38;
                } else {
                    return 38;
                }

            },
            mygraphicwidth: function(feature) {
                if (feature.cluster) {
                    return feature.cluster.length + 24;
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
                if (feature.cluster) {
                    return "10px";
                } else {
                    return "9px";
                }
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
                if (this.showlabels === true) {
                    if (feature.cluster) {
                        var lbl_txt, c;
                        if (feature.cluster.length > 1) {
                            lbl_txt = feature.cluster.length + "";
                        } else {
                            lbl_txt = feature.cluster[0].attributes.formelenaam;
                        }
                        return lbl_txt;
                    } else {
                        return feature.attributes.formelenaam;
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
                    return feature.cluster.length + 38;
                } else {
                    return 38;
                }

            },
            mygraphicwidth: function(feature) {
                if (feature.cluster) {
                    return feature.cluster.length + 24;
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
                if (feature.cluster) {
                    return "10px";
                } else {
                    return "9px";
                }
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
                if (this.showlabels === true) {
                    if (feature.cluster) {
                        var lbl_txt, c;
                        if (feature.cluster.length > 1) {
                            lbl_txt = feature.cluster.length + "";
                        } else {
                            lbl_txt = feature.cluster[0].attributes.formelenaam;
                        }
                        return lbl_txt;
                    } else {
                        return feature.attributes.formelenaam;
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
    show: function() {
        this.layer = new OpenLayers.Layer.Vector("Feature", {
            rendererOptions: {
                zIndexing: true
            },
            strategies: [
                new OpenLayers.Strategy.Cluster({
                    distance: 50,
                    threshold: 5
                })
            ],
            minResolution: 6.72
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
            "featureunselected": function(e) {
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
                _this.layer.addFeatures(geojson_format.read(data));
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
        var ret_tr = $('<tr></tr>');
        var ret_title = $('<td></td>');
        ret_tr.append(ret_title);
        ret_title.append('<span class="infofieldtitle">' + feature.attributes.id + ' - </span>');
        var ret_val = $('<td class="dbk_feature" id="dbk_' + feature.attributes.id + '"></td>');
        ret_val.html(feature.attributes.formelenaam);
        ret_tr.append(ret_val);

        $(ret_tr).click(function() {
            map.setCenter(feature.geometry.getBounds().getCenterLonLat(),11);
            //console.log(feature);
        });
        return ret_tr;
    },
    getfeatureinfo: function(e) {
        if (typeof(e.feature) !== "undefined") {
            $('#infopanel').html('');
            if (e.feature.cluster) {

                $('#infopanel').append('<div style="float:left;width:100%;"><table id="Searchresult"></table></div>');
                $('#infopanel').append('<div id="Pagination" class="pagination" style="float:left;"></div>');
                dbkfeature.currentCluster = e.feature.cluster;
                $("#Pagination").pagination(e.feature.cluster.length, {
                    items_per_page: 20,
                    callback: function(page_index, jq) {
                        // Get number of elements per pagionation page from form
                        var items_per_page = 20;
                        var max_elem = Math.min((page_index + 1) * items_per_page, dbkfeature.currentCluster.length);

                        // Iterate through a selection of the content and build an HTML string
                        $('#Searchresult').html('');
                        for (var i = page_index * items_per_page; i < max_elem; i++)
                        {
                            $('#Searchresult').append(dbkfeature.featureInfohtml(dbkfeature.currentCluster[i]));
                        }
                    }
                });
            } else {
                $('#infopanel').append('<div style="float:left;width:100%;"><table id="Searchresult"></table></div>');
                $('#Searchresult').append(dbkfeature.featureInfohtml(e.feature));
                dbkfeature.currentCluster = [];
            }
            if (!$('#tb03').hasClass('close')) {
                $('#tb03').addClass('close');
            }
            $('#infopanel').toggle(true);
        }
    }
};
modules.push(dbkfeature);

