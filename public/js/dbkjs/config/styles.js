var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.config = dbkjs.config || {};
dbkjs.config.styles = {
    dbkfeature: new OpenLayers.StyleMap({
       "default" : new OpenLayers.Style({
        graphicWidth: "${mygraphicwidth}",
        graphicHeight: "${mygraphicheight}",
        fontColor: "${myfontcolor}",
        fontSize: "${myfontsize}",
        fontWeight: "${myfontweight}",
        externalGraphic: "${myicon}",
        label: "${labeltext}",
        labelSelect: true,
        labelAlign: "${mylabelalign}",
        labelXOffset: "${mylabelxoffset}",
        labelYOffset: "${mylabelyoffset}"
    }, {
        context: {
            mygraphicheight: function(feature) {
                if (feature.cluster) {
                    if (feature.cluster.length < 10) {
                        return feature.cluster.length + 64;
                    } else {
                        return 65;
                    }
                } else {
                    if (feature.attributes.typeFeature === 'Object') {
                        return 38;
                    } else {
                        return 65;
                    }
                }

            },
            mygraphicwidth: function(feature) {
                if (feature.cluster) {
                    if (feature.cluster.length < 10) {
                        return feature.cluster.length + 84;
                    } else {
                        return 85;
                    }
                } else {
                    if (feature.attributes.typeFeature === 'Object') {
                        return 24;
                    } else {
                        return 85;
                    }
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
                    return "images/jcartier_city_3.png";
                } else {
                    if (feature.attributes.typeFeature === 'Object') {
                        return "images/jcartier_building_1.png";
                    } else {
                        return "images/jcartier_event_1.png";
                    }
                }
            },
            labeltext: function(feature) {
                if (dbkjs.modules.feature.showlabels) {
                    if (feature.cluster) {
                        var lbl_txt, c;
                        if (feature.cluster.length > 1) {
                            lbl_txt = feature.cluster.length + "";
                        } else {
                            //lbl_txt = feature.cluster[0].attributes.formeleNaam;
                            lbl_txt = "";
                        }
                        return lbl_txt;
                    } else {
                        //return feature.attributes.formeleNaam;
                        return "";
                    }
                } else {
                    return "";
                }
            }
        }
    }),
    "select": new OpenLayers.Style({
        fontColor: "${myfontcolor}"
    }, {
        context: {
            myfontcolor: function(feature) {
                if (feature.cluster) {
                    return "#fff722";
                } else {
                    return "#000000";
                }
            }
        }
    })
    }),
    dbkpand: new OpenLayers.StyleMap({
        'default': new OpenLayers.Style({
            fillColor: "#66FF66",
            fillOpacity: 0.4,
            strokeColor: "#66FF66",
            strokeWidth: 1
        }),
        'select': new OpenLayers.Style({
            strokeWidth: 12
        })
    }),
    dbkcompartiment: new OpenLayers.StyleMap({
        'default': new OpenLayers.Style({
            strokeColor: "${mycolor}",
            strokeWidth: 4,
            strokeLinecap : "square", 
            strokeDashstyle: "2 8"
        }, {
        context: {
            mycolor: function(feature) {
                switch(feature.attributes.type) {
                    case "30 minuten brandwerende scheiding":
                        return "#c1001f";
                        break;
                    case "60 minuten brandwerende scheiding":
                        return "#5da03b";
                        break;
                    case "Rookwerende scheiding":
                        return "#009cdd";
                        break;
                    default:
                        return "#000000";
                }
 
            },
            mystrokedashstyle: function(feature) {
                
            }
        }
    }),
        'select': new OpenLayers.Style({
            strokeWidth: 12
        })
    }),    
    pandstylemap : new OpenLayers.StyleMap({
        fillColor: "yellow",
        fillOpacity: 0.4,
        strokeColor: "red",
        strokeWidth: 2,
        pointRadius: 5
    }),
    vbostylemap: new OpenLayers.StyleMap({
        fillColor: "black",
        fillOpacity: 0.4,
        strokeColor: "black",
        strokeWidth: 1,
        pointRadius: 3
    }),
    brandweervoorziening: new OpenLayers.StyleMap({
        "default": new OpenLayers.Style({
            pointRadius: 10,
            externalGraphic: "${myicon}",
            rotation: "${myrotation}"
        }, {
            context: {
                myicon: function(feature) {
                    return "images/nen1414/" + feature.attributes.type + ".png";
                },
                myrotation: function(feature) {
                    if(feature.attributes.rotation){
                        return -feature.attributes.rotation;
                    } else {
                        return 0;
                    }
                }
            }
        }), 'select': new OpenLayers.Style({
            pointRadius: 40
        })
    }),
    gevaarlijkestof: new OpenLayers.StyleMap({
        "default": new OpenLayers.Style({
            pointRadius: 10,
            externalGraphic: "${myicon}"
        }, {
            context: {
                myicon: function(feature) {
                    return "images/eughs/" + feature.attributes.type + ".png";
                }
            }
        }), 'select': new OpenLayers.Style({
            pointRadius: 40
        })
    })
};