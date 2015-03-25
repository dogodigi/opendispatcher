
dbkjs.modules.feature.featureInfohtml = function(feature) {
    var _obj = dbkjs.modules.feature;
    var ret_title = $('<li></li>');
    ret_title.append('<a href="#">' + feature.attributes.formeleNaam + '</a>');
    $(ret_title).click(function() {
        dbkjs.protocol.jsonDBK.process(feature, function() {
            _obj.zoomToFeature(feature);
        });
        return false;
    });
    return ret_title;
};

dbkjs.modules.feature.handleDbkOmsSearch = function(object) {
    var _obj = dbkjs.modules.feature;
    dbkjs.protocol.jsonDBK.process(object, function() {
        _obj.zoomToFeature(object);
    });
};

dbkjs.modules.feature.search_dbk = function() {
    var _obj = dbkjs.modules.feature,
        dbk_naam_array = _obj.getDbkSearchValues();
    $('#search_input').typeahead('destroy');
    $('#search_input').val('');
    $('#search_input').typeahead({
        name: 'dbk',
        local: dbk_naam_array,
        limit: 10
    });
    $('#search_input').bind('typeahead:selected', function(obj, datum) {
        _obj.handleDbkOmsSearch(datum);
    });
};

dbkjs.modules.feature.search_oms = function() {
    var _obj = dbkjs.modules.feature,
        dbk_naam_array = _obj.getOmsSearchValues();
    $('#search_input').typeahead('destroy');
    $('#search_input').val('');
    $('#search_input').typeahead({
        name: 'oms',
        local: dbk_naam_array,
        limit: 10
    });
    $('#search_input').bind('typeahead:selected', function(obj, datum) {
        _obj.handleDbkOmsSearch(datum);
    });
};

dbkjs.modules.feature.showFeatureInfo = function(feature) {
    dbkjs.protocol.jsonDBK.process(feature, function() {
        _obj.zoomToFeature(feature);
    });
    if(dbkjs.viewmode === 'fullscreen') {
        dbkjs.util.getModalPopup('infopanel').hide();
    } else {
        dbkjs.gui.infoPanelHide();
    }
};

dbkjs.modules.feature.zoomToFeature = function(feature) {
    dbkjs.options.dbk = feature === null ? null : feature.attributes.identificatie;
    dbkjs.modules.updateFilter(dbkjs.options.dbk);
    if(dbkjs.options.dbk) {
        if(!dbkjs.options.zoomToPandgeometrie) {
            if (dbkjs.map.zoom < dbkjs.options.zoom) {
                dbkjs.map.setCenter(feature.geometry.getBounds().getCenterLonLat(), dbkjs.options.zoom);
            } else {
                dbkjs.map.setCenter(feature.geometry.getBounds().getCenterLonLat());
            }
        } else {
            this.zoomToPandgeometrie();
        }
    };
    // getActive() changed, hide it
    this.layer.redraw();
};
