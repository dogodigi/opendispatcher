var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
dbkjs.modules.gebieden = {
    id: "dbkgebieden",
    /**
     * URL naar een statisch boringen bestand in gml formaat
     */
    url: "http://geo.safetymaps.nl/map/mapserv",
    namespace: "zeeland",
    /**
     * Laag. Wordt geiniteerd met de functie hydranten.show() kan worden overruled
     */
    layer: null,
    /**
     * 
     * @param {type} options
     * @returns {undefined}
     */
    register: function(options) {
        var _obj = dbkjs.modules.gebieden;
        _obj.namespace = options.namespace || _obj.namespace;
        _obj.url = options.url || _obj.url;
        _obj.visibility = options.visible || _obj.visibility;
        _obj.layer = new OpenLayers.Layer.WMS("gebieden", 'http://geo.safetymaps.nl/map/mapserv',
                {map: '/home/mapserver/doiv.map' ,layers: 'gebieden', format: 'image/png', transparent: true},
        {transitionEffect: 'none', singleTile: true, buffer: 0, isBaseLayer: false, visibility: _obj.visibility, attribution: "BRWBN"});
        dbkjs.map.addLayers([_obj.layer]);
        // vinkje op webpagina aan/uitzetten
        var dv_panel = $('<div class="panel"></div>');
        var dv_panel_heading = $('<div class="panel-heading"></div>');
        var dv_panel_title = $('<h4 class="panel-title"></div>');
        dv_panel_title.append('<input type="checkbox" name="box_' + _obj.id + '"/>&nbsp;');
        dv_panel_title.append(_obj.layer.name + '&nbsp;<a  class="accordion-toggle" data-toggle="collapse" href="#collapse_' + 
                _obj.id + '" data-parent="#overlaypanel_b" ><i class="icon-info-sign"></i></a>');
        dv_panel_heading.append(dv_panel_title);
        dv_panel.append(dv_panel_heading);
        var dv_panel_content = $('<div id="collapse_' + _obj.id + '" class="panel-collapse collapse"></div>');
        dv_panel_content.append('<div class="panel-body"><p>Regio-, district- en gemeente contouren. Toont tevens de district namen.</p><p>' +
        '<div class="row"><div class="col-xs-2"><div style="margin:4px 0 4px 0;background-color:#ffffff;border:3px solid #000000;">&nbsp;</div></div><div class="col-xs-10"> Regio contour</div></div>' +
        '<div class="row"><div class="col-xs-2"><div style="margin:4px 0 4px 0;background-color:#ffffff;border:2px solid #000000;">&nbsp;</div></div><div class="col-xs-10"> District contouren</div></div>' +
        '<div class="row"><div class="col-xs-2"><div style="margin:4px 0 4px 0;background-color:#ffffff;border:1px dashed #000000;">&nbsp;</div></div><div class="col-xs-10"> Gemeente contouren</div></div>' +
        '</p></div>');
        dv_panel.append(dv_panel_content);
        $('#overlaypanel_b').append(dv_panel);
        if (_obj.layer.getVisibility()) {
            //checkbox aan
            $('input[name="box_' + _obj.id + '"]').attr('checked','checked');
        }
        $('input[name="box_' + _obj.id + '"]').click(function() {
            if($(this).is(':checked')) {
                _obj.layer.setVisibility(true);
            } else {
                _obj.layer.setVisibility(false);
            }
        });
    }
};
