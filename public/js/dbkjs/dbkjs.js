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
OpenLayers.ProxyHost = "proxy/?q=";
OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
Proj4js.defs["EPSG:28992"] = "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.999908 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +towgs84=565.2369,50.0087,465.658,-0.406857330322398,0.350732676542563,-1.8703473836068,4.0812 +no_defs <>";

var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || [];
dbkjs.overlays = dbkjs.overlays || [];
dbkjs.map = dbkjs.map || null;
dbkjs.dataPath = dbkjs.dataPath || null;
dbkjs.mediaPath = dbkjs.mediaPath || null;
dbkjs.basePath = dbkjs.basePath || null;

dbkjs.viewmode = 'default';
//dbkjs.viewmode = 'fullscreen';

dbkjs.init = function () {

    dbkjs.setPaths();

    if(dbkjs.viewmode === "fullscreen" && "ontouchstart" in window) {
        // Later wordt TouchNavigation toegevoegd, verwijder standaard
        // navigation control (anders gekke zoom / pan effecten op touchscreen)
        dbkjs.options.map.options.controls = [];
    };

    if (!dbkjs.map) {
      dbkjs.map = new OpenLayers.Map(dbkjs.options.map.options);
    };
    dbkjs.options.organisation = {
        id: dbkjs.util.getQueryVariable(i18n.t('app.organisation'), 'demo')
    };
    dbkjs.options.adres = dbkjs.util.getQueryVariable(i18n.t('app.queryAddress'));
    dbkjs.options.omsnummer = dbkjs.util.getQueryVariable(i18n.t('app.queryNumber'));
    dbkjs.options.dbk = dbkjs.util.getQueryVariable(i18n.t('app.queryDBK'));
    dbkjs.challengeAuth();

    dbkjs.mapcontrols.createMapControls();

    dbkjs.layers.createBaseLayers();

    dbkjs.mapcontrols.registerMapEvents();
    
    dbkjs.showStatus = false;

};

/**
 * Functie voor updaten van de zichtbaarheid van baselayers
 * @param {integer} nr
 */
dbkjs.toggleBaseLayer = function (nr) {
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

dbkjs.setDbkCategoryVisibility = function (category, visible) {
    if (!dbkjs.options.visibleCategories) {
        dbkjs.options.visibleCategories = {};
    }
    dbkjs.options.visibleCategories[category] = visible;
    dbkjs.protocol.jsonDBK.layerBrandweervoorziening.redraw();
};

dbkjs.activateClick = function () {
    dbkjs.map.events.register('click', dbkjs.map, dbkjs.util.onClick);
    dbkjs.map.events.register('touchend', dbkjs.map, dbkjs.util.onClick);
};

dbkjs.challengeAuth = function () {
    var params = {srid: dbkjs.options.projection.srid};
    $.getJSON(dbkjs.dataPath + 'organisation.json', params).done(function(data) {
        if (data.organisation) {
            dbkjs.options.organisation = data.organisation;
            if (dbkjs.options.organisation.title) {
                document.title = dbkjs.options.organisation.title;
            }
            dbkjs.successAuth();
        } else {
            //drop back to default
            $.getJSON('data/organisation.sample.json', params).done(function (data) {
                if (data.organisation) {
                    dbkjs.options.organisation = data.organisation;
                    if (dbkjs.options.organisation.title) {
                        document.title = dbkjs.options.organisation.title;
                    }
                    dbkjs.successAuth();
                }
            });
        }
    });
};

dbkjs.successAuth = function () {
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

    dbkjs.gui.setLogo();

    //register modules
    $.each(dbkjs.modules, function (mod_index, module) {
        if ($.inArray(mod_index, dbkjs.options.organisation.modules) > -1) {
            if (module.register) {
                module.register({namespace: dbkjs.options.organisation.workspace, url: 'geoserver/', visible: true, viewmode: dbkjs.viewmode});
            }
        }
    });

    dbkjs.loadOrganisationCapabilities();
    $(dbkjs).trigger('dbkjs_init_complete');
};

//@TODO: Deze goed controleren, er was een haakjes conflict na de resolve
dbkjs.loadOrganisationCapabilities = function() {
    if (dbkjs.options.organisation.wms){
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
                if (!dbkjs.util.isJsonNull(wms_v.legend)){
                    metadata.legend = wms_v.legend;
                }
                var layertype = wms_v.layertype || null;
                var myLayer = new dbkjs.Layer(
                    wms_v.name,
                    wms_v.url,
                    params,
                    options,
                    parent,
                    index,
                    metadata,
                    layertype
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
                var layertype = wms_v.layertype || null;
                var myLayer = new dbkjs.Layer(
                    wms_v.name,
                    wms_v.url,
                    params,
                    options,
                    parent,
                    index,
                    metadata,
                    layertype
                );
            }

        });
        if(dbkjs.loadingcapabilities === 0){
            dbkjs.finishMap();
        }
    } else {
        dbkjs.finishMap();
    };
};

dbkjs.finishMap = function () {
    //find the div that contains the baseLayer.name
    var listItems = $("#baselayerpanel_ul li");
    listItems.each(function (idx, li) {
        var test = $(li).children(':first').text();
        if (test === dbkjs.map.baseLayer.name) {
            $(li).addClass('active');
        }
    });
    if (dbkjs.layout) {
        dbkjs.layout.activate();
    }
    dbkjs.activateClick();

    dbkjs.selectControl.activate();
    var hrefzoom = dbkjs.util.getQueryVariable('zoom');
    var hreflat = dbkjs.util.getQueryVariable('lat');
    var hreflon = dbkjs.util.getQueryVariable('lon');
    if (hrefzoom && hreflat && hreflon) {
        dbkjs.argparser = new dbkjs.argParser();
        dbkjs.map.addControl(dbkjs.argparser);
    } else {
        if (dbkjs.options.organisation.area) {
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
            } else if (dbkjs.options.organisation.area.geometry.type === "Polygon") {
                if (dbkjs.viewmode === 'fullscreen') {
                    var areaGeometry = new OpenLayers.Format.GeoJSON().read(dbkjs.options.organisation.area.geometry, "Geometry");
                    dbkjs.map.zoomToExtent(areaGeometry.getBounds());
                } else {
                    //get the projection for the Polygon
                    var crs = dbkjs.options.organisation.area.geometry.crs.properties.name || "EPSG:4326";
                    var areaGeometry = new OpenLayers.Format.GeoJSON().read(dbkjs.options.organisation.area.geometry, "Geometry");
                    dbkjs.map.zoomToExtent(areaGeometry.getBounds().transform(crs, dbkjs.map.getProjectionObject()));
                }
            }
        } else {
            dbkjs.map.zoomToMaxExtent();
        }
    }
    dbkjs.permalink = new dbkjs.Permalink('permalink');
    dbkjs.map.addControl(dbkjs.permalink);
    if (dbkjs.viewmode !== 'fullscreen') {
        dbkjs.util.configureLayers();
    }
    //get dbk!
};

dbkjs.setPaths = function() {
    if (!dbkjs.basePath) {
        dbkjs.basePath = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port;
        var pathname = window.location.pathname;
        // ensure basePath always ends with '/', remove 'index.html' if exists
        if(pathname.charAt(pathname.length - 1) !== '/') {
            pathname = pathname.substring(0, pathname.lastIndexOf('/')+1);
        }
        // ensure single '/' between hostname and path
        dbkjs.basePath = dbkjs.basePath + (pathname.charAt(0) === "/" ? pathname : "/" + pathname);
    }

    if (!dbkjs.dataPath) {
        dbkjs.dataPath = 'api/';
    }

    if (!dbkjs.mediaPath) {
        dbkjs.mediaPath = dbkjs.basePath + 'media/';
    }


};

dbkjs.bind_dbkjs_init_complete = function() {

    $(dbkjs).bind('dbkjs_init_complete', function() {

         if(dbkjs.viewmode !== 'fullscreen') {
            $('#zoom_prev').click(function() {
                dbkjs.naviHis.previousTrigger();
            });
            $('#zoom_next').click(function () {
                dbkjs.naviHis.nextTrigger();
            });
        } else {
            FastClick.attach(document.body);
        }
        (function () {
            function calcMaxWidth() {
                // Calculate the max width for dbk title so other buttons are never pushed down when name is too long
                var childWidth = 0;
                $('.main-button-group .btn-group').each(function () {
                    childWidth += $(this).outerWidth();
                });
                var maxWidth = $('.main-button-group').outerWidth() - childWidth;
                $('.dbk-title').css('max-width', (maxWidth - 25) + 'px');
            }
            // Listen for orientation changes
            window.addEventListener("orientationchange", function () {
                calcMaxWidth();
            }, false);
            calcMaxWidth();
        }());
    });
};

dbkjs.createFullScreenDialogs = function() {
    if (dbkjs.viewmode !== 'fullscreen') {
        $('body').append(dbkjs.util.createDialog('wmsclickpanel', '<i class="fa fa-info-circle"></i> ' + t("dialogs.clickinfo"), 'right:0;bottom:0;'));
        $('body').append(dbkjs.util.createDialog('vectorclickpanel', '<i class="fa fa-info-circle"></i> ' + t("dialogs.clickinfo"), 'left:0;bottom:0;'));
        $('body').append(dbkjs.util.createModal('printpanel', '<i class="fa fa-print"></i> ' + t("app.print"), ''));
        dbkjs.wms_panel = dbkjs.util.createTabbable();
        $('#wmsclickpanel_b').append(dbkjs.wms_panel);
        $('body').append(dbkjs.util.createDialog('minimappanel', '<i class="fa fa-picture-o"></i> ' + i18n.t("dialogs.refmap"), 'bottom:0;'));
        $('.dialog').drags({handle: '.panel-heading'});
        $('.btn-group').drags({handle: '.drag-handle'});
        dbkjs.util.setModalTitle('overlaypanel', i18n.t('map.overlays'));
        dbkjs.util.setModalTitle('baselayerpanel', i18n.t('map.baselayers'));
    }
};
    
// dbkjs.js: $(document).ready
dbkjs.documentReady = function() {
    // Make sure i18n is initialized
    i18n.init({
        lng: dbkjsLang, debug: false, postProcess: "doReplacements"
    }, function (t) {
        i18n.addPostProcessor("doReplacements", function (val, key, options) {
            if (dbkjs.options.i18nReplacements) {
                var lngReplacements = dbkjs.options.i18nReplacements[i18n.lng()];
                if (lngReplacements && lngReplacements[key]) {
                    return lngReplacements[key];
                }
            }
            return val;
        });
        document.title = dbkjs.options.APPLICATION + ' ' + dbkjs.options.VERSION;
        OpenLayers.Lang[dbkjsLang] = OpenLayers.Util.applyDefaults(
            {'Scale = 1 : ${scaleDenom}': t("app.scale")}
        );
        OpenLayers.Lang.setCode(dbkjsLang);
        if (dbkjs.viewmode !== 'fullscreen') {
            //$('body').append(dbkjs.util.createDialog('infopanel', '<i class="fa fa-info-circle"></i> ' + t("dialogs.info"), 'right:0;bottom:0;'));
            $('body').append(dbkjs.util.createDialog('infopanel', '<i class="icon-info-sign"></i> ' + t("dialogs.info"), 'right:0;bottom:0;'));
        } else {
            // Create the infopanel
            dbkjs.util.createModalPopup({name: 'infopanel'}).getView().append($('<div></div>').attr({'id': 'infopanel_b'}));
            // Create the DBK infopanel
            dbkjs.util.createModalPopup({name: 'dbkinfopanel'}).getView().append($('<div></div>').attr({'id': 'dbkinfopanel_b'}));

            // We are removing / moving some existing DIVS from HTML to convert prev. popups to fullscreen modal popups
            $('#baselayerpanel').remove();
            $('#overlaypanel').attr('id', 'tmp_overlaypanel');
            var baseLayerPopup = dbkjs.util.createModalPopup({name: 'baselayerpanel'});
            baseLayerPopup.getView().append($('<div></div>').attr({'id': 'baselayerpanel_b'}));
            var overlaypanelPopup = dbkjs.util.createModalPopup({name: 'overlaypanel'});
            overlaypanelPopup.getView().append($('#tmp_overlaypanel .tabbable'));
            $('#tmp_overlaypanel').remove();

            $('#tb01, #tb02').on('click', function (e) {
                e.preventDefault();
                var panelId = $(this).attr('href').replace('#', '');
                if (panelId === 'baselayerpanel') {
                    $.each(dbkjs.options.baselayers, function (bl_index, bl) {
                        if (bl.getVisibility()) {
                            $('#bl' + bl_index).addClass('active');
                        }
                    });
                }
                dbkjs.util.getModalPopup(panelId).show();
            });

        }
        
        dbkjs.createFullScreenDialogs();
        
        dbkjs.init();

        $('#infopanel_b').html(dbkjs.options.info);
        $('#tb03, #c_minimap').click(function() {
            if (this.id === "tb03") {
                if (dbkjs.viewmode !== 'fullscreen') {
                    $('#infopanel').toggle();
                } else {
                    dbkjs.util.getModalPopup('dbkinfopanel').show();
                }
            } else if (this.id === "c_minimap") {
                $('#minimappanel').toggle();
            }
        });
        // Added touchstart event to trigger click on. There was some weird behaviour combined with FastClick,
        // this seems to fix the issue
        $('#zoom_extent').on('click touchstart', function() {
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
                } else if (dbkjs.options.organisation.area.geometry.type === "Polygon") {
                    if (dbkjs.viewmode === 'fullscreen') {
                        var areaGeometry = new OpenLayers.Format.GeoJSON().read(
                                dbkjs.options.organisation.area.geometry, "Geometry");
                        dbkjs.map.zoomToExtent(areaGeometry.getBounds());
                    } else {
                        var crs = dbkjs.options.organisation.area.geometry.crs.properties.name || "EPSG:4326";
                        var areaGeometry = new OpenLayers.Format.GeoJSON().read(dbkjs.options.organisation.area.geometry, "Geometry");
                        dbkjs.map.zoomToExtent(areaGeometry.getBounds().transform(crs, dbkjs.map.getProjectionObject()));
                    }
                }
            }
        });

        dbkjs.bind_dbkjs_init_complete();
    });
};

$(document).ready(function() {
    dbkjs.documentReady();
});
