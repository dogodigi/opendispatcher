/**
 * Objecten class, conform de DBK object definitie
 * 
 * Voor alle functionaliteit gerelateerd aan boringen
 */
var gevaren = {
    id: "dbkgev",
    /**
     * URL naar een statisch boringen bestand in gml formaat
     */
    url: "/geoserver/zeeland/wms?",
    namespace: "zeeland",
    /**
     * Laag. Wordt geiniteerd met de functie gevaren.show() kan worden overruled
     */
    layer: null,
    highlightlayer: null,
    updateFilter:  function(dbk_id) {
        var cql_filter = "";
        if(typeof(dbk_id) !== "undefined"){
            cql_filter = "DBK_ID=" + dbk_id;
            this.layer.mergeNewParams({'CQL_FILTER': cql_filter });
        } else {
            delete this.layer.params.CQL_FILTER;
        }
        this.layer.redraw();
        return false;
    },
    show: function(activate) {
        this.layer = new OpenLayers.Layer.WMS("Onderkende gevaren en inzetbijzonderheden", this.url,
                {layers: this.namespace + ':WFS_tblGevaarlijk_Stoffen', format: 'image/png', transparent: true},
        {transitionEffect: 'none', singleTile: true, buffer: 0, isBaseLayer: false, visibility: true, attribution: "Falck", maxResolution: 6.71});
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
                gevaren.layer.setVisibility(true);
            } else {
                gevaren.layer.setVisibility(false);
            }
        });
        $('#div_' + this.id).click(function() {
            if ($(this).hasClass('aan')) {
                $(this).removeClass('aan');
                gevaren.layer.setVisibility(false);
            } else {
                $(this).addClass('aan');
                gevaren.layer.setVisibility(true);
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
modules.push(gevaren);
