
dbkjs.protocol.jsonDBK.getGebied = function(feature, activetab, onSuccess) {
    var _obj = dbkjs.protocol.jsonDBK;
    if(activetab){
        _obj.active_tab = activetab;
    }
    var params = {
        srid: dbkjs.options.projection.srid,
        timestamp: new Date().getTime()
    };
    var fid;
    if(feature.attributes){
        fid = feature.attributes.identificatie;
    } else {
        //the function is not recieving a feature, but a string
        fid = feature;
    }
    $.getJSON(dbkjs.dataPath + 'gebied/' + fid + '.json', params).done(function(data) {
        //clear all layers first!
        $.each(_obj.layers, function(idx, lyr){
           lyr.destroyFeatures();
        });
        if(onSuccess) {
            onSuccess();
        }
        dbkjs.protocol.jsonDBK.info(data);
    }).fail(function( jqxhr, textStatus, error ) {
        dbkjs.options.feature = null;
        dbkjs.util.alert(i18n.t('app.error'), i18n.t('dialogs.infoNotFound'), 'alert-danger');
        _obj.processing = false;
    });
};

dbkjs.protocol.jsonDBK.getObject = function(feature, activetab, noZoom, onSuccess) {
    var _obj = dbkjs.protocol.jsonDBK;
    if(activetab){
     _obj.active_tab = activetab;
    }
    var params = {
        srid: dbkjs.options.projection.srid,
        timestamp: new Date().getTime()
    };
    var fid;
    if(feature.attributes){
        fid = feature.attributes.identificatie;
    } else {
        //the function is not recieving a feature, but a string
        fid = feature;
    }
    $.getJSON(dbkjs.dataPath + 'object/' + fid + '.json', params).done(function(data) {
        //clear all layers first!
        $.each(_obj.layers, function(idx, lyr){
           lyr.destroyFeatures();
        });
        if(onSuccess) {
            onSuccess();
        }
        dbkjs.protocol.jsonDBK.info(data, noZoom);
    }).fail(function( jqxhr, textStatus, error ) {
        dbkjs.options.feature = null;
        dbkjs.util.alert(i18n.t('app.error'), i18n.t('dialogs.infoNotFound'), 'alert-danger');
        _obj.processing = false;
    });
};

dbkjs.protocol.jsonDBK.process =  function(feature, onSuccess) {
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
                dbkjs.protocol.jsonDBK.getObject(feature, 'algemeen', false, mySuccess);
            } else if (feature.attributes.typeFeature === 'Gebied') {
                dbkjs.protocol.jsonDBK.getGebied(feature, 'algemeen', mySuccess);
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
