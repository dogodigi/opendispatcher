var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.config = dbkjs.config || {};
dbkjs.config.styles = {
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