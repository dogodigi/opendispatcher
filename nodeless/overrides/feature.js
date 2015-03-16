
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

