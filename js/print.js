var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.print = {
    default: {
        "title": "mapfish print",
        "units": "degrees",
        "srs": "EPSG:4326",
        "layout": "A4 portrait",
        "dpi": 300,
        "layers": [
            {
                "baseURL": "http://demo.opengeo.org/geoserver/wms",
                "opacity": 1,
                "singleTile": false,
                "type": "WMS",
                "layers": [
                    "ne:ne"
                ],
                "format": "image/png;"


            }
        ],
        "pages": [
            {
                "title": "Mapfish Print",
                "rotation": 0,
                "mapTitle": "Mapfish Map",
                "comment": "This is a Mapfish map."
            }
        ]
    },
    layer: function(layer){
        //get information from the current baselayer
        var bl_type = layer.CLASS_NAME.split('.')[2];
        if (bl_type === "TMS") {
            //http://lib.heron-mc.org/geoext/1.1/lib/GeoExt/data/PrintProvider.js
            return {
                type: "TMS",
                baseURL: layer.url instanceof Array ?
                        layer.url[0] : map.baseLayer.url,
                opacity: layer.opacity,
                singleTile: layer.singleTile,
                maxExtent: layer.maxExtent.toArray(),
                tileSize: [
                    layer.tileSize.w,
                    layer.tileSize.h
                ],
                format: "png;", //fix for a old mapfish printing bug
                extension: layer.type,
                layer: layer.layername,
                resolutions: layer.resolutions,
                styles: [""]
            }
        }
    },
    print: function() {
        params = dbkjs.print.default;
        //bepaal de schaal
        
        params.pages[0].scale = 10000;
        //bepaal het crs
        params.srs = map.projection.getCode();
        params.units = map.projection.getUnits();
        //bepaal het centrumpunt
        params.pages[0].center = [map.getCenter().lon, map.getCenter().lat];
        params.layers.push(dbkjs.print.layer(map.baseLayer));
        //herhalen, maar nu voor de overlays
        $('#berichten').html('Print wordt verwerkt...');
        $.ajax({
            type: "POST",
            url: "geoserver/pdf/create.json",
            contentType: "application/json",
            data: JSON.stringify(params),
            dataType: "json",
            success: function(response) {
                window.location = response.getURL;
            },
            error: function(response) {
                alert(response.responseText);
            }

        });
    }
};
