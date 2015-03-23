
dbkjs.protocol.jsonDBK.getfeatureinfo = function(e){
    $('#vectorclickpanel_h').html('<span class="h4"><i class="icon-info-sign">&nbsp;' + e.feature.layer.name + '</span>');
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

