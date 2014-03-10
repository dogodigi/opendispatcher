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
dbkjs.Capabilities = dbkjs.Class({
    wmsCapabilitiesFormat: new OpenLayers.Format.WMSCapabilities(),
    url: 'gs2/custom_21/wms?',
    prefix: '',
    SERVICE: 'WMS',
    VERSION: '1.1.1',
    REQUEST: 'GetCapabilities',
    title: 'WMS lagen',
    onLayerLoadError: function(e) {
        /* Display error message, etc */
        alert(e);
    },
    initialize: function(options){
        this.options = OpenLayers.Util.extend({}, options);
        OpenLayers.Util.extend(this, options);
        var _obj = this;
        OpenLayers.Request.GET({
            url: this.url,
            params: {
                SERVICE: this.SERVICE,
                VERSION: this.VERSION, // For example, '1.1.1'
                REQUEST: this.REQUEST
            },
            success: function(r) {
                var doc = r.responseXML;
                if (!doc || !doc.documentElement) {
                    doc = r.responseText;
                }
                var c = _obj.wmsCapabilitiesFormat.read(doc);
                if (!c || !c.capability) {
                    dbkjs.loadingcapabilities = dbkjs.loadingcapabilities - 1;
                    if(dbkjs.loadingcapabilities === 0){
                        dbkjs.finishMap();
                    }
                    _obj.onLayerLoadError(c);
                    return;
                } else {
                    //construct a unique identifier
                    var myID = OpenLayers.Util.createUniqueID('overlay_tab');
                    //create a panel to hold the layers
                    $('#overlaypanel_ul').append('<li><a href="#' + myID + '" data-toggle="tab">' + _obj.title + '</a></li>');
                    $('#overlaypanel_div').append('<div class="tab-pane" id="' + myID + '">' +
                                    '<div id="' + myID + '_panel" class="panel-group"></div>' +
                                '</div>');
                    //loop through all the layers and make them available
                    $.each(c.capability.layers, function(lkey, lval) {
                        var myLayer = new dbkjs.Layer(lval.title,
                            _obj.url,
                            {layers: lval.name},
                            {},
                            '#' + myID + '_panel',
                            options.index + lkey
                        );
                    });
                    dbkjs.loadingcapabilities = dbkjs.loadingcapabilities - 1;
                    if(dbkjs.loadingcapabilities === 0){
                        dbkjs.finishMap();
                    }
                    return;
                }
            },
            failure: function(r) {
                dbkjs.loadingcapabilities = dbkjs.loadingcapabilities - 1;
                if(dbkjs.loadingcapabilities === 0){
                    dbkjs.finishMap();
                }
                _obj.onLayerLoadError(r);
                return;
            }
        });
    }
});

