/* global OpenLayers */

var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.mapcontrols = {
    createMapControls: function() {
        var mousePos = new OpenLayers.Control.MousePosition({
            numDigits: dbkjs.options.projection.coordinates.numDigits,
            div: OpenLayers.Util.getElement('coords')
        });
        dbkjs.map.addControl(mousePos);

        var attribution = new OpenLayers.Control.Attribution({
            div: OpenLayers.Util.getElement('attribution')
        });
        dbkjs.map.addControl(attribution);

        var scalebar = new OpenLayers.Control.Scale(OpenLayers.Util.getElement('scale'));
        dbkjs.map.addControl(scalebar);

        dbkjs.naviHis = new OpenLayers.Control.NavigationHistory();
        dbkjs.map.addControl(dbkjs.naviHis);
        dbkjs.naviHis.activate();

        // DEZE STAAN LATER.

        dbkjs.overview = new OpenLayers.Control.OverviewMap({
            theme: null,
            div: document.getElementById('minimappanel_b'),
            size: new OpenLayers.Size(180, 180)
        });
        dbkjs.map.addControl(dbkjs.overview);
        dbkjs.map.addControl(new OpenLayers.Control.Zoom({
                zoomInId: "zoom_in",
                zoomOutId: "zoom_out"
            })
        );
    },
    //dbkjs.js: init
    registerMapEvents: function(baselayer_ul) {
        $('#baselayerpanel_b').append(baselayer_ul);
        dbkjs.map.events.register("moveend", dbkjs.map, function() {
            // Clear print when active. It should not be available after move.
            if(dbkjs.modules.print.printbox){
                dbkjs.modules.print.clear();
            }
            //check if the naviHis has any content
            if (dbkjs.naviHis.nextStack.length > 0) {
                //enable next button
                $('#zoom_next').removeClass('disabled');
            } else {
                $('#zoom_next').addClass('disabled');
            }
            if (dbkjs.naviHis.previousStack.length > 1) {
                //enable previous button
                $('#zoom_prev').removeClass('disabled');
            } else {
                $('#zoom_prev').addClass('disabled');
            }
        });
    }
};
