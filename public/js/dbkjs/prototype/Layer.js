/*!
 *  Copyright (c) 2014 Milo van der Linden (milo@dogodigi.net)
 *
 *  This file is part of opendispatcher/safetymapsDBK
 *
 *  opendispatcher is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  opendispatcher is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with opendispatcher. If not, see <http://www.gnu.org/licenses/>.
 *
 */

/* global OpenLayers */

var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;

/**
 * @class Layer
 * @memberof dbkjs
 * @extends dbkjs.Class
 */
dbkjs.Layer = dbkjs.Class({
    /**
     * @memberof dbkjs.Layer
     * @property id
     * @type {String}
     */
    id: null,
    /**
     * @memberof dbkjs.Layer
     * @property layer
     * @type {OpenLayers.layer}
     */
    layer: null,
    /**
     * @memberof dbkjs.Layer
     * @property div
     */
    div: null,
    /**
     * @memberof dbkjs.Layer
     * @property legend
     */
    legend: null,
    /**
     * @memberof dbkjs.Layer
     * @method initialize
     */
    initialize: function (name, url, params, options, parent, index, metadata, layertype) {
        var ly;
        var dv_panel_content;
        var defaultparams = {
            format: 'image/png',
            transparent: true
        };
        var defaultoptions = {
            transitionEffect: 'resize',
            singleTile: true,
            buffer: 0,
            isBaseLayer: false,
            visibility: false
        };

        params = OpenLayers.Util.extend(defaultparams, params);
        options = OpenLayers.Util.extend(defaultoptions, options);
        this.id = OpenLayers.Util.createUniqueID("dbkjs_layer_");
        this.div = $('<div class="panel"></div>');
        this.div.attr('id', 'panel_' + this.id);
        //layers moet worden meegegeven in de opties
        if (!layertype) {
            layertype = "WMS";
        }

        switch (layertype) {
            case "TMS":
                // XXX in json you can't create OpenLayers objects. The following
                // properties in params are converted to OpenLayers objects here:

                // tileOrigin: [<lon>, <lat>] -> new OpenLayers.LonLat(<lon>, <lat>)
                // maxExtent: [<minx>, <miny>, <maxx>, <maxy>] -> new OpenLayers.Bounds(<minx>, <miny>, <maxx>, <maxy>)
                // projection: "EPSG:1234" -> new OpenLayers.Projection("EPSG:1234")

                if ($.isArray(params.tileOrigin)) {
                    params.tileOrigin = new OpenLayers.LonLat(params.tileOrigin[0], params.tileOrigin[1]);
                }
                if ($.isArray(params.maxExtent)) {
                    var me = params.maxExtent;
                    params.maxExtent = new OpenLayers.Bounds(me[0], me[1], me[2], me[3]);
                }
                if (typeof params.projection === "string") {
                    params.projection = new OpenLayers.Projection(params.projection);
                }
                ly = new OpenLayers.Layer.TMS(name, url,
                        params,
                        options
                        );
                ly.events.register("loadstart", ly, function () {
                    dbkjs.util.loadingStart(ly);
                });
                ly.events.register("loadend", ly, function () {
                    dbkjs.util.loadingEnd(ly);
                });
                break;
            default:
                ly = new OpenLayers.Layer.WMS(name, url,
                        params,
                        options
                        );
                //TODO: sometimes legends fail, need to investigate why and how to handle errors
                var legend = url +
                        "TRANSPARENT=true&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&EXCEPTIONS=application%2F" +
                        "vnd.ogc.se_xml&FORMAT=image%2Fpng&LAYER=" +
                        ly.params.LAYERS;
                ly.events.register("loadstart", ly, function () {
                    dbkjs.util.loadingStart(ly);
                });
                ly.events.register("loadend", ly, function () {
                    dbkjs.util.loadingEnd(ly);
                });
        }

        this.layer = ly;
        this.layer.dbkjsParent = this;
        //let op, de map moet worden meegegeven in de opties

        dbkjs.map.addLayer(this.layer);
        if (!options.isBaseLayer) {
            var newparent = "";
            var nameArray = name.split("\\");
            if (nameArray.length > 1) {
                newparent = nameArray[0];
                name = nameArray[1];
            }

            // @todo functie maken om layerindex dynamisch te toveren 0 is onderop de stapel
            if (index) {
                dbkjs.map.setLayerIndex(this.layer, index);
            } else {
                dbkjs.map.setLayerIndex(this.layer, 0);
            }

            var dv_panel_heading = $('<div class="panel-heading"></div>');
            var dv_panel_title = $('<h4 class="panel-title"></div>');
            dv_panel_title.append(name + '&nbsp;<a class="accordion-toggle" data-toggle="collapse" href="#collapse_' +
                    this.id + '" data-parent="' + parent + '" ><i class="fa fa-info-circle"></i></a>');
            dv_panel_heading.append(dv_panel_title);
            this.div.append(dv_panel_heading);
            dv_panel_content = $('<div id="collapse_' + this.id + '" class="panel-collapse collapse"></div>');
            if (metadata) {
                if (metadata.abstract) {
                    dv_panel_content.append('<p>' + metadata.abstract + '</p>');
                }
                if (metadata.pl) {
                    this.layer.metadata.pl = metadata.pl;
                }
                this.layer.metadata.div = this.div;
            }

            if (dbkjs.util.isJsonNull(parent) && !dbkjs.util.isJsonNull(newparent)) {
                var findMyParent = 'overlay_tab' + newparent.toLowerCase();
                if ($('#' + findMyParent).length === 0 && $('#' + findMyParent + '_panel').length === 0) {
                    //create a panel to hold the layer
                    $('#overlaypanel_ul').append('<li><a href="#' + findMyParent +
                            '" data-toggle="tab">' + newparent + '</a></li>');
                    $('#overlaypanel_div').append('<div class="tab-pane" id="' +
                            findMyParent + '">' +
                            '<div id="' + findMyParent + '_panel" class="panel-group"></div>' +
                            '</div>');
                }
                parent = '#' + findMyParent;
            }

            if (dbkjs.viewmode === 'fullscreen') {
                dv_panel_content.append('<img id="legend_' + this.id + '" src="' + (metadata.legend ? metadata.legend : legend) + '"/>');
            }

            this.div.append(dv_panel_content);
            $(parent).append(this.div);
            $(parent).sortable({handle: '.panel'});
            if (this.layer) {
                if (this.layer.getVisibility()) {
                    dv_panel_heading.addClass('active');
                    dv_panel_heading.addClass('layActive');
                }
                var that = this;
                dv_panel_heading.click(function (e) {
                    if (e.target.className.indexOf('fa-info-circle') !== -1 || e.target.className.indexOf('accordion-toggle') !== -1) {
                        //click on the info sign
                        //check to see if the legend is there already
                        if ($('#legend_' + that.id).length === 0) {
                            dv_panel_content.append('<img id="legend_' + that.id + '" src="' + (metadata.legend ? metadata.legend : legend) + '"/>');
                        }
                        return;
                    }
                    dbkjs.disableloadlayer = true;
                    if (!dv_panel_heading.hasClass('active')) {
                        that.layer.setVisibility(true);
                        dv_panel_heading.addClass('active');
                        dv_panel_heading.addClass('layActive');
                    } else {
                        that.layer.setVisibility(false);
                        dv_panel_heading.removeClass('active');
                        dv_panel_heading.removeClass('layActive');
                    }
                });
            }
        } else {
            if (metadata) {
                if (metadata.abstract) {
                    dv_panel_content.append('<p>' + metadata.abstract + '</p>');
                }
                if (metadata.pl) {
                    this.layer.metadata.pl = metadata.pl;
                }
            }
            dbkjs.options.baselayers.push(this.layer);
            //dirty fix to lower the baselayer so it will not overlap other layers
            dbkjs.map.raiseLayer(this.layer, -1000);
            var _li = $('<li class="bl"><a href="#">' + name + '</a></li>');
            $('#baselayerpanel_ul').append(_li);
            _li.click(function () {
                dbkjs.toggleBaseLayer($(this).index());
                if (dbkjs.viewmode === 'fullscreen') {
                    dbkjs.util.getModalPopup('baselayerpanel').hide();
                }
            });
        }
    },
    getfeatureinfo: function (e) {
        _obj = this;
        if (!this.layer.options.hidefeatureinfo) {
            if (this.layer.visibility) {
                var params = {
                    REQUEST: "GetFeatureInfo",
                    EXCEPTIONS: "application/vnd.ogc.se_xml",
                    BBOX: dbkjs.map.getExtent().toBBOX(),
                    SERVICE: "WMS",
                    INFO_FORMAT: 'application/vnd.ogc.gml',
                    QUERY_LAYERS: this.layer.params.LAYERS,
                    FEATURE_COUNT: 50,
                    Layers: this.layer.params.LAYERS,
                    WIDTH: dbkjs.map.size.w,
                    HEIGHT: dbkjs.map.size.h,
                    format: 'image/png',
                    styles: this.layer.params.STYLES,
                    srs: this.layer.params.SRS
                };

                // handle the wms 1.3 vs wms 1.1 madness
                if (this.layer.params.VERSION === "1.3.0") {
                    params.version = "1.3.0";
                    params.j = e.xy.x;
                    params.i = e.xy.y;
                } else {
                    params.version = "1.1.1";
                    params.x = e.xy.x;
                    params.y = e.xy.y;
                }
                OpenLayers.Request.GET({url: this.layer.url, "params": params, callback: this.panel, scope: _obj});
                //OpenLayers.Event.stop(e);
            }
        }
    },
    panel: function (response) {
        _obj = this;
        //verwerk de featureinformatie
        g = new OpenLayers.Format.GML.v3();

        features = g.read(response.responseText);
        if (features.length > 0) {
            html = '<div class="table-responsive"><table class="table table-hover">';
            for (var feat in features) {
                for (var j in features[feat].attributes) {
                    if ($.inArray(j, ['No', 'Latitude', 'Longitude','namespace','fid', 'rotation']) === -1) {
                      //if a field has the suffix _hidden, hide it.
                      var hidden = '_hidden';
                      if(j.indexOf(hidden, j.length - hidden.length) === -1) {
                        if (!dbkjs.util.isJsonNull(features[feat].attributes[j])) {
                          html += '<tr><td>' + j + '</td><td>' + dbkjs.util.renderHTML(features[feat].attributes[j]) + '</td></tr>';
                        }
                      }
                    }
                }
            }
            html += '</table></div>';
            dbkjs.util.appendTab(dbkjs.wms_panel.attr("id"), _obj.layer.name, html, true, _obj.id + '_pn');
            if(dbkjs.viewmode === "fullscreen") {
                dbkjs.util.getModalPopup('wmsclickpanel').show();
            } else {
                $('#wmsclickpanel').show();
            }
        } else {
            dbkjs.util.removeTab(dbkjs.wms_panel.attr("id"), _obj.id + '_pn');
        }
    }
});
