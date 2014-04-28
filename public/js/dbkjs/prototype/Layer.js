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
dbkjs.Layer = dbkjs.Class({
    id: null,
    layer: null,
    div: null,
    legend: null,
    initialize: function(name, url, params, options, parent, index, metadata, layertype) {
        var ly;
        var defaultparams = {
            format: 'image/png', 
            transparent: true
            //tiled: true,
            //tilesorigin: [dbkjs.map.maxExtent.left, dbkjs.map.maxExtent.bottom]
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
        if(!layertype){
            layertype = "WMS";
        }
        
        switch (layertype) {
            case "TMS":
                var ly = new OpenLayers.Layer.TMS(name, url,
                    params,
                    options
                );
                break;
            case "WMS":
            default:
                var ly = new OpenLayers.Layer.WMS(name, url,
                    params,
                    options
                );
                //TODO: sometimes legends fail, need to investigate why and how to handle errors
                var legend = url + 
                    "TRANSPARENT=true&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&EXCEPTIONS=application%2F" +
                    "vnd.ogc.se_xml&FORMAT=image%2Fpng&LAYER=" + 
                ly.params["LAYERS"]; 
                ly.events.register("loadstart", ly, function() {
                    dbkjs.util.loadingStart(ly);
                });
                ly.events.register("loadend", ly, function() {
                    dbkjs.util.loadingEnd(ly);
                });
        }
        
        this.layer  = ly;
        this.layer.dbkjsParent = this;
        //let op, de map moet worden meegegeven in de opties

        dbkjs.map.addLayer(this.layer);
        if(!options.isBaseLayer) {
            // @todo functie maken om layerindex dynamisch te toveren 0 is onderop de stapel
            if(index){
                dbkjs.map.setLayerIndex(this.layer, index);
            } else {
                dbkjs.map.setLayerIndex(this.layer, 0);
            }

            var dv_panel_heading = $('<div class="panel-heading"></div>');
            var dv_panel_title = $('<h4 class="panel-title"></div>');
            dv_panel_title.append('<input type="checkbox" name="box_' + this.id + '"/>&nbsp;');
            dv_panel_title.append(name + '&nbsp;<a  class="accordion-toggle" data-toggle="collapse" href="#collapse_' +
                    this.id + '" data-parent="' + parent + '" ><i class="icon-info-sign"></i></a>');
            dv_panel_heading.append(dv_panel_title);
            this.div.append(dv_panel_heading);
            var dv_panel_content = $('<div id="collapse_' + this.id + '" class="panel-collapse collapse"></div>');
            if(metadata){
                if(metadata.abstract){
                    dv_panel_content.append('<p>' + metadata.abstract + '</p>');
                }
                if(metadata.pl){
                    this.layer.metadata.pl = metadata.pl;
                }
            }
            dv_panel_content.append('<img src="' + legend + '"/>');
       

            this.div.append(dv_panel_content);
            $(parent).append(this.div);
            $(parent).sortable({handle: '.panel'});
            if (this.layer) {
                if (this.layer.getVisibility()) {
                    //checkbox aan
                    $('input[name="box_' + this.id + '"]').attr('checked', 'checked');
                }
                var that = this;
                $('input[name="box_' + this.id + '"]').click(function() {
                    dbkjs.disableloadlayer = true;
                    if ($(this).is(':checked')) {
                        that.layer.setVisibility(true);
                    } else {
                        that.layer.setVisibility(false);
                    }
                });
            }
        } else {
            //dbkjs.map.setLayerIndex(this.layer, 0);
            if(metadata){
                if(metadata.abstract){
                    dv_panel_content.append('<p>' + metadata.abstract + '</p>');
                }
                if(metadata.pl){
                    this.layer.metadata.pl = metadata.pl;
                }
            }
            dbkjs.options.baselayers.push(this.layer);
            //dirty fix to lower the baselayer so it will not overlap other layers
            dbkjs.map.raiseLayer(this.layer, -1000);
            var _li = $('<li class="bl"><a href="#">' + name + '</a></li>');
            $('#baselayerpanel_ul').append(_li);
            _li.click(function() {
                dbkjs.toggleBaseLayer($(this).index());
            });
        }
    },
    getfeatureinfo: function(e) {
        _obj = this;
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
    },
    panel: function(response) {
        _obj = this;
        //verwerk de featureinformatie
        g = new OpenLayers.Format.GML.v3();

        features = g.read(response.responseText);
        if (features.length > 0) {
            html = '<div class="table-responsive"><table class="table table-hover">';
            for (var feat in features) {
                for (var j in features[feat].attributes) {
                    if ($.inArray(j, ['Name', 'No', 'Latitude', 'Longitude']) === -1) {
                        if (typeof (features[feat].attributes[j]) !== "undefined" && features[feat].attributes[j] !== "") {
                            html += '<tr><td>' + j + '</td><td>' + dbkjs.util.renderHTML(features[feat].attributes[j]) + '</td></tr>';
                        }
                    }
                }
            }
            html += '</table></div>';
            dbkjs.util.appendTab(dbkjs.wms_panel.attr("id"), _obj.layer.name, html, true, _obj.id + '_pn');
            $('#wmsclickpanel').show();
        } else {
            dbkjs.util.removeTab(dbkjs.wms_panel.attr("id"), _obj.id + '_pn');
        }
    }
});