
dbkjs.protocol.jsonDBK.process =  function(feature, onSuccess) {
    $('#infopanel_f').html('');
    if (feature && feature.attributes && feature.attributes.typeFeature) {
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
        if (!dbkjs.options.feature || feature.id !== dbkjs.options.feature.id) {
            if (!dbkjs.protocol.jsonDBK.processing) {
                if(dbkjs.viewmode === 'fullscreen') {
                    dbkjs.util.getModalPopup('infopanel').hide();
                    dbkjs.util.getModalPopup('dbkinfopanel').hide();
                } else {
                    $('#infopanel').hide();
                }
                dbkjs.protocol.jsonDBK.processing = true;
                dbkjs.util.alert('<i class="icon-spinner icon-spin"></i>', i18n.t('dialogs.running'), 'alert-info');
                    if(feature.attributes.typeFeature === 'Object'){
                        dbkjs.protocol.jsonDBK.getObject(feature);
                    } else if (feature.attributes.typeFeature === 'Gebied') {
                        dbkjs.protocol.jsonDBK.getGebied(feature);
                    }
            }
        } else {
            //Check if processing is finished
            if (!dbkjs.protocol.jsonDBK.processing) {

                if(dbkjs.viewmode === 'fullscreen') {
                    $('#dbkinfopanel_b').html(dbkjs.options.feature.div);
                } else {
                    $('#infopanel_b').html(dbkjs.options.feature.div);
                    $('#infopanel_f').html('');
                    $('#infopanel').show();
                }
            }
        }
    }
};

