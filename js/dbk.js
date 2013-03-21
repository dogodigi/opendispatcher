OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
OpenLayers.Util.onImageLoadErrorColor = "transparent";
Proj4js.defs["EPSG:28992"] = "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.999908 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +towgs84=565.2369,50.0087,465.658,-0.406857330322398,0.350732676542563,-1.8703473836068,4.0812 +no_defs <>";
var info_text = "";
var map;
var selectControl;
var baselayers = [];
var overlays = [];
var modules = [];


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

/**
 * Acties op basis van een click in de kaart op een laag waarvoor de select
 * functie aanstaat. 
 * 
 * 1. Controleer of een module actief is
 * 2. Controleer of de laag voor de feature gelijk is aan die van de module
 * 3. Geef de feature door aan de betreffende module
 * 
 * @param feature
 */
function onFeatureSelect(feature) {
    $('#infopanel').html('');
    $('#tb03').addClass('active');
    $.each(modules, function(mod_index, module) {
        if (feature.layer.name === module.layer.name) {
            module.select(feature);
        }
    });
}

/**
 * Sluit popups en panels behorende bij een eerder geselecteerde feature
 * 
 * 1. Sluit alle popups
 * 2. Controleer of een module actief is
 * 3. Controleer of de laag van de feature gelijk is aan die van de module
 * 4. Geef de feature door aan de betreffende module
 * 
 * @param feature
 */
function onFeatureUnselect(feature) {
    $('#mtab').removeClass('active');
    var i;
    for (i = 0; i < map.popups.length; i++) {
        map.popups[i].destroy();
    }
    $.each(modules, function(mod_index, module) {
        if (feature.layer.name === module.layer.name) {
            module.unselect();
        }
    });
    $('#infopanel').html(info_text);
}

/**
 * Initialisatie van de <OpenLayers.Map> 
 */
function init() {
    var options = {
        div: 'mapc1map1',
        projection: new OpenLayers.Projection("EPSG:28992"),
        units: "m",
        // Resoluties uit de Nederlandse tiling-richtlijn (www.geonovum.nl/index.php/tiling)
        resolutions: [860.160, 430.080, 215.040, 107.520, 53.760, 26.880, 13.440, 6.720, 3.360, 1.680, 0.840, 0.420, 0.210, 0.105, 0.0525],
        maxExtent: new OpenLayers.Bounds(-65200.96, 242799.04, 375200.96, 68320096)
    };
    map = new OpenLayers.Map(options);
    OpenLayers.Lang.setCode("nl");
    baselayers[0] = new OpenLayers.Layer.WMS('BRT achtergrond', 'http://geodata.nationaalgeoregister.nl/wmsc?',
            {layers: "brtachtergrondkaart", format: "image/png8", transparent: false, bgcolor: "0x99b3cc"},
    {transitionEffect: 'resize', singleTile: false, buffer: 0, isBaseLayer: true, visibility: true, attribution: "PDOK"});
    baselayers[1] = new OpenLayers.Layer.WMS('NLR Luchtfoto 2005', 'http://gdsc.nlr.nl/wms/lufo2005',
            {layers: "lufo2005-1m", format: "image/jpeg", transparent: false},
    {transitionEffect: 'resize', singleTile: false, buffer: 0, isBaseLayer: true, visibility: true, attribution: "NLR"});

    map.addLayers(baselayers);

    $('#overlaypanel').append('<div class="baselayertitle">Lagen (aan/uit):</div>');
    // Voeg de baselayers toe aan de baselayer panel
    $('#baselayerpanel').append('<div class="baselayertitle">Selecteer kaart:</div>');
    $.each(baselayers, function(bl_index, bl) {
        $('#baselayerpanel').append('<div class="bl" onclick="toggleBaseLayer(' + bl_index + ');">' + bl.name + '</div>');
    });
    var wms_url;
    var wms_namespace;
    var actieve_regio = getQueryVariable('regio','brabant');
    $.getJSON('data/regios.json', function(data) {
        if (data.type === "regiocollectie") {
            $.each(data.regios, function(key, val) {
                if (val.id === actieve_regio) {
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
                    wms_url = val.safetymaps_url;
                    wms_namespace = val.id;
                }
            });
            toggleBaseLayer(0);
            $.each(modules, function(mod_index, module) {
                module.namespace = wms_namespace;
                module.url = wms_url;
                module.show(true);
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
            //map.addControl(new OpenLayers.Control.LayerSwitcher({'ascending': false}));
            map.events.register('click', map, function(e) {
                $('#infopanel').html('');
                $.each(modules, function(mod_index, module) {
                    if (typeof(module.getfeatureinfo) !== "undefined") {
                        module.getfeatureinfo(e);
                    }
                });

                //check welke module er een getfeatureinfo actief heeft, gebruik deze
            });
        }
    });
}

$(document).ready(function() {
    init();
    $('#infopanel').html(info_text);

    $('.mtab').click(function() {
        if ($(this).hasClass('active')){
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
