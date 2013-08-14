OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
OpenLayers.Util.onImageLoadErrorColor = "transparent";

Proj4js.defs["EPSG:28992"] = "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.999908 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +towgs84=565.2369,50.0087,465.658,-0.406857330322398,0.350732676542563,-1.8703473836068,4.0812 +no_defs <>";
var info_text = "";
var map;
var naviHis;
var selectControl;
var baselayers = [];
var overlays = [];
var modules = [];
var regio;
var dbk;
var pdok_tms = {
    baseURL: 'http://geodata.nationaalgeoregister.nl',
    TMS: 'http://geodata.nationaalgeoregister.nl/tms/',
    WMTS: 'http://geodata.nationaalgeoregister.nl/tiles/service/wmts',
    tileOriginLL: new OpenLayers.LonLat(-285401.920, 22598.080),
    tileOriginUL: new OpenLayers.LonLat(-285401.920, 903401.920),
    tileFullExtent: new OpenLayers.Bounds(-285401.920, 22598.080, 595401.920, 903401.920),
    serverResolutions: [3440.640, 1720.320, 860.160, 430.080, 215.040, 107.520, 53.760, 26.880, 13.440, 6.720, 3.360, 1.680, 0.840, 0.420, 0.210, 0.105, 0.0525],
    matrixIds: new Array(15),
    zoomOffset: 2
};

$('#c_prev').click(function() {
    naviHis.previousTrigger();
});
$('#c_next').click(function() {
    naviHis.nextTrigger();
});
$('#search_input').click(
        function() {
            $(this).val('');
        }
);

function isJsonNull(val) {
    if (val === "null" || val === null || val === "" || typeof(val) === "undefined") {
        return true;
    } else {
        return false;
    }
}
/**
 * 
 * @param {String} variable
 * @param {String} defaultvalue
 * @returns {String} the value for the given queryparameter
 */
function getQueryVariable(variable, defaultvalue) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    var returnval = defaultvalue;
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) === variable) {
            returnval = decodeURIComponent(pair[1]);
        }
    }
    return returnval;
}
$('div.btn-group ul.dropdown-menu li a').click(function(e) {
    $('#search_input').typeahead('destroy');
    $('#search_input').val('');
    var mdiv = $(this).parent().parent().parent();
    var mbtn = mdiv.parent().find('.input-group-addon');
    var minp = mdiv.parent().find('input');
    if ($(this).text() === " Adres") {
        mbtn.html('<i class="icon-home"></i>');
        minp.attr("placeholder", "zoek adres of POI");
        dbkjs.search.search();
    } else if ($(this).text() === " Coördinaat") {
        mbtn.html('<i class="icon-pushpin"></i>');
        minp.attr("placeholder", "lon,lat of X,Y punt voor decimaal");
        $('#search_input').change(function() {
            var ruwe_input = $('#search_input').val();
            var loc;
            //console.log($('#search_input').val());
            var coords = ruwe_input.split(',');
            coords[0] = parseFloat(coords[0]);
            coords[1] = parseFloat(coords[1]);
            if (coords.length === 2) {
                if (coords[0] > 2.0 && coords[0] < 8.0 && coords[1] > 50.0 && coords[0] < 54.0) { //wgs84
                    loc = new OpenLayers.LonLat(coords[0], coords[1]).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());
                    console.log(loc);
                    preparatie.updateFilter(0);
                    preventie.updateFilter(0);
                    gevaren.updateFilter(0);
                    dbkobject.updateFilter(0);
                    map.setCenter(loc, 11);
                } else if (coords[0] > -14000.0 && coords[0] < 293100.0 && coords[1] > 293100.0 && coords[0] < 650000.0) { //rd
                    loc = new OpenLayers.LonLat(coords[0], coords[1]).transform(new OpenLayers.Projection("EPSG:28992"), map.getProjectionObject());
                    console.log(loc);
                    preparatie.updateFilter(0);
                    preventie.updateFilter(0);
                    gevaren.updateFilter(0);
                    dbkobject.updateFilter(0);
                    map.setCenter(loc, 11);
                } else {
                    //fout! Kan coordinaat niet opsporen.
                }

            }

            return false;
        });
    } else if ($(this).text() === " DBK") {
        mbtn.html('<i class="icon-building"></i>');
        minp.attr("placeholder", "zoek dbk");
        dbkfeature.search_dbk();
    } else if ($(this).text() === " OMS") {
        mbtn.html('<i class="icon-bell"></i>');
        minp.attr("placeholder", "zoek oms");
        dbkfeature.search_oms();
    }
    mdiv.removeClass('open');
    mdiv.removeClass('active');
    e.preventDefault();
    return false;
});

//search_btn_dropdown.children('li').click(function() {
//    if ($(this).text() === "Address") {
//        //User wants to search on address, show a single input bar with address pre-
//        $('#search_input').html('<span class="add-on"><i class="icon-home"></i></span><input id="address_search" class="span2" type="text" placeholder="First Avenue 2, New York">');
//    } else if ($(this).text() === "Coördinates") {
//        $('#search_input').html('<span class="add-on"><i class="icon-globe"></i></span><input id="coord_search" class="span2" type="text" placeholder="5.1 , 52.4">');
//    } else if ($(this).text() === "Unit") {
//        $('#search_input').html('<span class="add-on"><i class="icon-truck"></i></span><input id="unit_search" class="span2" type="text" placeholder="54321">');
//    } else if ($(this).text() === "Incident") {
//        $('#search_input').html('<span class="add-on"><i class="icon-star"></i></span><input id="incident_search" class="span2" type="text" placeholder="3211">');
//    }
//    $(this).parent().toggle();
//});

/**
 * Functie voor updaten van de zichtbaarheid van baselayers
 * @param {integer} nr
 */
function toggleBaseLayer(nr) {
    var layerbuttons = $(".bl");
    var i;
    for (i = 0; i < layerbuttons.length; i++) {
        if (i !== nr) {
            $(layerbuttons[i]).removeClass("active", true);
            baselayers[i].setVisibility(false);
        } else {
            $(layerbuttons[nr]).addClass("active", true);
            baselayers[nr].setVisibility(true);
            map.setBaseLayer(baselayers[nr]);
        }
    }
}
function onClick(e) {
    $('#infopanel_b').html('');
    $('#infopanel_f').html('');
    $.each(modules, function(mod_index, module) {
        if (typeof(module.layer) !== "undefined" && module.layer.visibility) {
            if (typeof(module.getfeatureinfo) !== "undefined") {
                module.getfeatureinfo(e);
            }
        }
    });
}
function activateClick() {
    map.events.register('click', map, onClick);
    map.events.register('touchend', map, onClick);
}
/**
 * script voor updaten zichtbaarheid van overlays 
 * @param {<OpenLayers.Layer>} obj
 */
function toggleOverlay(obj) {
    var layers = map.getLayersByName(obj.name);
    if (layers.length === 1) {
        if (obj.checked === true) {
            layers[0].setVisibility(true);
        } else {
            layers[0].setVisibility(false);
        }
    } else {
        alert('layer niet gevonden (of meer dan 1)');
    }
}
function challengeAuth(regio) {
    $.ajax({
        //wms?service=WMS&version=1.1.0&request=GetMap&layers=zeeland:WFS_tblUitrukroute&styles=&bbox=10000.1,357800.1,10000.2,357800.2&width=5&height=5&srs=EPSG:28992
        url: "geoserver/" + regio.id + "/wms?layers=" + regio.id + ":WFS_tblUitrukroute&styles=&bbox=10000.1,357800.1,10000.2,357800.2&width=5&height=5&srs=EPSG:28992&format=image/png",
        data: {"service": "wms", "version": "1.3.0", "request": "GetMap"},
        method: 'GET',
        error: function(jqXHR, textStatus, errorThrown) {
            //@TODO what to do when auth fails?
        },
        success: function() {
            successAuth(regio);
        }

    });
}

function successAuth(regio) {
    //zoek de dbk op wanneer de variabele dbk gevuld is.
    //Geef de dbk door als filter
    //zoom naar de juiste dbk!
    selectControl = new OpenLayers.Control.SelectFeature(
            [],
            {
                clickout: true, toggle: false,
                multiple: false, hover: false,
                toggleKey: "ctrlKey", // ctrl key removes from selection
                multipleKey: "shiftKey" // shift key adds to selection
            }
    );
    map.addControl(selectControl);
    selectControl.activate();
    $.each(modules, function(mod_index, module) {
        module.namespace = regio.id;
        module.url = regio.safetymaps_url;
        module.show(true);

        if (module.id === "dbkf") {
            selectControl.setLayer((selectControl.layers || selectControl.layer).concat(module.layer));
        }
        //if (module.id === "dbkbag") {
//            selectControl.setLayer((selectControl.layers || selectControl.layer).concat(module.pand_layer));
//            selectControl.setLayer((selectControl.layers || selectControl.layer).concat(module.vbo_layer));
//        }
    });
    activateClick();
}
/**
 * Initialisatie van de <OpenLayers.Map> 
 */
function init() {
    var matrixIds = [];
    for (var i = 0; i < 15; ++i) {
        matrixIds[i] = 'EPSG:28992:' + i;
    }
    var resolutions = [3440.64, 1720.32, 860.16, 430.08, 215.04, 107.52, 53.76, 26.88, 13.44, 6.72, 3.36, 1.68, 0.84, 0.42, 0.21];

    var options = {
        theme: null,
        div: 'mapc1map1',
        projection: new OpenLayers.Projection("EPSG:28992"),
        units: "m",
        // Resoluties uit de Nederlandse tiling-richtlijn (www.geonovum.nl/index.php/tiling)
        //resolutions: [860.160, 430.080, 215.040, 107.520, 53.760, 26.880, 13.440, 6.720, 3.360, 1.680, 0.840, 0.420, 0.210, 0.105, 0.0525],
        resolutions: resolutions,
        maxExtent: new OpenLayers.Bounds(-65200.96, 242799.04, 375200.96, 68320096)
    };
    map = new OpenLayers.Map(options);
    OpenLayers.Lang.setCode("nl");
    baselayers[0] = new OpenLayers.Layer.TMS("Openbasiskaart",
            "http://openbasiskaart.nl/mapcache/tms/",
            {layername: 'osm-nb@rd', type: "png", serviceVersion: "1.0.0",
                gutter: 0, buffer: 0, isBaseLayer: true, transitionEffect: 'resize',
                tileOrigin: new OpenLayers.LonLat(-285401.92, 22598.08),
                resolutions: resolutions,
                zoomOffset: 0,
                units: "m",
                maxExtent: new OpenLayers.Bounds(-285401.92, 22598.08, 595401.92, 903401.92),
                projection: new OpenLayers.Projection("EPSG:28992"),
                sphericalMercator: false
            }
    );
//    baselayers[0] = new OpenLayers.Layer.WMS('openbasiskaart',
//            'http://openbasiskaart.nl/cgi-bin/mapserv.fcgi?map=/var/opt/openbasiskaart/mapserver/basemaps/osm-nobuildings.map',
//            {layers: "default", format: "image/jpeg", transparent: false},
//    {transitionEffect: 'resize', singleTile: false, buffer: 0, isBaseLayer: true, visibility: true, attribution: "ogg"}
//    );
    baselayers[1] = new OpenLayers.Layer.TMS(
            'Basisregistratie Topografie (PDOK)',
            'http://geodata.nationaalgeoregister.nl/tms/',
            {
                layername: 'brtachtergrondkaart',
                isBaseLayer: true,
                displayInLayerSwitcher: true,
                type: 'png8',
                matrixSet: 'EPSG:28992',
                matrixIds: matrixIds,
                tileOrigin: new OpenLayers.LonLat(-285401.92, 22598.08),
                serverResolutions: resolutions,
                tileFulExtent: new OpenLayers.Bounds(-285401.92, 22598.08, 595401.9199999999, 903401.9199999999)
            }
    );
//  baselayers[0] = new OpenLayers.Layer.WMS('BRT achtergrond', 'http://geodata.nationaalgeoregister.nl/wmsc?',
//            {layers: "brtachtergrondkaart", format: "image/png8", transparent: false, bgcolor: "0x99b3cc"},
//    {transitionEffect: 'resize', singleTile: false, buffer: 0, isBaseLayer: true, visibility: true, attribution: "PDOK"}
//  );
    baselayers[2] = new OpenLayers.Layer.WMS('Luchtfoto 2009 (PDOK)', 'http://geodata1.nationaalgeoregister.nl/luchtfoto/wms?',
            {layers: "luchtfoto", format: "image/jpeg", transparent: false},
    {transitionEffect: 'resize', singleTile: false, buffer: 0, isBaseLayer: true, visibility: true, attribution: "PDOK"}
    );
    baselayers[3] = new OpenLayers.Layer.TMS(
            'Topografische kaart 1:10.000 - top10nl (PDOK)',
            'http://geodata.nationaalgeoregister.nl/tms/',
            {
                layername: 'top10nl',
                isBaseLayer: true,
                displayInLayerSwitcher: true,
                type: 'png8',
                matrixSet: 'EPSG:28992',
                matrixIds: matrixIds,
                tileOrigin: new OpenLayers.LonLat(-285401.92, 22598.08),
                serverResolutions: resolutions,
                tileFulExtent: new OpenLayers.Bounds(-285401.92, 22598.08, 595401.9199999999, 903401.9199999999)
            }
    );
    map.addLayers(baselayers);
    var overviewmap = baselayers[1].clone();
    var wms_url;
    var wms_namespace;
    actieve_regio = getQueryVariable('regio', 'zeeland');
    actief_adres = getQueryVariable('adres');
    actieve_oms = getQueryVariable('omsnummer');
    dbk = getQueryVariable('dbk');
    if (typeof(actief_adres) !== "undefined") {
        //zoek het adres op en gebruik dit om in te zoomen.
    }
    if (typeof(actieve_oms) !== "undefined") {
        //zoek de oms op en gebruik dit om in te zoomen.

    }

    $.getJSON('data/regios.json', function(data) {
        if (data.type === "regiocollectie") {
            $.each(data.regios, function(key, val) {
                if (val.id === actieve_regio) {
                    regio = val;
                    if (val.gebied.geometry.type === "Point") {
                        map.setCenter(
                                new OpenLayers.LonLat(
                                val.gebied.geometry.coordinates[0],
                                val.gebied.geometry.coordinates[1]
                                ).transform(
                                new OpenLayers.Projection("EPSG:28992"),
                                map.getProjectionObject()
                                ),
                                val.gebied.zoom
                                );
                    }
                }
            });
            toggleBaseLayer(0);
            challengeAuth(regio);

        }
    });
    // Tonen RD-coordinaten
    var mousePos = new OpenLayers.Control.MousePosition({numDigits: 0, div: OpenLayers.Util.getElement('coords')});
    map.addControl(mousePos);
    if (geolocate) {
        map.addLayers([vector]);
        map.addControl(geolocate);
    }
    scalebar = new OpenLayers.Control.Scale(OpenLayers.Util.getElement('scale'));
    map.addControl(scalebar);
    naviHis = new OpenLayers.Control.NavigationHistory();
    map.addControl(naviHis);
    naviHis.activate();
    var baselayer_ul = $('<ul class="nav nav-pills nav-stacked">');

    $.each(baselayers, function(bl_index, bl) {
        baselayer_ul.append('<li class="bl" onclick="toggleBaseLayer(' + bl_index + ');"><a href="#">' + bl.name + '</a></li>');
    });
    $('#baselayerpanel_b').append(baselayer_ul);
    map.events.register("moveend", map, function() {
        //check if the naviHis has any content
        if (naviHis.nextStack.length > 0) {
            //enable next button
            $('#c_next').removeClass('disabled');
        } else {
            $('#c_next').addClass('disabled');
        }
        if (naviHis.previousStack.length > 1) {
            //enable previous button
            $('#c_prev').removeClass('disabled');
        } else {
            $('#c_prev').addClass('disabled');
        }
    });
    var overview1 = new OpenLayers.Control.OverviewMap({
        div: document.getElementById('minimappanel_b'),
        size: new OpenLayers.Size(180, 180)
    });
    map.addControl(overview1);
}

$(document).ready(function() {
    init();
    $('#infopanel_b').html(info_text);

    $('.btn').click(function() {
        if (this.id === "tb03") {
            $('#infopanel').toggle();
        } else if (this.id === "tb04") {
            if ($(this).hasClass('active')) {
                vector.removeAllFeatures();
                geolocate.deactivate();
            }
        }
        else if (this.id === "c_minimap") {
            $('#minimappanel').toggle();
        }
    });
});
