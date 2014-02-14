var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};

dbkjs.modules.measure = {
    distance_control: null,
    area_control: null,
    register: function() {
        var _obj = dbkjs.modules.measure;
        $('#btngrp_3').append('<a id="btn_measure_distance" class="btn btn-default navbar-btn" href="#" title="' + 
                i18n.t('map.measureDistance') + '"><i class="icon-resize-horizontal rotate_45"></i></a>');
        $('#btngrp_3').append('<a id="btn_measure_area" class="btn btn-default navbar-btn" href="#" title="' + 
                i18n.t('map.measureArea') + '"><i class="icon-bookmark-empty rotate_45"></i></a>');

        // style the sketch fancy
        var sketchSymbolizers = {
            "Point": {
                pointRadius: 4,
                graphicName: "square",
                fillColor: "white",
                fillOpacity: 1,
                strokeWidth: 1,
                strokeOpacity: 1,
                strokeColor: "#333333"
            },
            "Line": {
                strokeWidth: 3,
                strokeOpacity: 1,
                strokeColor: "#666666",
                strokeDashstyle: "dash"
            },
            "Polygon": {
                strokeWidth: 2,
                strokeOpacity: 1,
                strokeColor: "#666666",
                fillColor: "white",
                fillOpacity: 0.3
            }
        };
        var style = new OpenLayers.Style();
        style.addRules([
            new OpenLayers.Rule({symbolizer: sketchSymbolizers})
        ]);
        var styleMap = new OpenLayers.StyleMap({"default": style});
        _obj.distance_control = new OpenLayers.Control.Measure(
            OpenLayers.Handler.Path, {
                persist: true,
                handlerOptions: {
                    layerOptions: {
                        styleMap: styleMap
                    }
                }
            }
        );
        _obj.distance_control.events.on({
            "measure": _obj.handleMeasurements,
            "measurepartial": _obj.handleMeasurements
        });
        dbkjs.map.addControl(_obj.distance_control);
        _obj.area_control = new OpenLayers.Control.Measure(
            OpenLayers.Handler.Polygon, {
                persist: true,
                handlerOptions: {
                    layerOptions: {
                        styleMap: styleMap
                    }
                }
            }
        );
        _obj.area_control.events.on({
            "measure": _obj.handleMeasurements,
            "measurepartial": _obj.handleMeasurements
        });
        dbkjs.map.addControl(_obj.area_control);
        $('#btn_measure_distance').click(function() {
            $('#measure').html('');
            if ($(this).hasClass('active')) {
                _obj.area_control.deactivate();
                _obj.distance_control.deactivate();
                $(this).removeClass('active');
            } else {
                $(this).addClass('active');
                _obj.area_control.deactivate();
                _obj.distance_control.activate();
            }
        });
        $('#btn_measure_area').click(function() {
            $('#measure').html('');
            if ($(this).hasClass('active')) {
                _obj.area_control.deactivate();
                _obj.distance_control.deactivate();
                $(this).removeClass('active');
            } else {
                $(this).addClass('active');
                _obj.distance_control.deactivate();
                _obj.area_control.activate();
            }
        });
    },
    handleMeasurements: function(event) {
        //var geometry = event.geometry;
        var units = event.units;
        var order = event.order;
        var measure = event.measure;
        var out = "";
        if (order === 1) {
            out += "Afstand: " + measure.toFixed(3) + " " + units;
        } else {
            out += "Oppervlakte: " + measure.toFixed(3) + " " + units + "<sup>2</" + "sup>";
        }
        $('#measure').html(out);
    }
};