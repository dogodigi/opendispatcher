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
        if (dbkjs.protocol.getCapabilities) {
            //dbkjs.protocol.getCapabilities.get();
            // even een laag testen, brabantwater? komt ie
            var lufo2 = new dbkjs.Layer({
                name: 'Hoge resolutie luchtfoto',
                url: 'http://view.safetymaps.nl/map/mapserv',
                map: dbkjs.map,
                layerOptions: {map: '/home/mapserver/doiv.map', layers: 'luchtfoto'},
                parent: '#overlaypanel_b3',
                index: 0
            });
            var gbkn = new dbkjs.Layer({
                name: 'GBKN',
                url: 'http://view.safetymaps.nl/map/mapserv',
                map: dbkjs.map,
                layerOptions: {map: '/home/mapserver/doiv.map', layers: 'gbkn_panden,gbkn_topografie'},
                parent: '#overlaypanel_b3',
                index: 2
            });
            var kvt = new dbkjs.Layer({
                name: 'KVT',
                url: '/brabantnoord/wms',
                map: dbkjs.map,
                layerOptions: {layers: 'brwbn:KVTTARGET_U_region'},
                parent: '#overlaypanel_b2',
                index:4
            });
            
            var GWT_2400m_MI_region = new dbkjs.Layer({
                name: 'GWT Cirkel 2400m',
                url: '/brabantnoord/wms',
                map: dbkjs.map,
                layerOptions: {layers: 'brwbn:GWT_2400m_MI_region'},
                parent: '#overlaypanel_b2',
                index:4
            });
            var GWT_900m_MI_region = new dbkjs.Layer({
                name: 'GWT Cirkel 900m',
                url: '/brabantnoord/wms',
                map: dbkjs.map,
                layerOptions: {layers: 'brwbn:GWT_900m_MI_region'},
                parent: '#overlaypanel_b2',
                index:4
            });
            var GWT = new dbkjs.Layer({
                name: 'GWT',
                url: '/brabantnoord/wms',
                map: dbkjs.map,
                layerOptions: {layers: 'brwbn:GWT_REGIO_MI_font_point'},
                parent: '#overlaypanel_b2',
                index:4
            });
            var geboordeputten = new dbkjs.Layer({
                name: 'Geboorde putten',
                url: '/brabantnoord/wms',
                map: dbkjs.map,
                layerOptions: {layers: 'brwbn:Geboorde_Putten_font_point'},
                parent: '#overlaypanel_b2',
                index:4
            });
            var hydranten = new dbkjs.Layer({
                name: 'Hydranten',
                url: '/brabantnoord/wms',
                map: dbkjs.map,
                layerOptions: {layers: 'brwbn:Brandkranen'},
                parent: '#overlaypanel_b2',
                index:4
            });
            var brabantwater = new dbkjs.Layer({
                name: 'Leidingen',
                url: '/brabantnoord/wms',
                map: dbkjs.map,
                layerOptions: {layers: 'brwbn:Water'},
                parent: '#overlaypanel_b2',
                index:4
            });
            var was = new dbkjs.Layer({
                name: 'WAS palen',
                url: '/brabantnoord/wms',
                map: dbkjs.map,
                visibility: false,
                layerOptions: { layers: 'brwbn:WAS'},
                parent: '#overlaypanel_b3',
                index: 6
            });
            var gebieden = new dbkjs.Layer({
                name: 'Gebieden',
                url: 'http://view.safetymaps.nl/map/mapserv',
                map: dbkjs.map,
                visibility: true,
                layerOptions: {map: '/home/mapserver/doiv.map', layers: 'gebieden'},
                parent: '#overlaypanel_b3',
                index: 6
            });
        }
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
        