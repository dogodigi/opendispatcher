
dbkjs.protocol.jsonDBK.constructBrandweervoorziening = function(brandweervoorziening){
    var _obj = dbkjs.protocol.jsonDBK;
    if(brandweervoorziening){
        var id = 'collapse_brandweervoorziening_' + dbkjs.options.feature.identificatie;
        var bv_div = $('<div class="tab-pane" id="' + id + '"></div>');
        var bv_table_div = $('<div class="table-responsive"></div>');
        var bv_table = _obj.constructBrandweervoorzieningHeader();
        var features = [];
        $.each(brandweervoorziening, function(idx, myGeometry){
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
    var img = "images/" + brandweervoorziening.namespace + '/' +  brandweervoorziening.type + '.png';
    img = typeof imagesBase64 === 'undefined'  ? dbkjs.basePath + img : imagesBase64[img];
    return $('<tr>' +
                '<td><img class="thumb" src="' + img + '" alt="'+
                    brandweervoorziening.type +'" title="'+
                    brandweervoorziening.type+'"></td>' +
                '<td>' + brandweervoorziening.name + '</td>' +
                '<td>' + brandweervoorziening.information + '</td>' +
            '</tr>');
};
    
dbkjs.protocol.jsonDBK.constructGevaarlijkestof = function(gevaarlijkestof){
    var _obj = dbkjs.protocol.jsonDBK;
    if(gevaarlijkestof){
        var id = 'collapse_gevaarlijkestof_' + dbkjs.options.feature.identificatie;
        var bv_div = $('<div class="tab-pane" id="' + id + '"></div>');
        var bv_table_div = $('<div class="table-responsive"></div>');
        var bv_table = _obj.constructGevaarlijkestofHeader();
        var features = [];
         $.each(gevaarlijkestof, function(idx, myGeometry){
            var myFeature = new OpenLayers.Feature.Vector(new OpenLayers.Format.GeoJSON().read(myGeometry.geometry, "Geometry"));
            myFeature.attributes = {
                "type" : myGeometry.symboolCode,
                "name": myGeometry.naamStof,
                "namespace": myGeometry.namespace,
                "quantity": myGeometry.hoeveelheid ? myGeometry.hoeveelheid.replace(/([0-9]+)([lL])/,"$1\u2113") : myGeometry.hoeveelheid,
                "indication": myGeometry.gevaarsindicatienummer,
                "information": myGeometry.aanvullendeInformatie,
                "unnumber": myGeometry.UNnummer,
                "fid": "gevaarlijkestof_ft_" + idx
            };
            var myrow = _obj.constructGevaarlijkestofRow(myFeature.attributes);
            myrow.mouseover(function(){
                dbkjs.selectControl.select(myFeature);
            });
            myrow.mouseout(function(){
                dbkjs.selectControl.unselect(myFeature);
            });
            bv_table.append(myrow);
            features.push(myFeature);
        });
        _obj.layerGevaarlijkestof.addFeatures(features);
        _obj.activateSelect(_obj.layerGevaarlijkestof);
        bv_table_div.append(bv_table);
        bv_div.append(bv_table_div);
        _obj.panel_group.append(bv_div);
        _obj.panel_tabs.append('<li><a data-toggle="tab" href="#' + id + '">'+ i18n.t('dbk.chemicals')+ '</a></li>');
    }
};
    
dbkjs.protocol.jsonDBK.constructGevaarlijkestofHeader = function() {
    var bv_table = $('<table class="table table-hover"></table>');
        bv_table.append('<tr><th>' +
            i18n.t('chemicals.type') + '</th><th>' +
            i18n.t('chemicals.indication') + '</th><th>' +
            i18n.t('chemicals.name') + '</th><th>' +
            i18n.t('chemicals.quantity') + '</th><th>' +
            i18n.t('chemicals.information') + '</th></tr>');
    return bv_table;
};
    
dbkjs.protocol.jsonDBK.constructGevaarlijkestofRow = function(gevaarlijkestof) {
    var img = 'images/' + gevaarlijkestof.namespace + '/' +  gevaarlijkestof.type + '.png';
    img = typeof imagesBase64 === 'undefined'  ? dbkjs.basePath + img : imagesBase64[img];
    return $('<tr>' +
        '<td><img class="thumb" src="' + img + '" alt="'+
            gevaarlijkestof.type +'" title="'+
            gevaarlijkestof.type+'"></td>' +
        '<td>' + '<div class="gevicode">' + gevaarlijkestof.indication +
            '</div><div class="unnummer">' +
            gevaarlijkestof.unnumber + '</div>' + '</td>' +
        '<td>' + gevaarlijkestof.name + '</td>' +
        '<td>' + gevaarlijkestof.quantity + '</td>' +

        '<td>' + gevaarlijkestof.information + '</td>' +
        '</tr>');
};

dbkjs.protocol.jsonDBK.constructOmsdetail = function(feature) {
};

dbkjs.protocol.jsonDBK.getfeatureinfo = function(e){
    $('#vectorclickpanel_h').html('<span class="h4"><i class="fa fa-info-circle">&nbsp;' + e.feature.layer.name + '</span>');
    if(e.feature.layer.name === 'Gevaarlijke stoffen' || e.feature.layer.name === 'Brandweervoorziening') {
        var html = $('<div class="table-responsive"></div>'),
            table = '';
        if(e.feature.layer.name === 'Gevaarlijke stoffen') {
            table = dbkjs.protocol.jsonDBK.constructGevaarlijkestofHeader();
            table.append(dbkjs.protocol.jsonDBK.constructGevaarlijkestofRow(e.feature.attributes));
            html.append(table);
        };
        if(e.feature.layer.name === 'Brandweervoorziening') {
            table = dbkjs.protocol.jsonDBK.constructBrandweervoorzieningHeader();
            table.append(dbkjs.protocol.jsonDBK.constructBrandweervoorzieningRow(e.feature.attributes));
        };
        html.append(table);
        $('#vectorclickpanel_b').html('').append(html);
        if(dbkjs.viewmode === 'fullscreen') {
            $('#vectorclickpanel').show().on('click', function() {
                dbkjs.selectControl.unselectAll();
                $('#vectorclickpanel').hide();
            });
        }
    } else {
        // Generic attribute table
        html = '<div class="table-responsive">';
        html += '<table class="table table-hover">';
        for (var j in e.feature.attributes) {
            if (!dbkjs.util.isJsonNull(e.feature.attributes[j])) {
                html += '<tr><td><span>' + j + "</span>: </td><td>" + e.feature.attributes[j] + "</td></tr>";
            }
        };
        html += "</table>";
        html += '</div>';
        $('#vectorclickpanel_b').html(html);
        $('#vectorclickpanel').show();
    }
};

dbkjs.protocol.jsonDBK.getGebied = function(feature, activetab, onSuccess) {
    var _obj = dbkjs.protocol.jsonDBK;
    if(activetab){
        _obj.active_tab = activetab;
    };
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
    };
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
    };
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
    };
    $.getJSON(dbkjs.dataPath + 'object/' + fid + '.json', params).done(function(data) {
        //clear all layers first!
        $.each(_obj.layers, function(idx, lyr){
           lyr.destroyFeatures();
        });
        if(onSuccess) {
            onSuccess();
        };
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
        };

        return;
    };

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
            };
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

