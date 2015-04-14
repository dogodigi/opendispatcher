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
dbkjs.config = dbkjs.config || {};
OpenLayers.Renderer.symbol.arrow = [0,2, 1,0, 2,2, 1,0, 0,2];

// Factor to scale styling elements with
dbkjs.getStyleScaleFactor = function() {
    if(!dbkjs.options.styleScaleAdjust) {
        return 1;
    } else {
        dbkjs.options.originalScale = dbkjs.options.originalScale ? dbkjs.options.originalScale : 595.2744;
        return dbkjs.options.originalScale / dbkjs.map.getScale();
    }
};

dbkjs.redrawScaledLayers = function() {
    dbkjs.protocol.jsonDBK.layerBrandcompartiment.redraw();
    dbkjs.protocol.jsonDBK.layerHulplijn2.redraw();
    dbkjs.protocol.jsonDBK.layerHulplijn1.redraw();
    dbkjs.protocol.jsonDBK.layerHulplijn.redraw();
    dbkjs.protocol.jsonDBK.layerToegangterrein.redraw();
    dbkjs.protocol.jsonDBK.layerBrandweervoorziening.redraw();
    dbkjs.protocol.jsonDBK.layerGevaarlijkestof.redraw();
    dbkjs.protocol.jsonDBK.layerTekstobject.redraw();
};

// Return a styling value with user size adjustment and scaled according to map
// map scale (if style scaling is enabled). If featureAttributeValue is not
// undefined use that instead of the first argument. If attributeScaleFactor
// is not undefined scale the featureAttributeValue by that factor.
dbkjs.scaleStyleValue = function(value, featureAttributeValue, attributeScaleFactor) {
    if(featureAttributeValue !== undefined) {
        attributeScaleFactor = attributeScaleFactor ? attributeScaleFactor : 1;
        value = featureAttributeValue * attributeScaleFactor;
    }
    value = value + (dbkjs.options.styleSizeAdjust ? dbkjs.options.styleSizeAdjust : 0);
    return value * dbkjs.getStyleScaleFactor();

};

dbkjs.config.styles = {
    dbkfeature: new OpenLayers.StyleMap({
       "default" : new OpenLayers.Style({
        cursor: "pointer",
        display: "${mydisplay}",
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
        labelYOffset: "${mylabelyoffset}",
        labelOutlineWidth: 5,
        labelOutlineColor: '#000000'
    }, {
        context: {
            mydisplay: function(feature) {
                if(dbkjs.map.getResolution() > 1) {
                    // pandgeometrie not visible above resolution 1, always show feature icon
                    return "true";
                } else {
                    if(dbkjs.options.alwaysShowDbkFeature) {
                        // Always show feature except the active feature

                        if(dbkjs.options.dbk && feature.attributes.identificatie === dbkjs.options.dbk) {
                            return "none";
                        } else {
                            // Controleer of actieve DBK  meerdere verdiepingen heeft
                            // en feature om display van te bepalen niet het hoofdobject
                            // is van de actieve DBK. Zo ja, dan niet tonen

                                                        // Gebied heeft geen verdiepingen
                            if(dbkjs.options.feature && dbkjs.options.feature.verdiepingen && dbkjs.options.feature.verdiepingen.length > 1) {
                                // Het ID van de dbk waarvan we de display property
                                // bepalen
                                var verdiepingCheckDbkId = feature.attributes.identificatie;

                                // Loop over alle verdiepingen van actieve feature en check
                                // of verdieping id overeenkomt met dbkId
                                for(var i = 0; i < dbkjs.options.feature.verdiepingen.length; i++) {
                                    var verdieping = dbkjs.options.feature.verdiepingen[i];
                                    if(verdieping.identificatie === verdiepingCheckDbkId) {
                                        return "none";
                                    }
                                }
                            }

                            return "true";
                        }
                    } else {
                        // User should switch layer "Naburige DBK's" on (if configured)
                        return "none";
                    }
                }
            },
            mygraphicheight: function(feature) {
                if (feature.cluster) {
                    return 56;
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
                    return 51;
                } else {
                    if (feature.attributes.typeFeature === 'Object') {
                        return 21;
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
                return "16px";
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
                    return typeof imagesBase64 === 'undefined' ? dbkjs.basePath + "images/cluster.png" : imagesBase64["images/cluster.png"];
                } else {
                    if (feature.attributes.typeFeature === 'Object') {
                        var img;
                        if(feature.attributes.verdiepingen || feature.attributes.verdiepingen !== 0) {
                            img = "images/meerdereverdiepingen.png";
                        }  else {
                            img = "images/enkeleverdieping.png";
                        }
                        return typeof imagesBase64 === 'undefined'  ? dbkjs.basePath + img : imagesBase64[img];
                    } else {
                        return typeof imagesBase64 === 'undefined'  ? dbkjs.basePath + "images/jcartier_event_1.png" : imagesBase64["images/jcartier_event_1.png"];
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
            fillColor: "${mycolor}",
            fillOpacity: 0.2,
            strokeColor: "${mycolor}",
            strokeWidth: 1
        },{
            context:{
                mycolor: function(feature) {
                    if (feature.attributes.type) {
                        if (feature.attributes.type === "gebied"){
                            return "#B45F04";
                        } else {
                            return "#66ff66";
                        }
                    } else {
                        return "#66ff66";
                    }
                }
            }
        }),
        'select': new OpenLayers.Style({
            strokeWidth: 4,
            fillOpacity: 0.7
        }),
        'temporary': new OpenLayers.Style({
            strokeWidth: 3,
            fillOpacity: 0.4
        })
    }),
    dbkcompartiment: new OpenLayers.StyleMap({
        'default': new OpenLayers.Style({
            strokeColor: "${mycolor}",
            strokeWidth: "${mystrokewidth}",
            strokeLinecap : "butt",
            strokeDashstyle: "${mystrokedashstyle}",
            fontColor: "${mycolor}",
            pointRadius: 5,
            fontSize: "12px",
            fontWeight: "bold",
            labelSelect: true,
            labelOutlineColor: "#ffffff",
            labelOutlineWidth: 1,
            label: "${mylabel}"
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
                    case "> 60 minuten brandwerende scheiding":
                        return "#ff0000";
                        break;
                    case "Rookwerende scheiding":
                        return "#009cdd";
                        break;
                    default:
                        return "#000000";
                }

            },
            mystrokewidth: function(feature) {
                switch(feature.attributes.type) {
                    case "60 minuten brandwerende scheiding":
                    case "> 60 minuten brandwerende scheiding":
                        return dbkjs.scaleStyleValue(4);
                        break;
                    default:
                        return dbkjs.scaleStyleValue(2);
                }

            },
            mystrokedashstyle: function(feature) {
                switch(feature.attributes.type) {
                    case "30 minuten brandwerende scheiding":
                        return dbkjs.scaleStyleValue(8) + " " + dbkjs.scaleStyleValue(4);
                        break;
                    case "60 minuten brandwerende scheiding":
                        return dbkjs.scaleStyleValue(4) + " " + dbkjs.scaleStyleValue(4);
                        break;
                    case "> 60 minuten brandwerende scheiding":
                        return "solid";
                        break;
                    case "Rookwerende scheiding":
                        return dbkjs.scaleStyleValue(8) + " " + dbkjs.scaleStyleValue(4) + dbkjs.scaleStyleValue(2) + " " + dbkjs.scaleStyleValue(4);
                        break;
                    default:
                        return dbkjs.scaleStyleValue(10) + " " + dbkjs.scaleStyleValue(10);
                }
            },
            mylabel: function(feature) {
                if(feature.attributes.label){
                    return feature.attributes.label;
                } else {
                    return "";
                }
            }
        }
    }),
    "temporary": new OpenLayers.Style({strokeColor: "#009FC3"}),
    "select": new OpenLayers.Style({strokeColor: "#8F00C3"})
    }),
    hulplijn: new OpenLayers.StyleMap({
        'default': new OpenLayers.Style({
            strokeColor: "${mycolor}",
            strokeLinecap : "butt",
            strokeDashstyle: "${mydash}",
            fillColor: "${mycolor}",
            fillOpacity: "${myopacity}",
            strokeWidth: "${mywidth}",
            pointRadius: 5,
            rotation: "${myrotation}",
            graphicName: "${mygraphic}",
            label: "${information}"
        }, {
        context: {
            myopacity: function(feature){
                switch(feature.attributes.type) {
                    case "Arrow":
                        return 0.8;
                        break;
                    default:
                        return 1;
                }
            },
            myrotation: function(feature) {
                if(feature.attributes.rotation){
                    return -feature.attributes.rotation;
                } else {
                    return 0;
                }
            },
            mywidth: function(feature){
                switch(feature.attributes.type) {
                    case "Conduit":
                    case "Gate":
                    case "Fence":
                    case "Fence_O":
                        return dbkjs.scaleStyleValue(8);
                        break;
                     case "HEAT":
                        return dbkjs.scaleStyleValue(3);
                        break;
                    case "Broken":
                        return dbkjs.scaleStyleValue(1);
                        break;
                    case "Arrow":
                    default:
                        return dbkjs.scaleStyleValue(2);
               }
            },
            mydash: function(feature) {
                switch(feature.attributes.type) {
                    case "Cable":
                    case "Bbarrier":
                        return dbkjs.scaleStyleValue(10) + " " + dbkjs.scaleStyleValue(10);
                        break;
                    case "Conduit":
                    case "Gate":
                    case "Fence":
                    case "Fence_O":
                        return dbkjs.scaleStyleValue(1) + " " + dbkjs.scaleStyleValue(20);
                        break;
                    case "Broken":
                        return dbkjs.scaleStyleValue(3) + " " + dbkjs.scaleStyleValue(2);
                        break;
                    default:
                        return "solid";
                }
            },
            mycolor: function(feature) {
                switch(feature.attributes.type) {
                    //Bbarrier
                    //Gate
                    case "Bbarrier":
                        return "#ffffff";
                        break;
                    case "Arrow":
                        return "#040404";
                        break;
                    case "Gate":
                    case "Fence":
                        return "#000000";
                        break;
                    case "Fence_O":
                        return "#ff7f00";
                        break;
                    case "Cable":
                        return "#ffff00";
                        break;
                    case "Conduit":
                        return "#ff00ff";
                        break;
                    case "HEAT":
                        return "#ff0000";
                        break;
                    default:
                        return "#000000";
                }

            },
            mygraphic: function(feature) {
                switch(feature.attributes.type) {
                    case "Arrow":
                        return "triangle";
                        break;
                    default:
                        return "";
                }

            }
        }
    }),
    "temporary": new OpenLayers.Style({strokeColor: "#009FC3"}),
    "select": new OpenLayers.Style({strokeColor: "#8F00C3"})
    }),
    hulplijn1: new OpenLayers.StyleMap({
        'default': new OpenLayers.Style({
            strokeColor: "${mycolor}",
            strokeDashstyle: "${mydash}",
            strokeWidth: "${mywidth}"
        }, {
        context: {
            mywidth: function(feature){
                switch(feature.attributes.type) {
                    case "Cable":
                    case "Bbarrier":
                        return dbkjs.scaleStyleValue(4);
                        break;
                    case "Conduit":
                    case "Gate":
                    case "Fence":
                    case "Fence_O":
                        return dbkjs.scaleStyleValue(2);
                        break;
                    default:
                        return dbkjs.scaleStyleValue(2);
                }
            },
            mydash: function(feature) {
                switch(feature.attributes.type) {
                    default:
                        return "none";
                }
            },
            mycolor: function(feature) {
                switch(feature.attributes.type) {
                    case "Conduit":
                        return "#ff00ff";
                        break;
                    case "Bbarrier":
                        return "#ff0000";
                        break;
                    case "Gate":
                        return "#ffffff";
                        break;
                    case "Fence_O":
                        return "#ff7f00";
                        break;
                    default:
                        return "#000000";
                }
            }
        }
    }),
    "temporary": new OpenLayers.Style({strokeColor: "#009FC3"}),
    "select": new OpenLayers.Style({strokeColor: "#8F00C3"})
    }),
    hulplijn2: new OpenLayers.StyleMap({
        'default': new OpenLayers.Style({
            strokeColor: "${mycolor}",
            strokeDashstyle: "${mydash}",
            strokeWidth: "${mywidth}"
        }, {
        context: {
            mywidth: function(feature){
                switch(feature.attributes.type) {
                     case "Gate":
                        return dbkjs.scaleStyleValue(5);
                        break;
                    default:
                        return dbkjs.scaleStyleValue(2);
                }
            },
            mydash: function(feature) {
                switch(feature.attributes.type) {
                    case "Gate":
                        return "none";
                        break;
                    default:
                        return "none";
                }
            },
            mycolor: function(feature) {
                switch(feature.attributes.type) {
                     case "Gate":
                        return "#000000";
                        break;
                    default:
                        return "#000000";
                }
            }
        }
    }),
    "temporary": new OpenLayers.Style({strokeColor: "#009FC3"}),
    "select": new OpenLayers.Style({strokeColor: "#8F00C3"})
    }),
    toegangterrein: new OpenLayers.StyleMap({
        'default': new OpenLayers.Style({
            strokeColor: "${mycolor}",
            fillColor: "${mycolor}",
            fillOpacity: 0.9,
            strokeWidth: "${mywidth}",
            pointRadius: 5,
            rotation: "${myrotation}",
            graphicName: "${mygraphic}"
        }, {
        context: {
            myrotation: function(feature) {
                if(feature.attributes.rotation){
                    return -feature.attributes.rotation;
                } else {
                    return 0;
                }
            },
            mycolor: function(feature) {
                switch(feature.attributes.primary) {
                    case true:
                        return "#ff0000";
                        break;
                    default:
                        return "#00ff00";
                }

            },
            mygraphic: function(feature) {
                return "triangle";
            },
            mywidth: function(feature) {
                return dbkjs.scaleStyleValue(1);
            }
        }
    }),
        'select': new OpenLayers.Style({

        }), 'temporary': new OpenLayers.Style({

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
            pointRadius: "${myradius}",
            externalGraphic: "${myicon}",
            rotation: "${myrotation}",
            display: "${mydisplay}"
        }, {
            context: {
                myicon: function(feature) {
                    var img = "images/" + feature.attributes.namespace + "/" + feature.attributes.type + ".png";
                    return typeof imagesBase64 === 'undefined'  ? dbkjs.basePath + img : imagesBase64[img];
                },
                myrotation: function(feature) {
                    if(feature.attributes.rotation){
                        return -feature.attributes.rotation;
                    } else {
                        return 0;
                    }
                },
                myradius: function(feature){
                    return dbkjs.scaleStyleValue(12, feature.radius);
                },
                mydisplay: function(feature) {
                    if(dbkjs.options.visibleCategories
                    && feature.attributes.category
                    && dbkjs.options.visibleCategories[feature.attributes.category] === false) {
                        return "none";
                    } else {
                        // any string except "none" works here
                        return "true";
                    }
                }
            }
        }), 'select': new OpenLayers.Style({
            pointRadius: "${myradius}"
        }, {
            context: {
                myradius: function(feature) {
                    return dbkjs.scaleStyleValue(20, feature.radius, 1.66);
                }
            }
        }), 'temporary': new OpenLayers.Style({
            pointRadius: "${myradius}"
         }, {
            context: {
                myradius: function(feature){
                    return dbkjs.scaleStyleValue(24, feature.radius, 2);
                }
            }
        })
    }),
    gevaarlijkestof: new OpenLayers.StyleMap({
        "default": new OpenLayers.Style({
            pointRadius: "${myradius}",
            externalGraphic: "${myicon}"
        }, {
            context: {
                myradius: function(feature){
                    return dbkjs.scaleStyleValue(12);
                },
                myicon: function(feature) {
                    var img = "images/" + feature.attributes.namespace + "/" + feature.attributes.type + ".png";
                    return typeof imagesBase64 === 'undefined' ? dbkjs.basePath + img : imagesBase64[img];
                    }
                }
        }), 'select': new OpenLayers.Style({
            pointRadius: "${myradius}"
        }, {
            context: {
                myradius: function(feature) {
                    return dbkjs.scaleStyleValue(20);
                }
            }
        }), 'temporary': new OpenLayers.Style({
            pointRadius: "${myradius}"
        }, {
            context: {
                myradius: function(feature) {
                    return dbkjs.scaleStyleValue(25);
                }
            }
        })
    }),
    tekstobject: new OpenLayers.StyleMap({
        "default": new OpenLayers.Style({
            pointRadius: 0,
            fontSize: "${mysize}",
            label: "${title}",
            rotation: "${myRotation}",
            labelSelect: true,
            labelOutlineColor: "#ffffff",
            labelOutlineWidth: 1
        }, {
            context: {
                mysize: function(feature) {
                    return dbkjs.scaleStyleValue(12, feature.scale);
                },
                myRotation: function(feature){
                    if(parseFloat(feature.attributes.rotation) !== 0.0){
                        var ori = parseFloat(feature.attributes.rotation);
                        return -ori;
                    } else {
                        return parseFloat(0);
                    }
                }
            }
        }),
        'select': new OpenLayers.Style({}),
        'temporary': new OpenLayers.Style({})
    })
};
