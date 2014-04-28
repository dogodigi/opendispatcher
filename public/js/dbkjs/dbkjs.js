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
dbkjs.modules = dbkjs.modules || [];
dbkjs.overlays = dbkjs.overlays || [];

dbkjs.map = dbkjs.map || null;

dbkjs.init = function() {
    dbkjs.map = new OpenLayers.Map(dbkjs.options.map.options);
    dbkjs.options.organisation = {
        id: dbkjs.util.getQueryVariable(i18n.t('app.organisation'), 'demo')
    };
    dbkjs.options.adres = dbkjs.util.getQueryVariable(i18n.t('app.queryAddress'));
    dbkjs.options.omsnummer = dbkjs.util.getQueryVariable(i18n.t('app.queryNumber'));
    dbkjs.options.dbk = dbkjs.util.getQueryVariable(i18n.t('app.queryDBK'));
    dbkjs.challengeAuth();
    // Show mouseposition
    var mousePos = new OpenLayers.Control.MousePosition({
        numDigits: dbkjs.options.projection.coordinates.numDigits,
        div: OpenLayers.Util.getElement('coords')
    });

    dbkjs.map.addControl(mousePos);
    var attribution = new OpenLayers.Control.Attribution({
        div: OpenLayers.Util.getElement('attribution')
    });
    dbkjs.map.addControl(attribution);

    var scalebar = new OpenLayers.Control.Scale(OpenLayers.Util.getElement('scale'));
    dbkjs.map.addControl(scalebar);
    dbkjs.naviHis = new OpenLayers.Control.NavigationHistory();
    dbkjs.map.addControl(dbkjs.naviHis);
    dbkjs.naviHis.activate();
    
    var baselayer_ul = $('<ul id="baselayerpanel_ul" class="nav nav-pills nav-stacked">');
    $.each(dbkjs.options.baselayers, function(bl_index, bl) {
        var _li = $('<li class="bl"><a href="#">' + bl.name + '</a></li>');
        baselayer_ul.append(_li);
        bl.events.register("loadstart", bl, function() {
            dbkjs.util.loadingStart(bl);
        });
        bl.events.register("loadend", bl, function() {
            dbkjs.util.loadingEnd(bl);
        });
        dbkjs.map.addLayer(bl);
        _li.click(function() {
            dbkjs.toggleBaseLayer(bl_index);
        });
    });
    $('#baselayerpanel_b').append(baselayer_ul);
    dbkjs.map.events.register("moveend", dbkjs.map, function() {
        //check if the naviHis has any content
        if (dbkjs.naviHis.nextStack.length > 0) {
            //enable next button
            $('#zoom_next').removeClass('disabled');
        } else {
            $('#zoom_next').addClass('disabled');
        }
        if (dbkjs.naviHis.previousStack.length > 1) {
            //enable previous button
            $('#zoom_prev').removeClass('disabled');
        } else {
            $('#zoom_prev').addClass('disabled');
        }
    });
    
    dbkjs.overview = new OpenLayers.Control.OverviewMap({
        theme: null,
        div: document.getElementById('minimappanel_b'),
        size: new OpenLayers.Size(180, 180)
    });
    dbkjs.map.addControl(dbkjs.overview);
    dbkjs.map.addControl(new OpenLayers.Control.Zoom({
            zoomInId: "zoom_in",
            zoomOutId: "zoom_out"
        })
    );
};

/**
 * Functie voor updaten van de zichtbaarheid van baselayers
 * @param {integer} nr
 */
dbkjs.toggleBaseLayer = function(nr) {
    var layerbuttons = $(".bl");
    var i;
    for (i = 0; i < layerbuttons.length; i++) {
        if (i !== nr) {
            $(layerbuttons[i]).removeClass("active", true);
            dbkjs.options.baselayers[i].setVisibility(false);
        } else {
            $(layerbuttons[nr]).addClass("active", true);
            dbkjs.options.baselayers[nr].setVisibility(true);
            dbkjs.map.setBaseLayer(dbkjs.options.baselayers[nr]);
        }
    }
};

dbkjs.activateClick = function() {
    dbkjs.map.events.register('click', dbkjs.map, dbkjs.util.onClick);
    dbkjs.map.events.register('touchend', dbkjs.map, dbkjs.util.onClick);
};

dbkjs.challengeAuth = function() {
    var params = {srid: dbkjs.options.projection.srid};
    $.getJSON('api/organisation.json', params).done(function(data) {
        if (data.organisation) {
            dbkjs.options.organisation = data.organisation;
            if (dbkjs.options.organisation.title) {
                document.title = dbkjs.options.organisation.title;
            }
            dbkjs.successAuth();
        }
    });
};

dbkjs.successAuth = function() {
    dbkjs.hoverControl = new OpenLayers.Control.SelectFeature(
        [],
        {
            hover: true, 
            highlightOnly: true,
            renderIntent: "temporary"
        }
    );
    dbkjs.hoverControl.handlers.feature.stopDown = false;
    dbkjs.hoverControl.handlers.feature.stopUp = false;
    dbkjs.map.addControl(dbkjs.hoverControl);
    dbkjs.selectControl = new OpenLayers.Control.SelectFeature(
        [],
        {
            clickout: true, 
            toggle: true,
            multiple: false 
        }
    );
    dbkjs.selectControl.handlers.feature.stopDown = false;
    dbkjs.selectControl.handlers.feature.stopUp = false;
    dbkjs.map.addControl(dbkjs.selectControl);
    dbkjs.protocol.jsonDBK.init();
    if (dbkjs.options.organisation.logo) {
        $('#logo').css('background-image', 'url(' + dbkjs.options.organisation.logo + ')');
    }
    //register modules
    $.each(dbkjs.modules, function(mod_index, module) {
        if ($.inArray(mod_index, dbkjs.options.organisation.modules) > -1) {
            if (module.register) {
                module.register({namespace: dbkjs.options.organisation.workspace, url: 'geoserver/', visible: true});
            }
        }
    });
    
    if(dbkjs.options.organisation.wms){
        dbkjs.loadingcapabilities = 0;
            $.each(dbkjs.options.organisation.wms, function (wms_k, wms_v){
                var index = wms_v.index || 0;
                if(wms_v.getcapabilities === true){
                    dbkjs.loadingcapabilities = dbkjs.loadingcapabilities + 1;
                    var options = {
                        url: wms_v.url, 
                        title: wms_v.name, 
                        proxy: wms_v.proxy, 
                        index: index, 
                        parent: wms_v.parent
                    };
                    if (!dbkjs.util.isJsonNull(wms_v.pl)){
                        options.pl = wms_v.pl;
                    }
                    var myCapabilities = new dbkjs.Capabilities(options);
                } else if (!wms_v.baselayer) {
                    var params = wms_v.params || {};
                    var options = wms_v.options || {};
                    var parent = wms_v.parent || null;
                    var metadata = {};
                    if (!dbkjs.util.isJsonNull(wms_v.abstract)){
                        metadata.abstract = wms_v.abstract;
                    }
                    if (!dbkjs.util.isJsonNull(wms_v.pl)){
                        metadata.pl = wms_v.pl;
                    }
                    var myLayer = new dbkjs.Layer(
                        wms_v.name,
                        wms_v.url,
                        params,
                        options,
                        parent,
                        index,
                        metadata
                    );
                } else {
                    var params = wms_v.params || {};
                    var options = wms_v.options || {};
                    options = OpenLayers.Util.extend({isBaseLayer: true}, options);
                    var parent = wms_v.parent || null;
                    var metadata = {};
                    if (!dbkjs.util.isJsonNull(wms_v.abstract)){
                        metadata.abstract = wms_v.abstract;
                    }
                    if (!dbkjs.util.isJsonNull(wms_v.pl)){
                        metadata.pl = wms_v.pl;
                    }
                    var myLayer = new dbkjs.Layer(
                        wms_v.name,
                        wms_v.url,
                        params,
                        options,
                        parent,
                        index,
                        metadata
                    );
                }

            });
            if(dbkjs.loadingcapabilities === 0){
                dbkjs.finishMap();
            }
        } else {
            dbkjs.finishMap();
        }
};

dbkjs.finishMap = function(){
    if (dbkjs.layout) {
        dbkjs.layout.activate();
    }
    dbkjs.activateClick();
    
    dbkjs.selectControl.activate();
    var hrefzoom = dbkjs.util.getQueryVariable('zoom');
    var hreflat = dbkjs.util.getQueryVariable('lat');
    var hreflon = dbkjs.util.getQueryVariable('lon');
    var hrefbase = dbkjs.util.getQueryVariable('b');
    var hreflayers = dbkjs.util.getQueryVariable('ly');

    if(hrefzoom && hreflat && hreflon){
        dbkjs.argparser = new dbkjs.argParser();
        dbkjs.map.addControl(dbkjs.argparser);
    }else {
        if (dbkjs.options.organisation.area){
            if (dbkjs.options.organisation.area.geometry.type === "Point") {
                dbkjs.map.setCenter(
                        new OpenLayers.LonLat(
                                dbkjs.options.organisation.area.geometry.coordinates[0],
                                dbkjs.options.organisation.area.geometry.coordinates[1]
                                ).transform(
                        new OpenLayers.Projection(dbkjs.options.projection.code),
                        dbkjs.map.getProjectionObject()
                        ),
                        dbkjs.options.organisation.area.zoom
                        );
            } else if (dbkjs.options.organisation.area.geometry.type === "Polygon"){
                var areaGeometry = new OpenLayers.Format.GeoJSON().read(dbkjs.options.organisation.area.geometry, "Geometry");
                dbkjs.map.zoomToExtent(areaGeometry.getBounds());
            }
        } else {
            dbkjs.map.zoomToMaxExtent();
        }
    }
    var permalink = new dbkjs.permalink('permalink');
    dbkjs.map.addControl(permalink);
};

$(document).ready(function() {
    // Make sure i18n is initialized
    i18n.init({
            lng: "nl", debug: false 
    }, function(t) {
        document.title = dbkjs.options.APPLICATION + ' ' + dbkjs.options.VERSION;
        $('body').append(dbkjs.util.createDialog('infopanel', '<i class="icon-info-sign"></i> ' + t("dialogs.info"), 'right:0;bottom:0;'));
        $('body').append(dbkjs.util.createDialog('wmsclickpanel', '<i class="icon-info-sign"></i> ' + t("dialogs.clickinfo"), 'right:0;bottom:0;'));
        $('body').append(dbkjs.util.createDialog('vectorclickpanel', '<i class="icon-info-sign"></i> ' + t("dialogs.clickinfo"), 'left:0;bottom:0;'));
        $('body').append(dbkjs.util.createModal('printpanel', '<i class="icon-print"></i> ' + t("app.print"), ''));
        dbkjs.wms_panel = dbkjs.util.createTabbable();
        $('#wmsclickpanel_b').append(dbkjs.wms_panel);
        $('body').append(dbkjs.util.createDialog('minimappanel', '<i class="icon-picture"></i> ' + i18n.t("dialogs.refmap"), 'bottom:0;'));
        $('.dialog').drags({handle: '.panel-heading'});
        $('.btn-group').drags({handle: '.drag-handle'});
        dbkjs.util.setModalTitle('overlaypanel', i18n.t('map.overlays'));
        dbkjs.util.setModalTitle('baselayerpanel', i18n.t('map.baselayers'));
        dbkjs.init();
        $('#infopanel_b').html(dbkjs.options.info);
        $('.btn').click(function() {
            if (this.id === "tb03") {
                $('#infopanel').toggle();
            } else if (this.id === "c_minimap") {
                $('#minimappanel').toggle();
            }
        });
        $('#zoom_prev').click(function() {
            dbkjs.naviHis.previousTrigger();
        });
        $('#zoom_next').click(function() {
            dbkjs.naviHis.nextTrigger();
        });

        $('#zoom_extent').click(function() {
            if (dbkjs.options.organisation.modules.regio) {
                dbkjs.modules.regio.zoomExtent();
            } else {
                if (dbkjs.options.organisation.area.geometry.type === "Point") {
                    dbkjs.map.setCenter(
                        new OpenLayers.LonLat(
                                data.organisation.area.geometry.coordinates[0],
                                data.organisation.area.geometry.coordinates[1]
                                ).transform(
                        new OpenLayers.Projection(dbkjs.options.projection.code),
                        dbkjs.map.getProjectionObject()
                        ),
                        dbkjs.options.organisation.area.zoom
                    );
                } else if (dbkjs.options.organisation.area.geometry.type === "Polygon"){
                    var areaGeometry = new OpenLayers.Format.GeoJSON().read(
                            dbkjs.options.organisation.area.geometry, "Geometry");
                    dbkjs.map.zoomToExtent(areaGeometry.getBounds());
                }
            }
        });
    });
});
