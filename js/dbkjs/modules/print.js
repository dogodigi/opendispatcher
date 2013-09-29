var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;

dbkjs.modules.print = {
    url: "/zeeland/",
    register: function(options) {
        var _obj = dbkjs.modules.print;
        _obj.namespace = options.namespace || _obj.namespace;
        _obj.url = options.url || _obj.url;
        _obj.visibility = options.visible || _obj.visibility;
        $('#btngrp_3').append('<a id="btn_print" class="btn btn-default navbar-btn" href="#"><i class="icon-print"></i></a>');
        $('#btn_print').click(function() {
            var testObject = {
                "units": "degrees",
                "srs": "EPSG:4326",
                "layout": "A4 portrait",
                "dpi": 75,
                "layers": [
                    {
                        "baseURL": "http://demo.opengeo.org/geoserver/wms",
                        "opacity": 1,
                        "singleTile": false,
                        "type": "WMS",
                        "layers": [
                            "ne:ne"
                        ],
                        "format": "image/jpeg",
                        "styles": [
                            ""
                        ],
                        "customParams": {}
                    },
                    {
                        "type": "Vector",
                        "styles": {
                            "1": {
                                "externalGraphic": "http://openlayers.org/dev/img/marker-blue.png",
                                "strokeColor": "red",
                                "fillColor": "red",
                                "fillOpacity": 0.7,
                                "strokeWidth": 2,
                                "pointRadius": 12
                            }
                        },
                        "styleProperty": "_gx_style",
                        "geoJson": {
                            "type": "FeatureCollection",
                            "features": [
                                {
                                    "type": "Feature",
                                    "id": "OpenLayers.Feature.Vector_52",
                                    "properties": {
                                        "_gx_style": 1
                                    },
                                    "geometry": {
                                        "type": "Polygon",
                                        "coordinates": [
                                            [
                                                [
                                                    15,
                                                    47
                                                ],
                                                [
                                                    16,
                                                    48
                                                ],
                                                [
                                                    14,
                                                    49
                                                ],
                                                [
                                                    15,
                                                    47
                                                ]
                                            ]
                                        ]
                                    }
                                },
                                {
                                    "type": "Feature",
                                    "id": "OpenLayers.Feature.Vector_61",
                                    "properties": {
                                        "_gx_style": 1
                                    },
                                    "geometry": {
                                        "type": "LineString",
                                        "coordinates": [
                                            [
                                                15,
                                                48
                                            ],
                                            [
                                                16,
                                                47
                                            ],
                                            [
                                                17,
                                                46
                                            ]
                                        ]
                                    }
                                },
                                {
                                    "type": "Feature",
                                    "id": "OpenLayers.Feature.Vector_64",
                                    "properties": {
                                        "_gx_style": 1
                                    },
                                    "geometry": {
                                        "type": "Point",
                                        "coordinates": [
                                            16,
                                            46
                                        ]
                                    }
                                }
                            ]
                        },
                        "name": "vector",
                        "opacity": 1
                    }
                ],
                "pages": [
                    {
                        "center": [
                            15.999999999998,
                            48
                        ],
                        "scale": 4000000,
                        "rotation": -17,
                        "mapTitle": "A custom title",
                        "comment": "A custom comment"
                    }
                ]
            };
            dbkjs.modules.print.printdirect(dbkjs.map, testObject.pages);
        });
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
    timeout: 30000,
    setLayout: function(layout) {
        this.layout = layout;
    },
    setDpi: function(dpi) {
        this.dpi = dpi;
    },
    printdirect: function(map, pages, options) {
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
                center: [page.center[0], page.center[1]],
                scale: page.scale,
                rotation: page.rotation,
                mapTitle: page.mapTitle
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
            url: _obj.url + "pdf/" + "create.json",
            contentType: "application/json; charset=UTF-8",
            data: JSON.stringify(jsonData),
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
        var url = _obj.url + "pdf/" + "info.json";
        $.ajax({
            url: url,
            type: "GET",
            data: "",
            success: function(response) {
                _obj.capabilities = response;
                if (callback) {
                    callback.call();
                }
            },
            error: function(response) {
                alert(response.responseText);
            }
        });

    },
    /**
     * 
     * @param {type} layer
     * @returns {dbkjs.modules.print.encodeLayer.encLayer|@exp;encLayer@pro;type}
     */
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
            document.body.removeChild(a);
        } else {
            a = document.createElement("a");
            a.href = url;
        }
        return a.href;
    }
};