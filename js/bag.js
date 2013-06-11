/**
 * Objecten class, conform de DBK object definitie
 * 
 * Voor alle functionaliteit gerelateerd aan boringen
 */
var bag = {
    id: "dbkbag",
    /**
     * URL naar een statisch boringen bestand in gml formaat
     */
    url: "/geoserver/bag/wms?",
    namespace: "bag",
    /**
     * Laag. Wordt geiniteerd met de functie gevaren.show() kan worden overruled
     */
    layer: null,
    highlightlayer: null,
    /**
     * Initialisatie functie om objecten toe te voegen aan de kaart
     * @param {type} activate
     */
    show: function(activate) {
        this.layer = new OpenLayers.Layer.WMS("BAG", "/geoserver/wms?",
                {layers: 'bag:adres,bag:pandactueelbestaand', format: 'image/png', transparent: true},
        {transitionEffect: 'none', singleTile: true, buffer: 0, isBaseLayer: false, visibility: true, attribution: "LV"});
        if (activate === true) {
            map.addLayers([
                this.layer
            ]);
        }
        // vinkje op webpagina aan/uitzetten
        var dv_div = $('<div id="div_' + this.id + '" class="ovl aan"></div>');
        var dv_cbx = $('<input type="checkbox" id="cbx_' + this.id + '" name="' + this.layer.name + '" />');
        dv_div.append(dv_cbx);
        dv_div.append(this.layer.name);
        $('#overlaypanel').append(dv_div);
        $('#cbx_' + this.id).attr('checked', this.layer.visibility);
        $('#cbx_' + this.id).click(function() {
            if (this.checked === true) {
                bag.layer.setVisibility(true);
            } else {
                bag.layer.setVisibility(false);
            }
        });
        $('#div_' + this.id).click(function() {
            if ($(this).hasClass('aan')) {
                $(this).removeClass('aan');
                bag.layer.setVisibility(false);
            } else {
                $(this).addClass('aan');
                bag.layer.setVisibility(true);
            }
        });
    },
    panel: function(feature) {
        //verwerk de featureinformatie
        $('#infopanel').html("test");
        if (!$('#tb03').hasClass('close')) {
            $('#tb03').addClass('close');
        }
        $('#infopanel').toggle(true);
    }
};
modules.push(bag);
