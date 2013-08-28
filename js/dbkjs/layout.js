/**
 * 
 * javascript to control layout and layout events
 * 
 * This module depends on dbkjs, jQuery and OpenLayers
 * 
 */
$('#c_prev').click(function() {
    dbkjs.naviHis.previousTrigger();
});
$('#c_next').click(function() {
    dbkjs.naviHis.nextTrigger();
});
$('#search_input').click(
    function() {
        $(this).val('');
    }
);

$('div.btn-group ul.dropdown-menu li a').click(function(e) {
    $('#search_input').typeahead('destroy');
    $('#search_input').val('');
    var mdiv = $(this).parent().parent().parent();
    var mbtn = $('#search-add-on');
    var minp = mdiv.parent().find('input');
    if ($(this).text() === " Adres") {
        mbtn.html('<i class="icon-home"></i>');
        minp.attr("placeholder", "zoek adres of POI");
        dbkjs.search.activate();
    } else if ($(this).text() === " Coördinaat") {
        mbtn.html('<i class="icon-pushpin"></i>');
        minp.attr("placeholder", "lon,lat of X,Y punt voor decimaal");
        $('#search_input').change(function() {
            var ruwe_input = $('#search_input').val();
            var loc;
            var coords = ruwe_input.split(',');
            coords[0] = parseFloat(coords[0]);
            coords[1] = parseFloat(coords[1]);
            if (coords.length === 2) {
                if (coords[0] > 2.0 && coords[0] < 8.0 && coords[1] > 50.0 && coords[0] < 54.0) { //wgs84
                    loc = new OpenLayers.LonLat(coords[0], coords[1]).transform(new OpenLayers.Projection("EPSG:4326"), dbkjs.map.getProjectionObject());
                    dbkjs.modules.updateFilter(0);
                    dbkjs.map.setCenter(loc, 11);
                } else if (coords[0] > -14000.0 && coords[0] < 293100.0 && coords[1] > 293100.0 && coords[0] < 650000.0) { //rd
                    loc = new OpenLayers.LonLat(coords[0], coords[1]).transform(new OpenLayers.Projection("EPSG:28992"), dbkjs.map.getProjectionObject());
                    dbkjs.modules.updateFilter(0);
                    dbkjs.map.setCenter(loc, 11);
                } else {
                    // @TODO build function to handle map fault
                }
            }
            return false;
        });
    } else if ($(this).text() === " DBK") {
        mbtn.html('<i class="icon-building"></i>');
        minp.attr("placeholder", "zoek dbk");
        dbkjs.modules.feature.search_dbk();
    } else if ($(this).text() === " OMS") {
        mbtn.html('<i class="icon-bell"></i>');
        minp.attr("placeholder", "zoek oms");
        dbkjs.modules.feature.search_oms();
    }
    mdiv.removeClass('open');
    mdiv.removeClass('active');
    e.preventDefault();
    return false;
});
