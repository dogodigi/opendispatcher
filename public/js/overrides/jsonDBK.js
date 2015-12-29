
dbkjs.protocol.jsonDBK.constructBrandweervoorziening = function(feature){
    var _obj = dbkjs.protocol.jsonDBK;
    if(feature.brandweervoorziening){
        var id = 'collapse_brandweervoorziening_' + feature.identificatie;
        var bv_div = $('<div class="tab-pane" id="' + id + '"></div>');
        var bv_table_div = $('<div class="table-responsive"></div>');
        var bv_table = _obj.constructBrandweervoorzieningHeader();
        var features = [];
        $.each(feature.brandweervoorziening, function(idx, myGeometry){
            var myFeature = new OpenLayers.Feature.Vector(new OpenLayers.Format.GeoJSON().read(myGeometry.geometry, "Geometry"));
            myFeature.attributes = {
                "type" : myGeometry.typeVoorziening,
                "name": myGeometry.naamVoorziening,
                "information": myGeometry.aanvullendeInformatie,
                "rotation": myGeometry.hoek,
                "category": myGeometry.categorie,
                "namespace": myGeometry.namespace,
                "radius": myGeometry.radius,
                "fid": "brandweervoorziening_ft_" + idx
            };
            var myrow = _obj.constructBrandweervoorzieningRow(myFeature.attributes);
            myrow.mouseover(function(){
                dbkjs.selectControl.select(myFeature);
            });
            myrow.mouseout(function(){
                dbkjs.selectControl.unselect(myFeature);
            });
            bv_table.append(myrow);
            features.push(myFeature);

        });
        _obj.layerBrandweervoorziening.addFeatures(features);
        _obj.activateSelect(_obj.layerBrandweervoorziening);
        bv_table_div.append(bv_table);
        bv_div.append(bv_table_div);
        _obj.panel_group.append(bv_div);
        _obj.panel_tabs.append('<li><a data-toggle="tab" href="#' + id + '">'+ i18n.t('dbk.prevention')+ '</a></li>');
    }
};

dbkjs.protocol.jsonDBK.constructBrandweervoorzieningHeader = function() {
    var bv_table = $('<table class="table table-hover"></table>');
        bv_table.append('<tr><th>' +
                i18n.t('prevention.type') + '</th><th>' +
                i18n.t('prevention.name') + '</th><th>' +
                i18n.t('prevention.comment') + '</th></tr>');
    return bv_table;
};

dbkjs.protocol.jsonDBK.constructBrandweervoorzieningRow = function(brandweervoorziening) {
    var img = "images/" + brandweervoorziening.namespace.toLowerCase() + '/' +  brandweervoorziening.type + '.png';
    img = typeof imagesBase64 === 'undefined'  ? dbkjs.basePath + img : imagesBase64[img];
    return $('<tr>' +
                '<td><img class="thumb" src="' + img + '" alt="'+
                    brandweervoorziening.type +'" title="'+
                    brandweervoorziening.type+'"></td>' +
                '<td>' + brandweervoorziening.name + '</td>' +
                '<td>' + brandweervoorziening.information + '</td>' +
            '</tr>');
};

dbkjs.protocol.jsonDBK.constructOmsdetail = function(feature) {
};

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
