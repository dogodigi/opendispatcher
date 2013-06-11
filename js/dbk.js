OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
OpenLayers.Util.onImageLoadErrorColor = "transparent";

Proj4js.defs["EPSG:28992"] = "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.999908 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +towgs84=565.2369,50.0087,465.658,-0.406857330322398,0.350732676542563,-1.8703473836068,4.0812 +no_defs <>";
var info_text = "";
var map;
var selectControl;
var baselayers = [];
var overlays = [];
var modules = [];
var regio;
var pdok_tms = {
        baseURL: 'http://geodata.nationaalgeoregister.nl',
        TMS: 'http://geodata.nationaalgeoregister.nl/tms/',
        WMTS:  'http://geodata.nationaalgeoregister.nl/tiles/service/wmts',
        tileOriginLL: new OpenLayers.LonLat(-285401.920, 22598.080),
        tileOriginUL: new OpenLayers.LonLat(-285401.920, 903401.920),
        tileFullExtent: new OpenLayers.Bounds(-285401.920, 22598.080, 595401.920, 903401.920),
        serverResolutions : [3440.640, 1720.320, 860.160, 430.080, 215.040, 107.520, 53.760, 26.880, 13.440, 6.720, 3.360, 1.680, 0.840, 0.420, 0.210, 0.105, 0.0525],
        matrixIds : new Array(15),
        zoomOffset: 2
};

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

/**
 * Functie voor updaten van de zichtbaarheid van baselayers
 * @param {integer} nr
 */
function toggleBaseLayer(nr) {
    var layerbuttons = $(".bl");
    var i;
    for (i = 0; i < layerbuttons.length; i++) {
        if (i !== nr) {
            $(layerbuttons[i]).removeClass("layActive", true);
            baselayers[i].setVisibility(false);
        } else {
            $(layerbuttons[nr]).addClass("layActive", true);
            baselayers[nr].setVisibility(true);
            map.setBaseLayer(baselayers[nr]);
        }
    }
}
function onClick(e){
    $('#tb03').addClass('active');
        $('#infopanel').html('');
        $.each(modules, function(mod_index, module) {
            if (typeof(module.getfeatureinfo) !== "undefined") {
                module.getfeatureinfo(e);
            }
            
        });
}
function activateClick(){
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
        data: {"service": "wms","version": "1.3.0", "request": "GetMap"},
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
    $.each(modules, function(mod_index, module) {
        module.namespace = regio.id;
        module.url = regio.safetymaps_url;
        module.show(true);
        if(module.id === "dbkf"){
            selectControl = new OpenLayers.Control.SelectFeature(
                [module.layer],
                {
                    clickout: true, toggle: false,
                    multiple: false, hover: false,
                    toggleKey: "ctrlKey", // ctrl key removes from selection
                    multipleKey: "shiftKey" // shift key adds to selection
                }
            );
            map.addControl(selectControl);
            selectControl.activate();            
        }
    });
    activateClick();
}
/**
 * Initialisatie van de <OpenLayers.Map> 
 */
function init() {
    var matrixIds = [];
        for(var i=0; i<15; ++i) { 
            matrixIds[i]='EPSG:28992:'+i;
        }
    var resolutions = [3440.64, 1720.32, 860.16, 430.08, 215.04, 107.52, 53.76, 26.88, 13.44, 6.72, 3.36, 1.68, 0.84, 0.42, 0.21];
        
    var options = {
        theme: null,
        div: 'mapc1map1',
        projection: new OpenLayers.Projection("EPSG:28992"),
        units: "m",
        // Resoluties uit de Nederlandse tiling-richtlijn (www.geonovum.nl/index.php/tiling)
        resolutions: [860.160, 430.080, 215.040, 107.520, 53.760, 26.880, 13.440, 6.720, 3.360, 1.680, 0.840, 0.420, 0.210, 0.105, 0.0525],
        maxExtent: new OpenLayers.Bounds(-65200.96, 242799.04, 375200.96, 68320096)
    };
    map = new OpenLayers.Map(options);
    OpenLayers.Lang.setCode("nl");
    baselayers[0] = new OpenLayers.Layer.TMS( "osm-rd-TMS",
        "http://openbasiskaart.nl/mapcache/tms/",
        { layername: 'osm@rd', type: "png", serviceVersion:"1.0.0",
          gutter:0,buffer:0,isBaseLayer:true,transitionEffect:'resize',
          tileOrigin: new OpenLayers.LonLat(-285401.920000,22598.080000),
          resolutions:[3440.63999999999987267074,1720.31999999999993633537,860.15999999999996816769,430.07999999999998408384,215.03999999999999204192,107.51999999999999602096,53.75999999999999801048,26.87999999999999900524,13.43999999999999950262,6.71999999999999975131,3.35999999999999987566,1.67999999999999989342,0.84000000000000003553,0.42000000000000001776,0.21000000000000000888],
          zoomOffset:0,
          units:"m",
          maxExtent: new OpenLayers.Bounds(-285401.920000,22598.080000,595401.920000,903401.920000),
          projection: new OpenLayers.Projection("epsg:28992".toUpperCase()),
          sphericalMercator: false
        }
    );
    baselayers[1] = new OpenLayers.Layer.TMS(
        'BRT Achtergrond',
        'http://geodata.nationaalgeoregister.nl/tms/',
        {
            layername: 'brtachtergrondkaart', 
            isBaseLayer: true, 
            displayInLayerSwitcher: true,
            type: 'png8',
            matrixSet: 'EPSG:28992',
            matrixIds: matrixIds,
            tileOrigin: new OpenLayers.LonLat(-285401.92,22598.08),
            serverResolutions: resolutions,
            tileFulExtent: new OpenLayers.Bounds (-285401.92, 22598.08, 595401.9199999999, 903401.9199999999)
       }
    );
//  baselayers[0] = new OpenLayers.Layer.WMS('BRT achtergrond', 'http://geodata.nationaalgeoregister.nl/wmsc?',
//            {layers: "brtachtergrondkaart", format: "image/png8", transparent: false, bgcolor: "0x99b3cc"},
//    {transitionEffect: 'resize', singleTile: false, buffer: 0, isBaseLayer: true, visibility: true, attribution: "PDOK"}
//  );
    baselayers[2] = new OpenLayers.Layer.WMS('PDOK Luchtfoto 2009', 'http://geodata1.nationaalgeoregister.nl/luchtfoto/wms?',
            {layers: "luchtfoto", format: "image/jpeg", transparent: false},
      {transitionEffect: 'resize', singleTile: false, buffer: 0, isBaseLayer: true, visibility: true, attribution: "PDOK"}
    );
    baselayers[3] = new OpenLayers.Layer.TMS(
        'Topografische kaart 1:10.000',
        'http://geodata.nationaalgeoregister.nl/tms/',
        {
            layername: 'top10nl', 
            isBaseLayer: true, 
            displayInLayerSwitcher: true,
            type: 'png8',
            matrixSet: 'EPSG:28992',
            matrixIds: matrixIds,
            tileOrigin: new OpenLayers.LonLat(-285401.92,22598.08),
            serverResolutions: resolutions,
            tileFulExtent: new OpenLayers.Bounds (-285401.92, 22598.08, 595401.9199999999, 903401.9199999999)
       }
  );
    map.addLayers(baselayers);
    var wms_url;
    var wms_namespace;
    actieve_regio = getQueryVariable('regio', 'zeeland');
    actief_adres = getQueryVariable('adres');
    actieve_oms =  getQueryVariable('omsnummer');
    if(typeof(actief_adres) !== "undefined"){
        //zoek het adres op en gebruik dit om in te zoomen.
    }
    if(typeof(actieve_oms) !== "undefined"){
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
    scalebar = new OpenLayers.Control.ScaleLine();
    map.addControl(scalebar);
    
    $('#overlaypanel').append('<div class="baselayertitle">Lagen (aan/uit):</div>');
    $('#baselayerpanel').append('<div class="baselayertitle">Selecteer kaart:</div>');
    $.each(baselayers, function(bl_index, bl) {
        $('#baselayerpanel').append('<div class="bl" onclick="toggleBaseLayer(' + bl_index + ');">' + bl.name + '</div>');
    });
}

$(document).ready(function() {
    init();
    $('#infopanel').html(info_text);

    $('.mtab').click(function() {
        if ($(this).hasClass('active')) {
            $('.mtab').removeClass('active');
            if (this.id === "tb04") {
                vector.removeAllFeatures();
                geolocate.deactivate();
            }
            if (this.id === "tb03") {
                $('#infopanel').hide();
            }
            if (this.id === "tb02") {
                $('#baselayerpanel').hide();
            }
            if (this.id === "tb01") {
                $('#overlaypanel').hide();
            }
        } else {
            $('.mtab').removeClass('active');
            $('.panel').hide();
            $(this).addClass('active');
            if (this.id === "tb04") {
                if ($(this).hasClass('active') === true) {
                    geolocate.activate();
                }
            }
            if (this.id === "tb03") {
                $('#infopanel').show();
            }
            if (this.id === "tb02") {
                $('#baselayerpanel').show();
            }
            if (this.id === "tb01") {
                $('#overlaypanel').show();
            }
        }
    });
});
