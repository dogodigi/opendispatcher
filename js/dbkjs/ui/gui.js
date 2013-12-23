var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.ui = dbkjs.ui || {};
dbkjs.ui.gui = {
    activate: function() {
        var _obj = dbkjs.ui.gui;
        _obj.settingsDialog('#settingspanel_b');
    },
    settingsDialog: function(parent) {
        $(parent).append('<h4>Contrast</h4><p>Kies een contrastwaarde van 0 tot 1 waarbij 0: doorzichtig en 1: volledig ondoorzichtig.</p>');
        $(parent).append('<p><div class="row"><div class="col-xs-6">' +
                '<div class="input-group">' +
                '<input id="input_contrast" type="text" class="form-control">' +
                '</div></div>' +
                '<div class="col-xs-6"><span class="button-grp">' +
                '<button id="click_contrast_down" class="btn btn-default" type="button"><i class="icon-adjust"></i>&nbsp;<i class="icon-minus"></i></button>' +
                '<button id="click_contrast_up" class="btn btn-default" type="button"><i class="icon-plus">&nbsp;<i class="icon-adjust"></i></button>' +
                '</span></div></div></p><hr>'
                );
        $(parent).append('<h4>Lagen toevoegen</h4><p>De volgende lagen zijn aanwezig op het systeem:</p>');
            var gbkn = new dbkjs.Layer({
                name: 'GBKN',
                url: 'map/mapserv',
                map: dbkjs.map,
                layerOptions: {map: '/home/mapserver/doiv.map', layers: 'gbkn_panden,gbkn_topografie'},
                parent: '#overlaypanel_b2',
                index: 2
            });
            var gebieden = new dbkjs.Layer({
                name: 'Gebieden',
                url: 'geoserver/dbk/wms',
                map: dbkjs.map,
                visibility: true,
                singleTile: true,
                getfeatureinfo: function(){},
                layerOptions: {
                    layers: 'gebieden'
                },
                parent: '#overlaypanel_b2',
                index: 6
            });
            $.each(dbkjs.options.regio.wms, function (wms_k, wms_v){
                var myCapabilities = new dbkjs.Capabilities(
                        {url: wms_v.url, title: wms_v.name, proxy: wms_v.proxy});
            });
            
            //var myCapabilities2 = new dbkjs.Capabilities({url: 'geoserver/brabantwater/wms?', title: 'Waterbedrijf'});
            //var myCapabilities3 = new dbkjs.Capabilities({url: 'risicokaart/ogc_wms_wfs/services?', title: 'Risicokaart'});
        $(parent).append('');
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
        