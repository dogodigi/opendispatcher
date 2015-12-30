
dbkjs.protocol.jsonDBK.process =  function(feature, onSuccess, noZoom) {
    var _obj = dbkjs.protocol.jsonDBK;

    if (!(feature && feature.attributes && feature.attributes.typeFeature)) {

        $('#dbkinfopanel_b').html('Geen DBK geselecteerd.');
        //$('.dbk-title').css('visibility', 'hidden');

        //clear all layers first!
        $.each(_obj.layers, function(idx, lyr){
           lyr.destroyFeatures();
        });
        dbkjs.options.feature = null;

        if(onSuccess) {
            onSuccess();
        }

        return;
    }

    var mySuccess = function() {
        $('#infopanel_f').html('');
        /*
        var title = "";
        if(feature.attributes.formeleNaam) {
            title = feature.attributes.formeleNaam;
        };
        if(feature.attributes.informeleNaam) {
            if(title === "") {
                title = feature.attributes.informeleNaam;
            } else {
                title = title + " (" + feature.attributes.informeleNaam + ")";
            }
        };
        if(title === "") {
            title = "DBK #" + feature.attributes.identificatie;
        };
        $('.dbk-title')
            .text(title)
            .css('visibility', 'visible')
            .on('click', function() {
                dbkjs.modules.feature.zoomToFeature(feature);
            });
        */
        if(onSuccess) {
            onSuccess();
        }
    };

    if (!dbkjs.options.feature || feature.id !== dbkjs.options.feature.id) {
        if (!dbkjs.protocol.jsonDBK.processing) {
            if(dbkjs.viewmode === 'fullscreen') {
                dbkjs.util.getModalPopup('infopanel').hide();
                dbkjs.util.getModalPopup('dbkinfopanel').hide();
            } else {
                $('#infopanel').hide();
            }
            dbkjs.protocol.jsonDBK.processing = true;
            dbkjs.util.alert('<i class="fa fa-spinner fa-spin"></i>', i18n.t('dialogs.running'), 'alert-info');
            if(feature.attributes.typeFeature === 'Object'){
                dbkjs.protocol.jsonDBK.getObject(feature, 'algemeen', !!noZoom, mySuccess);
            } else if (feature.attributes.typeFeature === 'Gebied') {
                dbkjs.protocol.jsonDBK.getGebied(feature, 'algemeen', !!noZoom, mySuccess);
            }
        }
    } else {
        //Check if processing is finished
        if (!dbkjs.protocol.jsonDBK.processing) {
            mySuccess();
            if(dbkjs.viewmode === 'fullscreen') {
                $('#dbkinfopanel_b').html(dbkjs.options.feature.div);
            } else {
                $('#infopanel_b').html(dbkjs.options.feature.div);
                $('#infopanel_f').html('');
                $('#infopanel').show();
            }
        }
    }
};
