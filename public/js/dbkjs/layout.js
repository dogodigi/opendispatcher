/**
 * 
 * javascript to control layout and layout events
 * 
 * This module depends on dbkjs, jQuery and OpenLayers
 * 
 */

var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.layout = {
    activate: function() {
        var _obj = dbkjs.layout;
        _obj.settingsDialog('#settingspanel_b');
    },
    settingsDialog: function(parent) {
        $(parent).append('<h4>' + i18n.t('app.contrast') +'</h4><p>' + i18n.t('app.selectContrast') + '</p>');
        $(parent).append('<p><div class="row"><div class="col-xs-6">' +
                '<div class="input-group">' +
                '<input id="input_contrast" type="text" class="form-control">' +
                '</div></div>' +
                '<div class="col-xs-6"><span class="button-grp">' +
                '<button id="click_contrast_down" class="btn btn-default" type="button"><i class="icon-adjust"></i>&nbsp;<i class="icon-minus"></i></button>' +
                '<button id="click_contrast_up" class="btn btn-default" type="button"><i class="icon-plus">&nbsp;<i class="icon-adjust"></i></button>' +
                '</span></div></div></p><hr>'
                );
        $(parent).append('<hr>');
        $(parent).append(
                '<p><strong>' + dbkjs.options.APPLICATION + '</strong> ' + dbkjs.options.VERSION + ' (' + dbkjs.options.RELEASEDATE + ')' + '</p>' +
                '<p>' + dbkjs.options.REMARKS + '</p>'
                );

        $('#input_contrast').val(parseFloat(dbkjs.map.baseLayer.opacity).toFixed(1));
        $('#input_contrast').keypress(function(event) {
            if (event.keyCode === 13) {
                var newOpacity = parseFloat($('#input_contrast').val()).toFixed(1);
                if (newOpacity > 1.0) {
                    $('#input_contrast').val(1.0);
                    dbkjs.map.baseLayer.setOpacity(1.0);
                } else if (newOpacity > 1.0) {
                    $('#input_contrast').val(1.0);
                    dbkjs.map.baseLayer.setOpacity(1.0);
                } else {
                    $('#input_contrast').val(parseFloat($('#input_contrast').val()).toFixed(1));
                    dbkjs.map.baseLayer.setOpacity(newOpacity);
                }
            }
        });
        $('#click_contrast_up').click(function() {
            var newOpacity = parseFloat(($('#input_contrast').val()) + 0.1).toFixed(1);
            if (newOpacity > 1.0) {
                $('#input_contrast').val(1.0);
                dbkjs.map.baseLayer.setOpacity(1.0);
            } else {
                $('#input_contrast').val((parseFloat($('#input_contrast').val()) + 0.1).toFixed(1));
                dbkjs.map.baseLayer.setOpacity(newOpacity);
            }
        });
        $('#click_contrast_down').click(function() {
            var newOpacity = parseFloat(($('#input_contrast').val()) - 0.1).toFixed(1);
            if (newOpacity < 0.0) {
                $('#input_contrast').val(0.0);
                dbkjs.map.baseLayer.setOpacity(0.0);
            } else {
                $('#input_contrast').val((parseFloat($('#input_contrast').val()) - 0.1).toFixed(1));
                dbkjs.map.baseLayer.setOpacity(newOpacity);
            }
        });
    }
};


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
                var areaGeometry = new OpenLayers.Format.GeoJSON().read(dbkjs.options.organisation.area.geometry, "Geometry");
                dbkjs.map.zoomToExtent(areaGeometry.getBounds());
            }
    }
});

