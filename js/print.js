var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.print = {
    url: null,
    capabilities: null,
    method: "POST",
    encoding: document.charset || document.characterSet || "UTF-8",
    timeout: 30000,
    customParams: null,
    scales: null,
    dpis: null,
    layouts: null,
    dpi: null,
    layout: null,
    //constructor
    // apply config
    // initialize events

    /** 
     * @name method[setLayout]
     * @param layout {string}
     * @description Sets the layout for this printProvider.
     */
    setLayout: function(layout) {
        this.layout = layout;

    },
    /**
     * @name method[setDpi]
     * @param dpi {integer}
     * @description Sets the dpi for this printProvider.
     */
    setDpi: function(dpi) {
        this.dpi = dpi;
        this.fireEvent("dpichange", this, dpi);
    },
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
    layer: function(layer) {
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
            };
        }
    },
    /**
     * @name print
     * @description 
     *   Sends the print command to the print service
     *   and opens a new window
     *   with the resulting PDF.
     *   
     * @param {OpenLayers.Map} map
     * @param {Array} pages
     * @param {Object} options
     */
    print: function(map, pages, options) {
        pages = pages instanceof Array ? pages : [pages];
        options = options || {};
        var jsonData = $.extend({
            units: map.getUnits(),
            srs: map.baseLayer.projection.getCode(),
            layout: this.layout.name,
            dpi: this.dpi.value
        }, this.customParams);
        
        var pagesLayer = pages[0].feature.layer;
        var encodedLayers = [];
        
        $.each(layers, function(index, layer){
            if(layer !== pagesLayer && layer.getVisibility() === true) {
                var enc = this.encodeLayer(layer);
                enc && encodedLayers.push(enc);
            }
        }, $.proxy(this));
        jsonData.layers = encodedLayers;
        var encodedPages = [];
        // ensure that the baseLayer is the first one in the encoded list
        var layers = map.layers.concat();
        layers.remove(map.baseLayer);
        layers.unshift(map.baseLayer);
        
        
        
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
