var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.protocol = dbkjs.protocol || {};
dbkjs.options = dbkjs.options || {};
dbkjs.options.feature = null;
dbkjs.protocol.jsonDBK = {
    processing: false,
    panel_group: null,
    panel_tabs: null,
    panel_algemeen: null,
    active_tab:'algemeen',
    init: function() {
        var _obj = dbkjs.protocol.jsonDBK;
        _obj.layerPandgeometrie = new OpenLayers.Layer.Vector("pandgeometrie",{
            styleMap: dbkjs.config.styles.dbkpand
        });
        _obj.layerBrandcompartiment = new OpenLayers.Layer.Vector("brandcompartiment",{
            styleMap: dbkjs.config.styles.dbkcompartiment
        });
        _obj.layerHulplijn = new OpenLayers.Layer.Vector("hulplijn",{
            styleMap: dbkjs.config.styles.hulplijn
        });
        _obj.layerToegangterrein = new OpenLayers.Layer.Vector("toegangterrein",{
            styleMap: dbkjs.config.styles.toegangterrein
        });
        _obj.layerBrandweervoorziening = new OpenLayers.Layer.Vector("brandweervoorziening",{
            styleMap: dbkjs.config.styles.brandweervoorziening
        });
        _obj.layerGevaarlijkestof = new OpenLayers.Layer.Vector("gevaarlijkestof",{
            styleMap: dbkjs.config.styles.gevaarlijkestof
        });
        _obj.layerTekstobject = new OpenLayers.Layer.Vector("tekstobject",{
            styleMap: dbkjs.config.styles.tekstobject
        });
        _obj.layers = [
            _obj.layerPandgeometrie, 
            _obj.layerBrandcompartiment,
            _obj.layerHulplijn,
            _obj.layerToegangterrein,
            _obj.layerBrandweervoorziening,
            _obj.layerGevaarlijkestof,
            _obj.layerTekstobject
        ];;
        dbkjs.map.addLayers(_obj.layers);
        dbkjs.selectControl.setLayer((dbkjs.selectControl.layers || dbkjs.selectControl.layer).concat(_obj.layers));
        dbkjs.hoverControl.setLayer((dbkjs.hoverControl.layers || dbkjs.hoverControl.layer).concat(_obj.layers));
        dbkjs.hoverControl.activate();
        dbkjs.selectControl.activate();
    },
    getObject: function(feature, activetab) {
        
        var _obj = dbkjs.protocol.jsonDBK;
        if(activetab){
         _obj.active_tab = activetab;   
        }
        //clear all layers first!
        $.each(_obj.layers, function(idx, lyr){
           lyr.destroyFeatures();
           lyr.events.on({
            //"featureselected": _obj.getfeatureinfo,
            "featuresadded": function() {
            },
            "featureunselected": function(e) {
               // $('#infopanel').hide();
            }
        });
        });
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
        $.getJSON('api/object/' + fid, params).done(function(data) {
                dbkjs.protocol.jsonDBK.info(data);
            }).fail(function( jqxhr, textStatus, error ) {
                dbkjs.options.feature = null;
                dbkjs.util.alert(i18n.t('app.error'), i18n.t('dialogs.infoNotFound'), 'alert-danger');
            });
    },
    getfeatureinfo: function(e){
        html = '<div class="table-responsive">';
            html += '<table class="table table-hover">';
            for (var j in e.feature.attributes) {
                //if ($.inArray(j, ['Omschrijving', 'GEVIcode', 'UNnr', 'Hoeveelheid', 'NaamStof']) > -1) {
                    if (!dbkjs.util.isJsonNull(e.feature.attributes[j])) {
                        html += '<tr><td><span>' + j + "</span>: </td><td>" + e.feature.attributes[j] + "</td></tr>";
                    }
                //}
            }
            html += "</table>";
        html += '</div>';
        //dbkjs.util.appendTab(dbkjs.wms_panel.attr("id"),'Brandcompartiment',html, true, 'br_comp_tab');
        $('#wmsclickpanel_b').html(html);
        $('#wmsclickpanel').show();
    },
    process: function(feature) {
        $('#infopanel_f').html('');
        if (feature) {
            if (!dbkjs.options.feature || feature.id !== dbkjs.options.feature.id) {
                if (!dbkjs.protocol.jsonDBK.processing) {
                    $('#infopanel').hide();
                    dbkjs.protocol.jsonDBK.processing = true;
                    dbkjs.util.alert('<i class="icon-spinner icon-spin"></i>', i18n.t('dialogs.running'), 'alert-info');
                    if(feature.attributes.typeFeature === 'Object'){
                        dbkjs.protocol.jsonDBK.getObject(feature);
                    } else if (feature.attributes.typeFeature === 'Object') {
                        dbkjs.protocol.jsonDBK.getGebied(feature);
                    }
                }
            } else {
                //Check if processing is finished
                if (!dbkjs.protocol.jsonDBK.processing) {
                    $('#infopanel_b').html(dbkjs.options.feature.div);
                    $('#infopanel_f').html('');
                    $('#infopanel').show();
                }
            }
        }
    },
    info: function(data) {
        var _obj = dbkjs.protocol.jsonDBK;
        if (data.DBKObject) {
            dbkjs.options.feature = data.DBKObject;
            _obj.panel_group = $('<div class="tab-content"></div>');
            _obj.panel_tabs = $('<ul class="nav nav-pills"></ul>');
            var div = $('<div class="tabbable"></div>');
            if (_obj.constructAlgemeen(data.DBKObject)) {
                _obj.constructContact(data.DBKObject.contact);
                _obj.constructBijzonderheid(data.DBKObject.bijzonderheid);
                _obj.constructVerblijf(data.DBKObject.verblijf);
                _obj.constructMedia(data.DBKObject.foto);
                _obj.constructFloors(data.DBKObject.verdiepingen);
                _obj.constructBrandweervoorziening(data.DBKObject.brandweervoorziening);
                _obj.constructGevaarlijkestof(data.DBKObject.gevaarlijkestof);
                div.append(_obj.panel_group);
                div.append(_obj.panel_tabs);
                $('#infopanel_b').html(div);
                $('#systeem_meldingen').hide();
            }
            if(data.DBKObject.pandgeometrie){
                var features = [];
                $.each(data.DBKObject.pandgeometrie, function(idx, myGeometry){
                    var myFeature = new OpenLayers.Feature.Vector(new OpenLayers.Format.GeoJSON().read(myGeometry.geometry, "Geometry"));
                    myFeature.attributes = { "id" : myGeometry.bagId,"status":myGeometry.bagStatus};
                    features.push(myFeature);
                });
                _obj.layerPandgeometrie.addFeatures(features);
            }
            if(data.DBKObject.hulplijn){
                var features = [];
                $.each(data.DBKObject.hulplijn, function(idx, myGeometry){
                    var myBearing = 0;
                    var myline = new OpenLayers.Format.GeoJSON().read(myGeometry.geometry, "Geometry");
                    var myFeature = new OpenLayers.Feature.Vector(myline); 
                    if (myGeometry.typeHulplijn === "Arrow"){
                        var myVertices = myline.getVertices();
                        var myEndpoint = myVertices[myVertices.length -1];
                        //revert bearing. Don't knwo why, but it works ;-)
                        myBearing = -(dbkjs.util.bearing(myVertices[myVertices.length -2], myVertices[myVertices.length -1]));
                        myFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Collection([myline,myEndpoint]));
                    }
                    myFeature.attributes = { "type": myGeometry.typeHulplijn, "rotation": myBearing};
                    features.push(myFeature);
                });
                _obj.layerHulplijn.addFeatures(features);
            }
            if(data.DBKObject.toegangterrein){
                var features = [];
                $.each(data.DBKObject.toegangterrein, function(idx, myGeometry){
                    var myBearing = 0;
                    var myline = new OpenLayers.Format.GeoJSON().read(myGeometry.geometry, "Geometry");
                    var myFeature = new OpenLayers.Feature.Vector(myline); 
                    var myVertices = myline.getVertices();
                    var myEndpoint = myVertices[myVertices.length -1];
                        //revert bearing. Don't knwo why, but it works ;-)
                    myBearing = -(dbkjs.util.bearing(myVertices[myVertices.length -2], myVertices[myVertices.length -1]));
                    myFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Collection([myline,myEndpoint]));
                    myFeature.attributes = { "primary": myGeometry.primair, "rotation": myBearing,
                    "title": myGeometry.naamRoute, "information": myGeometry.aanvullendeInformatie };
                    features.push(myFeature);
                });
                _obj.layerToegangterrein.addFeatures(features);
            }
            if(data.DBKObject.brandcompartiment){
                var features = [];
                $.each(data.DBKObject.brandcompartiment, function(idx, myGeometry){
                    var myFeature = new OpenLayers.Feature.Vector(new OpenLayers.Format.GeoJSON().read(myGeometry.geometry, "Geometry"));
                    //@todo: De omschrijving moet er nog bij, ook in de database!
                    myFeature.attributes = { "type" : myGeometry.typeScheiding};
                    features.push(myFeature);
                });
                _obj.layerBrandcompartiment.addFeatures(features);
            }
            
            if(data.DBKObject.tekstobject){
                var features = [];
                $.each(data.DBKObject.tekstobject, function(idx, myGeometry){
                    var myFeature = new OpenLayers.Feature.Vector(new OpenLayers.Format.GeoJSON().read(myGeometry.geometry, "Geometry"));
                    //@todo: De omschrijving moet er nog bij, ook in de database!
                    myFeature.attributes = { 
                        "title" : myGeometry.tekst,
                        "rotation" : myGeometry.hoek,
                        "scale": myGeometry.schaal + 2
                    };
                    features.push(myFeature);
                });
                _obj.layerTekstobject.addFeatures(features);
            }
            $('#infopanel').show();
            _obj.processing = false;
        } else {
            dbkjs.options.feature = null;
            dbkjs.util.alert(i18n.t('app.error'), i18n.t('dialogs.infoNotFound'), 'alert-danger');
        }
    },
    constructRow: function(val, caption) {
        if (!dbkjs.util.isJsonNull(val)) {
            var output = '<tr><td>' + caption + '</td><td>' + val + '</td></tr>';
            return output;
        } else {
            return '';
        }
    },
    constructAlgemeen: function(DBKObject) {
        var _obj = dbkjs.protocol.jsonDBK;
        /** Algemene dbk info **/
        dbkjs.util.changeDialogTitle('<i class="icon-building"></i> ' + DBKObject.formeleNaam);
        var controledatum = dbkjs.util.isJsonNull(DBKObject.controleDatum) ? '<span class="label label-warning">'+ 
                i18n.t('dbk.unknown')+ '</span>' : DBKObject.controleDatum;
        var bhvaanwezig = dbkjs.util.isJsonNull(DBKObject.BHVaanwezig) ? '<span class="label label-warning">'+ 
                i18n.t('dbk.noEmergencyResponse') +'</span>' : '<span class="label label-success">'+ 
                i18n.t('dbk.emergencyResponsePresent') + '</span>';
        var informelenaam = dbkjs.util.isJsonNull(DBKObject.informeleNaam) ? '' : DBKObject.informeleNaam;
        var omsnummer = dbkjs.util.isJsonNull(DBKObject.OMSnummer) ? '' : DBKObject.OMSnummer;
        var gebouwconstructie = dbkjs.util.isJsonNull(DBKObject.gebouwconstructie) ? '' : DBKObject.gebouwconstructie;
        var inzetprocedure = dbkjs.util.isJsonNull(DBKObject.inzetprocedure) ? '' : DBKObject.inzetprocedure;
        var gebruikstype = dbkjs.util.isJsonNull(DBKObject.gebruikstype) ? '' : DBKObject.gebruikstype;
        
        // @todo: Losse regel voor laagste en hoogste
        // Hoogste altijd positief (zegt Dennis, ik sla hem kort als het niet zo is)
        // Laagste; minnetje er voor, bij 0 niet tonen.
        // Verdiepingen berekenen. Bij hoogste; 1 = BG/0, 2 = 1 etc.
        var laagstebouwlaag;
        var hoogstebouwlaag;
        if(!dbkjs.util.isJsonNull(DBKObject.bouwlaag)){
          bouwlaag = DBKObject.bouwlaag;
        } else {
            bouwlaag = i18n.t('dbk.unknown');
        };
        if(!dbkjs.util.isJsonNull(DBKObject.laagsteBouwlaag)){
            laagstebouwlaag = DBKObject.laagsteBouwlaag === 0 ? 0 : -DBKObject.laagsteBouwlaag + ' (' + -DBKObject.laagsteBouwlaag + ')';
        } else {
            laagstebouwlaag = i18n.t('dbk.unknown');
        };
        if(!dbkjs.util.isJsonNull(DBKObject.hoogsteBouwlaag)){
            hoogstebouwlaag = DBKObject.hoogsteBouwlaag + ' (' + (DBKObject.hoogsteBouwlaag-1) + ')';
        } else {
            hoogstebouwlaag = i18n.t('dbk.unknown');
        };
        dbkjs.options.feature.bouwlaag = bouwlaag;
        dbkjs.options.feature.laagstebouwlaag = laagstebouwlaag;
        dbkjs.options.feature.hoogstebouwlaag = hoogstebouwlaag;
        var active_tab = _obj.active_tab === 'algemeen' ?  'active' : '';
        _obj.panel_algemeen = $('<div class="tab-pane ' + active_tab + '" id="collapse_algemeen_' + DBKObject.identificatie + '"></div>');
        var algemeen_table_div = $('<div class="table-responsive"></div>');
        var algemeen_table = $('<table class="table table-hover"></table>');
        algemeen_table.append(_obj.constructRow(informelenaam, i18n.t('dbk.alternativeName')));
        algemeen_table.append(_obj.constructRow(controledatum, i18n.t('dbk.dateChecked')));
        algemeen_table.append(_obj.constructRow(bhvaanwezig, i18n.t('dbk.emergencyResponse')));
        algemeen_table.append(_obj.constructRow(inzetprocedure, i18n.t('dbk.procedure')));
        algemeen_table.append(_obj.constructRow(gebouwconstructie, 'Gebouwconstructie'));
        algemeen_table.append(_obj.constructRow(omsnummer, i18n.t('dbk.fireAlarmCode')));
        algemeen_table.append(_obj.constructRow(gebruikstype, i18n.t('dbk.application')));
        algemeen_table.append(_obj.constructRow(bouwlaag, i18n.t('dbk.level')));
        algemeen_table.append(_obj.constructRow(laagstebouwlaag, i18n.t('dbk.lowLevel') + ' (' +  i18n.t('dbk.floor' + ')')));
        algemeen_table.append(_obj.constructRow(hoogstebouwlaag, i18n.t('dbk.highLevel') + ' (' +  i18n.t('dbk.floor' + ')')));
        
        if (DBKObject.adres) {
            //adres is een array of null
            $.each(DBKObject.adres, function(adres_index, waarde) {
                var adres_row = $('<tr></tr>');
                var adres_div = $('<td></td>');
                var openbareruimtenaam = dbkjs.util.isJsonNull(waarde.openbareRuimteNaam) ? '' : waarde.openbareRuimteNaam;
                var huisnummer = dbkjs.util.isJsonNull(waarde.huisnummer) ? '' : ' ' + waarde.huisnummer;
                var huisnummertoevoeging = dbkjs.util.isJsonNull(waarde.huisnummertoevoeging) ? '' : ' ' + waarde.huisnummertoevoeging;
                var huisletter = dbkjs.util.isJsonNull(waarde.huisletter) ? '' : ' ' + waarde.huisletter;
                var postcode = dbkjs.util.isJsonNull(waarde.postcode) ? '' : ' ' + waarde.postcode;
                var woonplaatsnaam = dbkjs.util.isJsonNull(waarde.woonplaatsNaam) ? '' : ' ' + waarde.woonplaatsNaam;
                var gemeentenaam = dbkjs.util.isJsonNull(waarde.gemeenteNaam) ? '' : ' ' + waarde.gemeenteNaam;
                var adresText = openbareruimtenaam + 
                    huisnummer + huisnummertoevoeging + huisletter + '<br/>' +
                    woonplaatsnaam + postcode + gemeentenaam;
                adres_div.append(adresText);
                adres_row.append(adres_div);
                algemeen_table.append(adres_row);
                if ($.inArray('bag', dbkjs.options.organisation.modules) > -1) {
                    if (!dbkjs.util.isJsonNull(waarde.bagId)){
                        var bag_div = $('<td></td>');
                        var bag_p = $('<p></p>');
                        var bag_button = $('<button type="button" class="btn btn-primary">' + i18n.t('dbk.tarryobjectid') + ' ' + waarde.bagId + '</button>');
                        bag_p.append(bag_button);
                        bag_button.click(function() {
                            if($.inArray('bag', dbkjs.options.organisation.modules) > -1) {
                                dbkjs.modules.bag.getVBO(waarde.bagId, function(result) {
                                    if (result.length === 0) {
                                        $('#collapse_algemeen_' + _obj.feature.id).append(
                                            '<div class="alert alert-warning alert-dismissable">' +
                                            '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
                                            '<strong>' + i18n.t('app.fail') +
                                            '</strong>' +
                                             waarde.bagId + ' ' + i18n.t('dialogs.infoNotFound') +
                                            '</div>'
                                        );
                                    } else {
                                        $('#bagpanel_b').html('');
                                        $.each(result, function(result_index, waarde) {
                                            dbkjs.modules.bag.vboInfo2(waarde);
                                        });
                                        $('#bagpanel').show();
                                    }
                                });
                            }
                        });
                        bag_div.append(bag_p);
                        adres_row.append(bag_div);
                    } else {
                        adres_row.append('<td></td>');
                    }
                } else {
                    adres_row.append('<td></td>');
                } 
            });
            algemeen_table_div.append(algemeen_table);
            _obj.panel_algemeen.append(algemeen_table_div);
            _obj.panel_group.html(_obj.panel_algemeen);
            if(active_tab === 'active'){
                _obj.panel_tabs.html('<li class="active"><a data-toggle="tab" href="#collapse_algemeen_' + DBKObject.identificatie + '">' + i18n.t('dbk.general') + '</a></li>');
            } else {
                _obj.panel_tabs.html('<li><a data-toggle="tab" href="#collapse_algemeen_' + DBKObject.identificatie + '">' + i18n.t('dbk.general') + '</a></li>');
            }
            _obj.panel_tabs.html();
            return true;
        } else {
            return false;
        }
    },
    constructBrandweervoorziening: function(brandweervoorziening){
        var _obj = dbkjs.protocol.jsonDBK;
        if(brandweervoorziening){
            var id = 'collapse_brandweervoorziening_' + dbkjs.options.feature.identificatie;
            var bv_div = $('<div class="tab-pane" id="' + id + '"></div>');
            var bv_table_div = $('<div class="table-responsive"></div>');
            var bv_table = $('<table class="table table-hover"></table>');
            bv_table.append('<tr><th>' + 
                    i18n.t('prevention.type') + '</th><th>' + 
                    i18n.t('prevention.name') + '</th><th>' + 
                    i18n.t('prevention.comment') + '</th></tr>');
            var features = [];
            $.each(brandweervoorziening, function(idx, myGeometry){
                var myFeature = new OpenLayers.Feature.Vector(new OpenLayers.Format.GeoJSON().read(myGeometry.geometry, "Geometry"));
                myFeature.attributes = { 
                    "type" : myGeometry.typeVoorziening, 
                    "name": myGeometry.naamVoorziening,
                    "information": myGeometry.aanvullendeInformatie,
                    "rotation": myGeometry.hoek,
                    "namespace": myGeometry.namespace,
                    "fid": "brandweervoorziening_ft_" + idx 
                };
                var myrow = $('<tr>' +
                        '<td>' + myFeature.attributes.type + '</td>' +
                        '<td>' + myFeature.attributes.name + '</td>' +
                        '<td>' + myFeature.attributes.information + '</td>'
                        + '</tr>');
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
            bv_table_div.append(bv_table);
            bv_div.append(bv_table_div);
            _obj.panel_group.append(bv_div);
            _obj.panel_tabs.append('<li><a data-toggle="tab" href="#' + id + '">'+ i18n.t('dbk.prevention')+ '</a></li>');
        }
    },
    constructGevaarlijkestof: function(gevaarlijkestof){
        var _obj = dbkjs.protocol.jsonDBK;
        if(gevaarlijkestof){
            var id = 'collapse_gevaarlijkestof_' + dbkjs.options.feature.identificatie;
            var bv_div = $('<div class="tab-pane" id="' + id + '"></div>');
            var bv_table_div = $('<div class="table-responsive"></div>');
            var bv_table = $('<table class="table table-hover"></table>');
            bv_table.append('<tr><th>' + 
                i18n.t('chemicals.type') + '</th><th>' + 
                i18n.t('chemicals.name') + '</th><th>' + 
                i18n.t('chemicals.quantity') + '</th><th>' + 
                i18n.t('chemicals.indication') + '</th><th>' + 
                i18n.t('chemicals.information') + '</th><th>' + 
                i18n.t('chemicals.unnumber') + '</th></tr>');
            var features = [];
             $.each(gevaarlijkestof, function(idx, myGeometry){
                var myFeature = new OpenLayers.Feature.Vector(new OpenLayers.Format.GeoJSON().read(myGeometry.geometry, "Geometry"));
                myFeature.attributes = { 
                    "type" : myGeometry.symboolCode, 
                    "name": myGeometry.naamStof,
                    "quantity": myGeometry.hoeveelheid,
                    "indication": myGeometry.gevaarsindicatienummer,
                    "information": myGeometry.aanvullendeInformatie,
                    "unnumber": myGeometry.UNnummer,
                    "fid": "gevaarlijkestof_ft_" + idx
                };
                var myrow = $('<tr>' +
                        '<td>' + myFeature.attributes.type + '</td>' +
                        '<td>' + myFeature.attributes.name + '</td>' +
                        '<td>' + myFeature.attributes.quantity + '</td>' +
                        '<td>' + myFeature.attributes.indication + '</td>' +
                        '<td>' + myFeature.attributes.information + '</td>' +
                        '<td>' + myFeature.attributes.unnumber + '</td>'
                        + '</tr>');
                myrow.mouseover(function(){
                    dbkjs.selectControl.select(myFeature);
                });
                myrow.mouseout(function(){
                    dbkjs.selectControl.unselect(myFeature);
                })
                bv_table.append(myrow);
                features.push(myFeature);
            });
            _obj.layerGevaarlijkestof.addFeatures(features);
            bv_table_div.append(bv_table);
            bv_div.append(bv_table_div);
            _obj.panel_group.append(bv_div);
            _obj.panel_tabs.append('<li><a data-toggle="tab" href="#' + id + '">'+ i18n.t('dbk.chemicals')+ '</a></li>');
        }
    },
    constructFloors: function(verdiepingen) {
        var _obj = dbkjs.protocol.jsonDBK;
        if (verdiepingen && verdiepingen.length > 1) {
            var id = 'collapse_floors_' + dbkjs.options.feature.identificatie;
            var active_tab = _obj.active_tab === 'verdiepingen' ?  'active' : '';
            var verdiepingen_div = $('<div class="tab-pane ' + active_tab + '" id="' + id + '"></div>');
            var verdiepingen_table_div = $('<div class="table-responsive"></div>');
            var verdiepingen_table = $('<table class="table table-hover"></table>');
            verdiepingen_table.append('<tr><th>' + 
                    i18n.t('dbk.floor') + '</th></tr>');
            $.each(verdiepingen, function(verdiepingen_index, waarde) {
                var myrow;
                var sterretje = '';
                if (waarde.type === 'hoofdobject'){
                 sterretje = ' (' + i18n.t('dbk.mainobject') + ')';   
                }
                if(waarde.identificatie !== dbkjs.options.feature.identificatie){
                        
                        //Show the hyperlink!
                        myrow = $('<tr>' +
                            '<td>' + waarde.bouwlaag + sterretje +'</td>' +
                            '</tr>');
                        myrow.click(function(){
                            _obj.getObject(waarde.identificatie, 'verdiepingen');
                        });
                } else {
                    //No hyperlink, current object
                    myrow = $('<tr>' +
                            '<td><strong><em>' + waarde.bouwlaag + sterretje +'</em><strong></td>' +
                            '</tr>');

                }
                verdiepingen_table.append(myrow);
            });
            verdiepingen_table_div.append(verdiepingen_table);
            verdiepingen_div.append(verdiepingen_table_div);
            _obj.panel_group.append(verdiepingen_div);
            if(active_tab === 'active'){
                _obj.panel_tabs.append('<li class="' + active_tab + '"><a data-toggle="tab" href="#' + id + '">'+ i18n.t('dbk.floors')+ '</a></li>');
            } else {
                _obj.panel_tabs.append('<li><a data-toggle="tab" href="#' + id + '">'+ i18n.t('dbk.floors')+ '</a></li>');
            }
        }
    },
    constructContact: function(contact) {
        var _obj = dbkjs.protocol.jsonDBK;
        var id = 'collapse_contact_' + dbkjs.options.feature.identificatie;
        if (contact) {
            var active_tab = _obj.active_tab === 'gevaarlijkestof' ?  'active' : '';
            var contact_div = $('<div class="tab-pane" ' + active_tab + ' id="' + id + '"></div>');
            var contact_table_div = $('<div class="table-responsive"></div>');
            var contact_table = $('<table class="table table-hover"></table>');
            contact_table.append('<tr><th>' + 
                    i18n.t('contact.role') + '</th><th>' + 
                    i18n.t('contact.name') + '</th><th>' + 
                    i18n.t('contact.telephone') + '</th></tr>');
            $.each(contact, function(contact_index, waarde) {
                contact_table.append(
                        '<tr>' +
                        '<td>' + waarde.functie + '</td>' +
                        '<td>' + waarde.naam + '</td>' +
                        '<td>' + waarde.telefoonnummer + '</td>'
                        + '</tr>'
                        );
            });
            contact_table_div.append(contact_table);
            contact_div.append(contact_table_div);
            _obj.panel_group.append(contact_div);
            _obj.panel_tabs.append('<li><a data-toggle="tab" href="#' + id + '">'+ i18n.t('dbk.contact')+ '</a></li>');
        }
    },
    constructBijzonderheid: function(bijzonderheid) {
        var _obj = dbkjs.protocol.jsonDBK;
        var id = 'collapse_bijzonderheid_' + dbkjs.options.feature.identificatie;
        if (bijzonderheid) {
            var bijzonderheid_div = $('<div class="tab-pane" id="' + id + '"></div>');
            var bijzonderheid_table_div = $('<div class="table-responsive"></div>');
            var bijzonderheid_table = $('<table class="table table-hover"></table>');
            bijzonderheid_table.append('<tr><th>'+ i18n.t('particularies.type')+'</th><th>'+ i18n.t('particularies.comment')+'</th></tr>');
            var set = {
                Algemeen: {titel: 'Algemeen', waarde: ''},
                Preparatie: {titel: 'Preparatie', waarde: ''},
                Preventie: {titel: 'Preventie', waarde: ''},
                Repressie: {titel: 'Repressie', waarde: ''}
            };
            $.each(bijzonderheid, function(bijzonderheid_index, waarde) {
                if (!dbkjs.util.isJsonNull(waarde.soort)) {
                    var bijz = {soort: waarde.soort, tekst: waarde.tekst};
                    set[waarde.soort].waarde += bijz.tekst + '<br>';
                }
            });
            $.each(set, function(set_idx, set_entry) {
                if (set_entry.waarde !== '') {
                    bijzonderheid_table.append(
                            '<tr>' +
                            '<td>' + set_entry.titel + '</td>' +
                            '<td>' + set_entry.waarde + '</td>' +
                            +'</tr>'
                            );
                }
            });
            bijzonderheid_table_div.append(bijzonderheid_table);
            bijzonderheid_div.append(bijzonderheid_table_div);
            _obj.panel_group.append(bijzonderheid_div);
            _obj.panel_tabs.append('<li><a data-toggle="tab" href="#' + id + '">'+ i18n.t('dbk.particularities')+ '</a></li>');
        }
    },
    constructMedia: function(foto) {
        var _obj = dbkjs.protocol.jsonDBK;
        var id = 'collapse_foto_' + dbkjs.options.feature.identificatie;
        var car_id = 'carousel_foto_' + dbkjs.options.feature.identificatie;
        if (foto) {
            dbkjs.options.feature.images = [];
            var foto_div = $('<div class="tab-pane" id="' + id + '"></div>');
            var image_carousel = $('<div id="' + car_id + '" class="carousel slide" data-interval="false"></div>');
            var image_carousel_inner = $('<div class="carousel-inner"></div>');
            var image_carousel_nav = $('<ol class="carousel-indicators"></ol>');
            $.each(foto, function(foto_index, waarde) {
                var active = '';
                if (foto_index === 0) {
                    active = 'active';
                } else {
                    active = '';
                }
                var timestamp = new Date().getTime();
                var realpath = window.location.protocol + '//' + window.location.hostname + 
                        '/media/' + dbkjs.options.organisation.id + '/' + waarde.URL;
                if (waarde.filetype === "pdf" || waarde.filetype === "doc" || waarde.filetype === "docx") {
                    image_carousel_inner.append('<div class="item ' + active + 
                            '"><img src="images/missing.gif""><div class="carousel-caption"><a href="' + realpath + 
                            '" target="_blank"><h1><i class="icon-download icon-large"></h1></i></a><h3>' + 
                            waarde.naam + 
                            '</h3><a href="' + realpath + '" target="_blank"><h2>Download bestand</h2></a></div></div>');
                } else {
                    image_carousel_inner.append('<div class="item ' + active + '"><img src="' + realpath + '?timestamp=' + 
                            timestamp + '" onerror="dbkjs.util.mediaError(this);"><div class="carousel-caption"><h3>' + 
                            waarde.naam + '</h3><p></p></div></div>');
                    dbkjs.options.feature.images.push(realpath);
                }

                if (foto.length > 1) {
                    image_carousel_nav.append('<li data-target="#' + car_id + '" data-slide-to="' + 
                            foto_index + '" class="' + active + '"></li>');
                }
            });
            image_carousel.append(image_carousel_nav);
            image_carousel.append(image_carousel_inner);
            if (foto.length > 1) {
                image_carousel.append('<a class="left carousel-control" href="#' + car_id + '" data-slide="prev">' +
                        '<span class="icon-prev"></span></a>');
                image_carousel.append('<a class="right carousel-control" href="#' + car_id + '" data-slide="next">' +
                        '<span class="icon-next"></span></a>');
            }
            foto_div.append(image_carousel);
            _obj.panel_group.append(foto_div);
            _obj.panel_tabs.append('<li><a data-toggle="tab" href="#' + id + '">'+ i18n.t('dbk.media')+ '</a></li>');
        }
    },
    constructVerblijf: function(verblijf) {
        var _obj = dbkjs.protocol.jsonDBK;
        var id = 'collapse_verblijf_' + dbkjs.options.feature.identificatie;
        if (verblijf) {
            var verblijf_div = $('<div class="tab-pane" id="' + id + '"></div>');
            var verblijf_table_div = $('<div class="table-responsive"></div>');
            var verblijf_table = $('<table class="table table-hover"></table>');
            verblijf_table.append('<tr><th>' + i18n.t('tarry.from')+ '</th><th>' + 
                    i18n.t('tarry.to')+ '</th><th>' + 
                    i18n.t('tarry.ammount')+ '</th><th>' + 
                    i18n.t('tarry.notSelfReliant')+ '</th><th>' + 
                    i18n.t('tarry.group')+ '</th><th>' + 
                    i18n.t('tarry.days')+ '</th></tr>');
            $.each(verblijf, function(verblijf_index, waarde) {
                var dagen = '';
                dagen += !waarde.maandag ? '<span class="label label-default">' + moment.weekdaysMin(1)+ '</span>' : '<span class="label label-success">' + moment.weekdaysMin(1)+ '</span>';
                dagen += !waarde.dinsdag ? '<span class="label label-default">' + moment.weekdaysMin(2)+ '</span>' : '<span class="label label-success">' + moment.weekdaysMin(2)+ '</span>';
                dagen += !waarde.woensdag ? '<span class="label label-default">' + moment.weekdaysMin(3)+ '</span>' : '<span class="label label-success">' + moment.weekdaysMin(3)+ '</span>';
                dagen += !waarde.donderdag ? '<span class="label label-default">' + moment.weekdaysMin(4)+ '</span>' : '<span class="label label-success">' + moment.weekdaysMin(4)+ '</span>';
                dagen += !waarde.vrijdag ? '<span class="label label-default">' + moment.weekdaysMin(5)+ '</span>' : '<span class="label label-success">' + moment.weekdaysMin(5)+ '</span>';
                dagen += !waarde.zaterdag ? '<span class="label label-default">' + moment.weekdaysMin(6)+ '</span>' : '<span class="label label-success">' + moment.weekdaysMin(6)+ '</span>';
                dagen += !waarde.zondag ? '<span class="label label-default">' + moment.weekdaysMin(0)+ '</span>' : '<span class="label label-success">' + moment.weekdaysMin(0)+ '</span>';
                verblijf_table.append('<tr>' +
                        '<td>' + waarde.tijdvakBegintijd.substring(0,5) + '</td>' +
                        '<td>' + waarde.tijdvakEindtijd.substring(0,5) + '</td>' +
                        '<td>' + waarde.aantal + '</td>' +
                        '<td>' + waarde.aantalNietZelfredzaam + '</td>' +
                        '<td>' + waarde.typeAanwezigheidsgroep + '</td>' +
                        '<td>' + dagen + '</td>' +
                        '</tr>');
            });
            verblijf_table_div.append(verblijf_table);
            verblijf_div.append(verblijf_table_div);
            _obj.panel_group.append(verblijf_div);
            _obj.panel_tabs.append('<li><a data-toggle="tab" href="#' + id + '">'+ i18n.t('dbk.tarry')+ '</a></li>');
        }
    },
    getGebied: function(feature) {
        var params = {
            srid: dbkjs.options.projection.srid,
            timestamp: new Date().getTime()
        };
        $.getJSON('api/gebied/' + feature.attributes.identificatie, params).done(function(data) {
            dbkjs.protocol.jsonDBK.info(data);
        }).fail(function( jqxhr, textStatus, error ) {
            dbkjs.options.feature = null;
            dbkjs.util.alert(i18n.t('app.error'), i18n.t('dialogs.infoNotFound'), 'alert-danger');
        });
    }
};

