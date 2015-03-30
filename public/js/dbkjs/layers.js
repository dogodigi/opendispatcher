
var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.layers = {
    createBaseLayers: function() {
        var baselayer_ul = $('<ul id="baselayerpanel_ul" class="nav nav-pills nav-stacked">');
        $.each(dbkjs.options.baselayers, function(bl_index, bl) {
            var _li = $('<li class="bl" id="bl' + bl_index + '"><a href="#">' + bl.name + '</a></li>');
            baselayer_ul.append(_li);
            bl.events.register("loadstart", bl, function() {
                dbkjs.util.loadingStart(bl);
            });
            bl.events.register("loadend", bl, function() {
                dbkjs.util.loadingEnd(bl);
            });
            dbkjs.map.addLayer(bl);
            _li.on('click',function() {
                dbkjs.toggleBaseLayer(bl_index);
                if(dbkjs.viewmode === 'fullscreen') {
                    dbkjs.util.getModalPopup('baselayerpanel').hide();
                }
            });
        });
        $('#baselayerpanel_b').append(baselayer_ul);
        return baselayer_ul;
    }
};
