// @todo Add localization options

OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
OpenLayers.Lang["nl"] = OpenLayers.Util.applyDefaults({'Scale = 1 : ${scaleDenom}': "Schaal 1 : ${scaleDenom}"});
OpenLayers.Lang.setCode("nl");

Proj4js.defs["EPSG:28992"] = "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.999908 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +towgs84=565.2369,50.0087,465.658,-0.406857330322398,0.350732676542563,-1.8703473836068,4.0812 +no_defs <>";

var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || [];
dbkjs.overlays = dbkjs.overlays || [];

dbkjs.options = {
    projection: {
        code: "EPSG:28992",
        srid: 28992,
        coordinates: {
            numDigits: 0
        }
    }
};
dbkjs.options.VERSION = "1.0";
dbkjs.options.RELEASEDATE = '15-11-2013';
dbkjs.options.APPLICATION = 'DOIV';
dbkjs.options.REMARKS = 'Eerste release';
dbkjs.options.info = "";




// PDOK settings, particular for the Netherlands national geodata services
// If the Dutch projection is in effect, set the resolutions and the max extent
// See (www.geonovum.nl/index.php/tiling) [Dutch]

dbkjs.options.pdok = {
    tms: {
        baseURL: 'http://geodata.nationaalgeoregister.nl',
        TMS: 'http://geodata.nationaalgeoregister.nl/tms/',
        WMTS: 'http://geodata.nationaalgeoregister.nl/tiles/service/wmts',
        tileOrigin: new OpenLayers.LonLat(-285401.920, 22598.080),
        matrixSet: 'EPSG:28992',
        //tileOriginUL: new OpenLayers.LonLat(-285401.920, 903401.920),
        tileFullExtent: new OpenLayers.Bounds(-285401.920, 22598.080, 595401.920, 903401.920),
        serverResolutions: [3440.640, 1720.320, 860.160, 430.080, 215.040, 107.520, 53.760, 26.880, 13.440, 6.720, 3.360, 1.680, 0.840, 0.420, 0.210, 0.105, 0.0525],
        matrixIds: new Array(15),
        zoomOffset: 2
    }
};

dbkjs.options.pdok.matrixIds = [];
if (dbkjs.options.projection.code === 'EPSG:28992') {
    for (var i = 0; i < 15; ++i) {
        dbkjs.options.pdok.matrixIds[i] = dbkjs.options.projection.code + ':' + i;
    }
    dbkjs.options.pdok.resolutions = [3440.64, 1720.32, 860.16, 430.08, 215.04, 107.52, 53.76, 26.88, 13.44, 6.72, 3.36, 1.68, 0.84, 0.42, 0.210, 0.105, 0.0525, 0.02625, 0.013125, 0.0065625];
    dbkjs.options.pdok.maxExtent = new OpenLayers.Bounds(-65200.96, 242799.04, 375200.96, 68320096);
    dbkjs.options.pdok.units = "m";
}


dbkjs.options.baselayers = [
    new OpenLayers.Layer.TMS(
            "Openbasiskaart",
            "http://openbasiskaart.nl/mapcache/tms/",
            {
                layername: 'osm-nb@rd', type: "png", serviceVersion: "1.0.0",
                gutter: 0, buffer: 0, isBaseLayer: true, transitionEffect: 'resize',
                tileOrigin: new OpenLayers.LonLat(-285401.92, 22598.08),
                resolutions: dbkjs.options.pdok.resolutions,
                zoomOffset: 0,
                units: "m",
                maxExtent: new OpenLayers.Bounds(-285401.92, 22598.08, 595401.92, 903401.92),
                projection: new OpenLayers.Projection("EPSG:28992"),
                sphericalMercator: false,
                attribution: "OpenStreetMap"
            }
    ),
    new OpenLayers.Layer.WMS(
            'Luchtfoto 2009 (PDOK)',
            'http://geodata1.nationaalgeoregister.nl/luchtfoto/wms?',
            {
                layers: "luchtfoto",
                format: "image/jpeg",
                transparent: false
            },
    {
        transitionEffect: 'resize',
        singleTile: false,
        buffer: 0,
        isBaseLayer: true,
        visibility: true,
        attribution: "PDOK"
    }
    ),
    new OpenLayers.Layer.WMS(
            'Hoge resolutie luchtfoto',
            'map/mapserv?map=/home/mapserver/doiv.map',
            {
                layers: 'luchtfoto',
                format: "image/png",
                transparent: false
            },
    {
        transitionEffect: 'resize',
        singleTile: false,
        buffer: 0,
        isBaseLayer: true,
        visibility: true,
        attribution: "Gemeentes Veiligheidsregio 21"
    }
    ),
    new OpenLayers.Layer.TMS(
            'Basisregistratie Topografie (PDOK)',
            dbkjs.options.pdok.tms.TMS,
            {
                layername: 'brtachtergrondkaart',
                isBaseLayer: true,
                displayInLayerSwitcher: true,
                type: 'png',
                matrixSet: dbkjs.options.pdok.matrixSet,
                matrixIds: dbkjs.options.pdok.matrixIds,
                tileOrigin: dbkjs.options.pdok.tms.tileOrigin,
                serverResolutions: dbkjs.options.pdok.tms.serverResolutions,
                tileFullExtent: dbkjs.options.pdok.tms.tileFullExtent,
                attribution: "PDOK"
            }
    ),
    new OpenLayers.Layer.TMS(
            'Topografische kaart 1:10.000 - top10nl (PDOK)',
            dbkjs.options.pdok.tms.TMS,
            {
                layername: 'top10nl',
                isBaseLayer: true,
                displayInLayerSwitcher: true,
                type: 'png',
                matrixSet: dbkjs.options.pdok.matrixSet,
                matrixIds: dbkjs.options.pdok.matrixIds,
                tileOrigin: dbkjs.options.pdok.tms.tileOrigin,
                serverResolutions: dbkjs.options.pdok.tms.serverResolutions,
                tileFullExtent: dbkjs.options.pdok.tms.tileFullExtent,
                attribution: "PDOK"
            }
    )
];

dbkjs.map = dbkjs.map || null;

dbkjs.init = function() {
    var options = {
        theme: null,
        controls: [new OpenLayers.Control.Navigation()],
        div: 'mapc1map1',
        projection: new OpenLayers.Projection(dbkjs.options.projection.code),
        resolutions: [3440.64, 1720.32, 860.16, 430.08, 215.04, 107.52, 53.76, 26.88, 13.44, 6.72, 3.36, 1.68, 0.84, 0.42, 0.210, 0.105, 0.0525, 0.02625, 0.013125, 0.0065625],
        xy_precision: 3,
        maxExtent: new OpenLayers.Bounds(-65200.96, 242799.04, 375200.96, 68320096),
        units: "m"
    };

    dbkjs.map = new OpenLayers.Map(options);
    dbkjs.map.addLayers(dbkjs.options.baselayers);
    dbkjs.options.organisation = {
        id: dbkjs.util.getQueryVariable(i18n.t('app.organisation'), 'demo')
    };
    dbkjs.options.adres = dbkjs.util.getQueryVariable(i18n.t('app.queryAddress'));
    dbkjs.options.omsnummer = dbkjs.util.getQueryVariable(i18n.t('app.queryNumber'));
    dbkjs.options.dbk = dbkjs.util.getQueryVariable(i18n.t('app.queryDBK'));
    var params = {srid: dbkjs.options.projection.srid};
    $.getJSON('/api/organisation', params).done(function(data) {
        if (data.organisation) {
            dbkjs.options.organisation = data.organisation;
            if (data.organisation.area.geometry.type === "Point") {
                dbkjs.map.setCenter(
                        new OpenLayers.LonLat(
                                data.organisation.area.geometry.coordinates[0],
                                data.organisation.area.geometry.coordinates[1]
                                ).transform(
                        new OpenLayers.Projection(dbkjs.options.projection.code),
                        dbkjs.map.getProjectionObject()
                        ),
                        data.organisation.area.zoom
                        );
            } else if (data.organisation.area.geometry.type === "Polygon"){
                var areaGeometry = new OpenLayers.Format.GeoJSON().read(data.organisation.area.geometry, "Geometry");
                dbkjs.map.zoomToExtent(areaGeometry.getBounds());
            }
            if (dbkjs.options.organisation.title) {
                document.title = dbkjs.options.organisation.title;
            }
            dbkjs.challengeAuth();

        }
    });
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
    var baselayer_ul = $('<ul class="nav nav-pills nav-stacked">');

    $.each(dbkjs.options.baselayers, function(bl_index, bl) {
        var _li = $('<li class="bl"><a href="#">' + bl.name + '</a></li>');
        baselayer_ul.append(_li);
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
    dbkjs.toggleBaseLayer(0);
    dbkjs.overview = new OpenLayers.Control.OverviewMap({
        div: document.getElementById('minimappanel_b'),
        size: new OpenLayers.Size(180, 180),
        theme: null
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
    var params = {
        "id":"milo"
    }
    $.getJSON('login', params).done(function(data) {
        if(data.login === 'ok'){
            dbkjs.successAuth();
        }
    }).fail(function( jqxhr, textStatus, error ) {
        dbkjs.options.feature = null;
        dbkjs.util.alert('Fout', ' Aanmelden mislukt', 'alert-danger');
    });
};

dbkjs.successAuth = function() {
    //zoek de dbk op wanneer de variabele dbk gevuld is.
    //Geef de dbk door als filter
    //zoom naar de juiste dbk!
    dbkjs.selectControl = new OpenLayers.Control.SelectFeature(
            [],
            {
                clickout: true, toggle: false,
                multiple: false, hover: false,
                toggleKey: "ctrlKey", // ctrl key removes from selection
                multipleKey: "shiftKey" // shift key adds to selection
            }
    );
    dbkjs.map.addControl(dbkjs.selectControl);
    dbkjs.selectControl.activate();

    //register modules
    $.each(dbkjs.modules, function(mod_index, module) {
        //Controleer of de regio een eigen logo heeft gedefinieerd
        if (dbkjs.options.organisation.logo) {
            $('#logo').css('background-image', 'url(' + dbkjs.options.organisation.logo + ')');
        }
        if ($.inArray(mod_index, dbkjs.options.organisation.modules) > -1) {
            if (module.register) {
                module.register({namespace: dbkjs.options.organisation.workspace, url: 'geoserver/', visible: true});
            }
        }
    });
    if (dbkjs.ui.gui) {
        dbkjs.ui.gui.activate();
    }
    dbkjs.activateClick();
};

$(document).ready(function() {
    // Make sure i18n is initialized
    i18n.init({lng: "nl-NL" }, function(t) {
        document.title = dbkjs.options.APPLICATION + ' ' + dbkjs.options.VERSION;
        $('body').append(dbkjs.util.createDialog('infopanel', '<i class="icon-info-sign"></i> ' + t("dialogs.info"), 'right:0;bottom:0;'));
        $('body').append(dbkjs.util.createDialog('bagpanel', '<i class="icon-home"></i> ' + t("dialogs.bag"), 'right:0;bottom:0;'));
        $('body').append(dbkjs.util.createDialog('wmsclickpanel', '<i class="icon-info-sign"></i> ' + t("dialogs.clickinfo"), 'right:0;bottom:0;'));
        dbkjs.wms_panel = dbkjs.util.createTabbable();
        $('#wmsclickpanel_b').append(dbkjs.wms_panel);
        $('body').append(dbkjs.util.createDialog('minimappanel', '<i class="icon-picture"></i> ' + i18n.t("dialogs.refmap"), 'bottom:0;'));
        $('.dialog').drags({handle: '.panel-heading'});
        $('.btn-group').drags({handle: '.drag-handle'});
        dbkjs.util.setModalTitle('overlaypanel', i18n.t('app.overlays'));
        dbkjs.util.setModalTitle('baselayerpanel', i18n.t('app.baselayers'));
        dbkjs.init();
        $('#infopanel_b').html(dbkjs.options.info);
        $('.btn').click(function() {
            if (this.id === "tb03") {
                $('#infopanel').toggle();
            } else if (this.id === "c_minimap") {
                $('#minimappanel').toggle();
            } else if (this.id === "c_print") {
                if (dbkjs.map) {
                    if (dbkjs.modules.print) {
                        dbkjs.modules.print.printdirect(dbkjs.map, 2);
                    }
                }
            }
        });
    });
});
