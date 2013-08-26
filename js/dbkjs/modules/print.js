var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
$.browser = {};
$.browser.mozilla = /mozilla/.test(navigator.userAgent.toLowerCase()) && !/webkit    /.test(navigator.userAgent.toLowerCase());
$.browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase());
$.browser.opera = /opera/.test(navigator.userAgent.toLowerCase());
$.browser.msie = /msie/.test(navigator.userAgent.toLowerCase());
dbkjs.modules.print = {
    url: "/geoserver/pdf/",
    options: {
        "units": "degrees",
        "srs": "EPSG:4326",
        "layout": "A4 portrait",
        "dpi": 75,
        "mapTitle": "Printing Demo",
        "comment": "This is a map printed from GeoExt.",
        "layers": [{
                "baseURL": "http://demo.opengeo.org/geoserver/wms",
                "opacity": 1,
                "singleTile": true, "type": "WMS", "layers": ["topp:tasmania_state_boundaries"],
                "format": "image/jpeg", "styles": [""]}],
        "pages": [{"center": [146.56, -41.56], "scale": 4000000, "rotation": 0}]},
    register: function(){
        //$('#btngrp_3').append('<a id="btn_print" class="btn btn-default navbar-btn" href="#"><i class="icon-print"></i></a>');
        //$('#btn_print').click(function(){
        //    dbkjs.modules.print.printdirect();
        //});
    },
    capabilities: null,
    method: "POST",
    customParams: null,
    scales: null,
    dpis: null,
    layouts: null,
    dpi: null,
    layout: null,
    encoding: document.charset || document.characterSet || "UTF-8",
    options: {
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
    timeout: 30000,
    setLayout: function(layout) {
        this.layout = layout;
    },
    setDpi: function(dpi) {
        this.dpi = dpi;
    },
    printdirect: function(map, pages, options) {
        var pages = pages || [
            {
                "title": "Mapfish Print",
                "rotation": 0,
                "mapTitle": "Mapfish Map",
                "comment": "This is a Mapfish map."
            }
        ];
        dbkjs.modules.print.loadCapabilities(function(capabilities) {
            dbkjs.modules.print.setLayout(dbkjs.modules.print.capabilities.layouts[0]);
            dbkjs.modules.print.setDpi(dbkjs.modules.print.capabilities.dpis[0]);
            dbkjs.modules.print.print(map, pages, options);
        });

    },
    print: function(map, pages, options) {
        var _obj = dbkjs.modules.print;
        pages = pages instanceof Array ? pages : [pages];
        options = options || {};
        var jsonData = $.extend({
            units: map.getUnits(),
            srs: map.baseLayer.projection.getCode(),
            layout: _obj.layout.name,
            dpi: _obj.dpi.value
        }, _obj.customParams);

        // feature wordt gebruikt voor de extent van de kaart.. Ik moet nog even uitvinden hoe..
        //var pagesLayer = pages[0].feature.layer;
        var encodedLayers = [];

        // ensure that the baseLayer is the first one in the encoded list
        var layers = map.layers.concat(); //concat results in a new array
        //layers.remove(map.baseLayer);
        //layers.unshift(map.baseLayer);

        $.each(layers, function(layer_idx, layer) {
            if (
                    //layer !== pagesLayer && 
            layer.getVisibility() === true) {
                var enc = _obj.encodeLayer(layer);
                enc && encodedLayers.push(enc);
            }
        });
        jsonData.layers = encodedLayers;

        var encodedPages = [];
        $.each(pages, function(page_idx, page) {
            encodedPages.push(
                    $.extend({
                center: [page.center.lon, page.center.lat],
                scale: page.scale.get("value"),
                rotation: page.rotation
            }, page.customParams)
                    );
        });
        jsonData.pages = encodedPages;

        if (options.overview) {
            var encodedOverviewLayers = [];
            $.each(options.overview.layers, function(layer) {
                var enc = _obj.encodeLayer(layer);
                enc && encodedOverviewLayers.push(enc);
            });
            jsonData.overviewLayers = encodedOverviewLayers;
        }
//        if (options.legend) {
//            var legend = options.legend;
//            var rendered = legend.rendered;
//            if (!rendered) {
//                legend = legend.cloneConfig({
//                    renderTo: document.body,
//                    hidden: true
//                });
//            }
//            var encodedLegends = [];
//            legend.items && legend.items.each(function(cmp) {
//                if (!cmp.hidden) {
//                    var encFn = this.encoders.legends[cmp.getXType()];
//                    // MapFish Print doesn't currently support per-page
//                    // legends, so we use the scale of the first page.
//                    encodedLegends = encodedLegends.concat(
//                            encFn.call(this, cmp, jsonData.pages[0].scale));
//                }
//            }, this);
//            if (!rendered) {
//                legend.destroy();
//            }
//            jsonData.legends = encodedLegends;
//        }
        $.ajax({
            type: _obj.method,
            url: _obj.url + "create.json",
            contentType: "application/json",
            data: jsonData,
            dataType: "json",
            success: function(response) {
                window.location = response.getURL;
            },
            error: function(response) {
                alert(response.responseText);
            }
        });
    },
    download: function(url) {
        window.open(url);
    },
    loadCapabilities: function(callback) {
        var _obj = dbkjs.modules.print;
        if (!_obj.url) {
            return;
        }
        var url = _obj.url + "info.json";
        $.ajax({
            url: url,
            type: "GET",
            data: "",
            success: function(response) {
                _obj.capabilities = response;
                console.log(_obj.capabilities);
                //_obj.loadStores();
                if (callback) {
                    callback.call();
                }
            },
            error: function(response) {
                alert(response.responseText);
            }
        });

    },
    /** private: method[loadStores]
     */
//    loadStores: function() {
//        var _obj = dbkjs.modules.print;
//        _obj.scales.loadData(_obj.capabilities);
//        _obj.dpis.loadData(_obj.capabilities);
//        _obj.layouts.loadData(_obj.capabilities);
//
//        _obj.setLayout(_obj.layouts.getAt(0));
//        _obj.setDpi(_obj.dpis.getAt(0));
//        this.fireEvent("loadcapabilities", this, this.capabilities);
//    },
    encodeLayer: function(layer) {
        var _obj = dbkjs.modules.print;
        var encLayer;
        for (var c in _obj.encoders.layers) {
            if (OpenLayers.Layer[c] && layer instanceof OpenLayers.Layer[c]) {
                encLayer = _obj.encoders.layers[c].call(_obj, layer);
                break;
            }
        }
        // only return the encLayer object when we have a type. Prevents a
        // fallback on base encoders like HTTPRequest.
        return (encLayer && encLayer.type) ? encLayer : null;
    },
    encoders: {
        "layers": {
            "Layer": function(layer) {
                var enc = {};
                if (layer.options && layer.options.maxScale) {
                    enc.minScaleDenominator = layer.options.maxScale;
                }
                if (layer.options && layer.options.minScale) {
                    enc.maxScaleDenominator = layer.options.minScale;
                }
                return enc;
            },
            "WMS": function(layer) {
                var enc = dbkjs.modules.print.encoders.layers.HTTPRequest.call(dbkjs.modules.print, layer);
                enc.singleTile = layer.singleTile;
                $.extend({
                    type: 'WMS',
                    layers: [layer.params.LAYERS].join(",").split(","),
                    format: layer.params.FORMAT,
                    styles: [layer.params.STYLES].join(",").split(","),
                    singleTile: layer.singleTile
                }, enc);
                var param;
                for (var p in layer.params) {
                    param = p.toLowerCase();
                    if (layer.params[p] !== null && !layer.DEFAULT_PARAMS[param] &&
                            "layers,styles,width,height,srs".indexOf(param) === -1) {
                        if (!enc.customParams) {
                            enc.customParams = {};
                        }
                        enc.customParams[p] = layer.params[p];
                    }
                }
                return enc;
            },
            "OSM": function(layer) {
                var enc = dbkjs.modules.print.encoders.layers.TileCache.call(dbkjs.modules.print, layer);
                return $.extend({
                    type: 'OSM',
                    baseURL: enc.baseURL.substr(0, enc.baseURL.indexOf("$")),
                    extension: "png"
                }, enc);
            },
            "TMS": function(layer) {
                var enc = dbkjs.modules.print.encoders.layers.TileCache.call(dbkjs.modules.print, layer);
                return $.extend({
                    type: 'TMS',
                    format: layer.type
                }, enc);
            },
            "TileCache": function(layer) {
                var enc = dbkjs.modules.print.encoders.layers.HTTPRequest.call(dbkjs.modules.print, layer);
                return $.extend({
                    type: 'TileCache',
                    layer: layer.layername,
                    maxExtent: layer.maxExtent.toArray(),
                    tileSize: [layer.tileSize.w, layer.tileSize.h],
                    extension: layer.extension,
                    resolutions: layer.serverResolutions || layer.resolutions
                }, enc);
            },
            "WMTS": function(layer) {
                var enc = dbkjs.modules.print.encoders.layers.HTTPRequest.call(dbkjs.modules.print, layer);
                enc = $.extend({
                    type: 'WMTS',
                    layer: layer.layer,
                    version: layer.version,
                    requestEncoding: layer.requestEncoding,
                    style: layer.style,
                    dimensions: layer.dimensions,
                    params: layer.params,
                    matrixSet: layer.matrixSet
                }, enc);
                if (layer.matrixIds) {
                    if (layer.requestEncoding === "KVP") {
                        enc.format = layer.format;
                    }
                    enc.matrixIds = [];
                    $.each(layer.matrixIds, function(matrixId_idx, matrixId) {
                        enc.matrixIds.push({
                            identifier: matrixId.identifier,
                            matrixSize: [matrixId.matrixWidth, matrixId.matrixHeight],
                            resolution: matrixId.scaleDenominator * 0.28E-3 / OpenLayers.METERS_PER_INCH / OpenLayers.INCHES_PER_UNIT[layer.units],
                            tileSize: [matrixId.tileWidth, matrixId.tileHeight],
                            topLeftCorner: [matrixId.topLeftCorner.lon, matrixId.topLeftCorner.lat]
                        });
                    });
                    return enc;
                }
                else {
                    return $.extend({
                        formatSuffix: layer.formatSuffix,
                        tileOrigin: [layer.tileOrigin.lon, layer.tileOrigin.lat],
                        tileSize: [layer.tileSize.w, layer.tileSize.h],
                        maxExtent: (layer.tileFullExtent !== null) ? layer.tileFullExtent.toArray() : layer.maxExtent.toArray(),
                        zoomOffset: layer.zoomOffset,
                        resolutions: layer.serverResolutions || layer.resolutions
                    }, enc);
                }
            },
            "KaMapCache": function(layer) {
                var enc = dbkjs.modules.print.encoders.layers.KaMap.call(dbkjs.modules.print, layer);
                return $.extend({
                    type: 'KaMapCache',
                    // group param is mandatory when using KaMapCache
                    group: layer.params['g'],
                    metaTileWidth: layer.params['metaTileSize']['w'],
                    metaTileHeight: layer.params['metaTileSize']['h']
                }, enc);
            },
            "KaMap": function(layer) {
                var enc = dbkjs.modules.print.encoders.layers.HTTPRequest.call(dbkjs.modules.print, layer);
                return $.extend({
                    type: 'KaMap',
                    map: layer.params['map'],
                    extension: layer.params['i'],
                    // group param is optional when using KaMap
                    group: layer.params['g'] || "",
                    maxExtent: layer.maxExtent.toArray(),
                    tileSize: [layer.tileSize.w, layer.tileSize.h],
                    resolutions: layer.serverResolutions || layer.resolutions
                }, enc);
            },
            "HTTPRequest": function(layer) {
                var enc = dbkjs.modules.print.encoders.layers.Layer.call(dbkjs.modules.print, layer);
                return $.extend({
                    baseURL: dbkjs.modules.print.getAbsoluteUrl(layer.url instanceof Array ?
                            layer.url[0] : layer.url),
                    opacity: (layer.opacity !== null) ? layer.opacity : 1.0
                }, enc);
            },
            "Image": function(layer) {
                var enc = dbkjs.modules.print.encoders.layers.Layer.call(dbkjs.modules.print, layer);
                return $.extend({
                    type: 'Image',
                    baseURL: dbkjs.modules.print.getAbsoluteUrl(layer.getURL(layer.extent)),
                    opacity: (layer.opacity !== null) ? layer.opacity : 1.0,
                    extent: layer.extent.toArray(),
                    pixelSize: [layer.size.w, layer.size.h],
                    name: layer.name
                }, enc);
            },
            "Vector": function(layer) {
                if (!layer.features.length) {
                    return;
                }

                var encFeatures = [];
                var encStyles = {};
                var features = layer.features;
                var featureFormat = new OpenLayers.Format.GeoJSON();
                var styleFormat = new OpenLayers.Format.JSON();
                var nextId = 1;
                var styleDict = {};
                var feature, style, dictKey, dictItem, styleName;
                for (var i = 0, len = features.length; i < len; ++i) {
                    feature = features[i];
                    style = feature.style || layer.style ||
                            layer.styleMap.createSymbolizer(feature,
                            feature.renderIntent);

                    // don't send unvisible features
                    if (style.display === 'none') {
                        continue;
                    }

                    dictKey = styleFormat.write(style);
                    dictItem = styleDict[dictKey];
                    if (dictItem) {
                        //this style is already known
                        styleName = dictItem;
                    } else {
                        //new style
                        styleDict[dictKey] = styleName = nextId++;
                        if (style.externalGraphic) {
                            encStyles[styleName] = $.extend({
                                externalGraphic: dbkjs.modules.print.getAbsoluteUrl(style.externalGraphic)
                            }, style);
                        } else {
                            encStyles[styleName] = style;
                        }
                    }
                    var featureGeoJson = featureFormat.extract.feature.call(
                            featureFormat, feature);

                    featureGeoJson.properties = OpenLayers.Util.extend({
                        _gx_style: styleName
                    }, featureGeoJson.properties);

                    encFeatures.push(featureGeoJson);
                }
                var enc = dbkjs.modules.print.encoders.layers.Layer.call(dbkjs.modules.print, layer);
                return $.extend({
                    type: 'Vector',
                    styles: encStyles,
                    styleProperty: '_gx_style',
                    geoJson: {
                        type: "FeatureCollection",
                        features: encFeatures
                    },
                    name: layer.name,
                    opacity: (layer.opacity !== null) ? layer.opacity : 1.0
                }, enc);
            },
            "Markers": function(layer) {
                var features = [];
                for (var i = 0, len = layer.markers.length; i < len; i++) {
                    var marker = layer.markers[i];
                    var geometry = new OpenLayers.Geometry.Point(marker.lonlat.lon, marker.lonlat.lat);
                    var style = {externalGraphic: marker.icon.url,
                        graphicWidth: marker.icon.size.w, graphicHeight: marker.icon.size.h,
                        graphicXOffset: marker.icon.offset.x, graphicYOffset: marker.icon.offset.y};
                    var feature = new OpenLayers.Feature.Vector(geometry, {}, style);
                    features.push(feature);
                }
                var vector = new OpenLayers.Layer.Vector(layer.name);
                vector.addFeatures(features);
                var output = dbkjs.modules.print.encoders.layers.Vector.call(dbkjs.modules.print, vector);
                vector.destroy();
                return output;
            }
        }
//        "legends": {
//            "gx_wmslegend": function(legend, scale) {
//                var enc = this.encoders.legends.base.call(this, legend);
//                var icons = [];
//                for (var i = 1, len = legend.items.getCount(); i < len; ++i) {
//                    var url = legend.items.get(i).url;
//                    if (legend.useScaleParameter === true &&
//                            url.toLowerCase().indexOf(
//                            'request=getlegendgraphic') !== -1) {
//                        var split = url.split("?");
//                        var params = Ext.urlDecode(split[1]);
//                        params['SCALE'] = scale;
//                        url = split[0] + "?" + Ext.urlEncode(params);
//                    }
//                    icons.push(this.getAbsoluteUrl(url));
//                }
//                enc[0].classes[0] = {
//                    name: "",
//                    icons: icons
//                };
//                return enc;
//            },
//            "gx_urllegend": function(legend) {
//                var enc = this.encoders.legends.base.call(this, legend);
//                enc[0].classes.push({
//                    name: "",
//                    icon: this.getAbsoluteUrl(legend.items.get(1).url)
//                });
//                return enc;
//            },
//            "base": function(legend) {
//                return [{
//                        name: legend.getLabel(),
//                        classes: []
//                    }];
//            }
//        }
    },
    getAbsoluteUrl: function(url) {
        if ($.browser.safari) {
            url = url.replace(/{/g, '%7B');
            url = url.replace(/}/g, '%7D');
        }
        var a;
        if ($.browser.msie) {
            a = document.createElement("<a href='" + url + "'/>");
            a.style.display = "none";
            document.body.appendChild(a);
            a.href = a.href;
            document.body.removeChild(a);
        } else {
            a = document.createElement("a");
            a.href = url;
        }
        return a.href;
    }
};

/** api: method[print]
 *  :param map: ``GeoExt.MapPanel`` or ``OpenLayers.Map`` The map to print.
 *  :param pages: ``Array`` of :class:`GeoExt.data.PrintPage` or
 *      :class:`GeoExt.data.PrintPage` page(s) to print.
 *  :param options: ``Object`` of additional options, see below.
 *  
 *  Sends the print command to the print service and opens a new window
 *  with the resulting PDF.
 *  
 *  Valid properties for the ``options`` argument:
 *
 *      * ``legend`` - :class:`GeoExt.LegendPanel` If provided, the legend
 *        will be added to the print document. For the printed result to
 *        look like the LegendPanel, the following ``!legends`` block
 *        should be included in the ``items`` of your page layout in the
 *        print module's configuration file:
 *        
 *        .. code-block:: none
 *        
 *          - !legends
 *              maxIconWidth: 0
 *              maxIconHeight: 0
 *              classIndentation: 0
 *              layerSpace: 5
 *              layerFontSize: 10
 *
 *      * ``overview`` - :class:`OpenLayers.Control.OverviewMap` If provided,
 *        the layers for the overview map in the printout will be taken from
 *        the OverviewMap control. If not provided, the print service will
 *        use the main map's layers for the overview map. Applies only for
 *        layouts configured to print an overview map.
 */
//dbkjs.modules.print.capabilities = {"scales": [{"name": "1:25,000", "value": "25000"}, {"name": "1:50,000", "value": "50000"}, {"name": "1:100,000", "value": "100000"}, {"name": "1:200,000", "value": "200000"}, {"name": "1:500,000", "value": "500000"}, {"name": "1:1,000,000", "value": "1000000"}, {"name": "1:2,000,000", "value": "2000000"}, {"name": "1:4,000,000", "value": "4000000"}], "dpis": [{"name": "75", "value": "75"}, {"name": "150", "value": "150"}, {"name": "300", "value": "300"}], "layouts": [{"name": "A4 portrait", "map": {"width": 440, "height": 483}, "rotation": true}, {"name": "Legal", "map": {"width": 440, "height": 483}, "rotation": false}], "printURL": "http://demo.opengeo.org/geoserver/pdf/print.pdf", "createURL": "http://demo.opengeo.org/geoserver/pdf/create.json"};