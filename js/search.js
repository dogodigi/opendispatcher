// single dataset
var data = {
    "options": [
        "Option 1",
        "Option 2",
        "Option 3",
        "Option 4",
        "Option 5"
    ]
};

//$('#search_input').typeahead({
//    source: function (query, process) {
//        return data.options;
//    }
//});
////$('#search_input').typeahead({
//    minLength: 5,
//    source: function(query, process) {
//        streets = [];
//        streetsmap = {};
//        return $.get('/geocode/' + $('#country_input').val() + '/' + $('#place_input').val() + '/' + query, getdata, function(data) {
//            $.each(data, function(i, street) {
//                if (typeof(street.properties.address) !== "undefined") {
//                    streetsmap[street.properties.address.road] = street;
//                    streets.push(street.properties.address.road);
//                } else {
//                    streetsmap[street.properties.road] = street;
//                    streets.push(street.properties.road);
//                }
//            });
//            return process(streets);
//        });
//    },
//    updater: function(item) {
//        selectedStreet = streetsmap[item];
//        //$('input[name="street_id"]').val(selectedStreet.id);
//        return item;
//    }
//});