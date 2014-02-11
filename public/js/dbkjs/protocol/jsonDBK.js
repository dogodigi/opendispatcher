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
    init: function() {
        var _obj = dbkjs.protocol.jsonDBK;
        _obj.layerPandgeometrie = new OpenLayers.Layer.Vector("Pandgeometrie",{
            styleMap: dbkjs.config.styles.dbkpand
        });
        _obj.layerBrandcompartiment = new OpenLayers.Layer.Vector("Brandompartiment",{
            styleMap: dbkjs.config.styles.dbkcompartiment
        });
        _obj.layerBrandweervoorziening = new OpenLayers.Layer.Vector("brandweervoorziening",{
            styleMap: dbkjs.config.styles.brandweervoorziening
        });
        _obj.layerGevaarlijkestof = new OpenLayers.Layer.Vector("gevaarlijkestof",{
            styleMap: dbkjs.config.styles.gevaarlijkestof
        });
        _obj.layers = [
            _obj.layerPandgeometrie, 
            _obj.layerBrandcompartiment,
            _obj.layerBrandweervoorziening,
            _obj.layerGevaarlijkestof
        ];;
        dbkjs.map.addLayers(_obj.layers);
        _obj.hoverControl = new OpenLayers.Control.SelectFeature(
                _obj.layers,
                {
                    hover: true ,highlightOnly: true
                }
        );
        _obj.hoverControl.handlers.feature.stopDown = false;
        dbkjs.map.addControl(_obj.hoverControl);
    },
    getObject: function(feature) {
        var _obj = dbkjs.protocol.jsonDBK; 
        //clear all layers first!
        var params = {
            srid: dbkjs.options.projection.srid,
            timestamp: new Date().getTime()
        };
        $.getJSON('api/object/' + feature.attributes.identificatie, params).done(function(data) {
            dbkjs.protocol.jsonDBK.info(data);
            //@todo selectControl implementeren voor mouseover effecten.
            if(data.DBKObject.pandgeometrie){
                var features = [];
                $.each(data.DBKObject.pandgeometrie, function(idx, myGeometry){
                    var myFeature = new OpenLayers.Feature.Vector(new OpenLayers.Format.GeoJSON().read(myGeometry.geometry, "Geometry"));
                    myFeature.attributes = { "id" : myGeometry.bagId,"status":myGeometry.bagStatus};
                    features.push(myFeature);
                });
                _obj.layerPandgeometrie.addFeatures(features);
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
            if(data.DBKObject.brandweervoorziening){
                var features = [];
                $.each(data.DBKObject.brandweervoorziening, function(idx, myGeometry){
                    var myFeature = new OpenLayers.Feature.Vector(new OpenLayers.Format.GeoJSON().read(myGeometry.geometry, "Geometry"));
                    myFeature.attributes = { 
                        "type" : myGeometry.typeVoorziening, 
                        "name": myGeometry.naamVoorziening,
                        "information": myGeometry.aanvullendeInformatie,
                        "rotation": myGeometry.hoek
                    };
                    features.push(myFeature);
                });
                _obj.layerBrandweervoorziening.addFeatures(features);
            }
            if(data.DBKObject.gevaarlijkestof){
                var features = [];
                $.each(data.DBKObject.gevaarlijkestof, function(idx, myGeometry){
                    var myFeature = new OpenLayers.Feature.Vector(new OpenLayers.Format.GeoJSON().read(myGeometry.geometry, "Geometry"));
                    myFeature.attributes = { 
                        "type" : myGeometry.symboolCode, 
                        "name": myGeometry.naamStof,
                        "quantity": myGeometry.hoeveelheid,
                        "dangerindication": myGeometry.gevaarsindicatienummer,
                        "information": myGeometry.aanvullendeInformatie,
                        "unnumber": myGeometry.UNnummer
                        //rotation: not yet implemented
                    };
                    features.push(myFeature);
                });
                _obj.layerGevaarlijkestof.addFeatures(features);
            }
            _obj.hoverControl.activate();   
        }).fail(function( jqxhr, textStatus, error ) {
            dbkjs.options.feature = null;
            dbkjs.util.alert('Fout', ' Geen informatie gevonden', 'alert-danger');
        });
    },
    process: function(feature) {
        $('#infopanel_f').html('');
        if (feature) {
            if (!dbkjs.options.feature || feature.id !== dbkjs.options.feature.id) {
                if (!dbkjs.protocol.jsonDBK.processing) {
                    $('#infopanel').hide();
                    dbkjs.protocol.jsonDBK.processing = true;
                    dbkjs.util.alert('<i class="icon-spinner icon-spin"></i>', ' Objectinformatie wordt opgehaald...', 'alert-info');
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
    info: function(response) {
        var _obj = dbkjs.protocol.jsonDBK;
        if (response.DBKObject) {
            dbkjs.options.feature = response.DBKObject;
            _obj.panel_group = $('<div class="tab-content"></div>');
            _obj.panel_tabs = $('<ul class="nav nav-pills"></ul>');
            var div = $('<div class="tabbable"></div>');
            if (_obj.constructAlgemeen(response.DBKObject)) {
                _obj.constructGevaarlijkeStof(response.DBKObject.gevaarlijkestof);
                _obj.constructContact(response.DBKObject.contact);
                _obj.constructBijzonderheid(response.DBKObject.bijzonderheid);
                _obj.constructVerblijf(response.DBKObject.verblijf);
                _obj.constructMedia(response.DBKObject.foto);
                div.append(_obj.panel_group);
                div.append(_obj.panel_tabs);
                $('#infopanel_b').html(div);
                $('#systeem_meldingen').hide();
            }
            $('#infopanel').show();
            _obj.processing = false;
        } else {
            dbkjs.options.feature = null;
            dbkjs.util.alert('Fout', ' Geen informatie gevonden', 'alert-danger');
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
        var controledatum = dbkjs.util.isJsonNull(DBKObject.controleDatum) ? '<span class="label label-warning">Niet bekend</span>' : DBKObject.controleDatum;
        var bhvaanwezig = dbkjs.util.isJsonNull(DBKObject.BHVaanwezig) ? '<span class="label label-warning">Geen BHV aanwezig of onbekend</span>' : '<span class="label label-success">BHV aanwezig</span>';
        var informelenaam = dbkjs.util.isJsonNull(DBKObject.informeleNaam) ? '' : DBKObject.informeleNaam;
        var omsnummer = dbkjs.util.isJsonNull(DBKObject.OMSnummer) ? '' : DBKObject.OMSnummer;
        var gebouwconstructie = dbkjs.util.isJsonNull(DBKObject.gebouwconstructie) ? '' : DBKObject.gebouwconstructie;
        var inzetprocedure = dbkjs.util.isJsonNull(DBKObject.inzetprocedure) ? '' : DBKObject.inzetprocedure;
        var gebruikstype = dbkjs.util.isJsonNull(DBKObject.gebruikstype) ? '' : DBKObject.gebruikstype;
        var laagste = dbkjs.util.isJsonNull(DBKObject.laagsteBouwlaag) ? false : DBKObject.laagsteBouwlaag;
        var hoogste = dbkjs.util.isJsonNull(DBKObject.hoogsteBouwlaag) ? false : DBKObject.hoogsteBouwlaag;
        var bouwlaag = '';
        if (laagste && hoogste) {
            bouwlaag = 'Bouwlaag:' + laagste + ' t/m ' + hoogste + '';
        } else if (laagste && !hoogste) {
            bouwlaag = 'Laagste bouwlaag: ' + laagste + '';
        } else if (hoogste && !laagste) {
            bouwlaag = 'Hoogste bouwlaag: ' + hoogste + '';
        }
        dbkjs.options.feature.bouwlaag = bouwlaag;
        
        _obj.panel_algemeen = $('<div class="tab-pane active" id="collapse_algemeen_' + DBKObject.identificatie + '"></div>');
        var algemeen_table_div = $('<div class="table-responsive"></div>');
        var algemeen_table = $('<table class="table table-hover"></table>');
        algemeen_table.append(_obj.constructRow(informelenaam, 'Informele naam'));
        algemeen_table.append(_obj.constructRow(controledatum, 'Controledatum'));
        algemeen_table.append(_obj.constructRow(bhvaanwezig, 'BHV'));
        algemeen_table.append(_obj.constructRow(inzetprocedure, 'Inzetprocedure'));
        algemeen_table.append(_obj.constructRow(gebouwconstructie, 'Gebouwconstructie'));
        algemeen_table.append(_obj.constructRow(omsnummer, 'OMS nummer'));
        algemeen_table.append(_obj.constructRow(gebruikstype, 'Gebruik'));
        algemeen_table.append(_obj.constructRow(bouwlaag, 'Bouwlagen'));
        
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
                if (dbkjs.modules.bag) {
                    if (!dbkjs.util.isJsonNull(waarde.bagId)){
                        var bag_div = $('<td></td>');
                        var bag_p = $('<p></p>');
                        var bag_button = $('<button type="button" class="btn btn-primary">Verblijfsobject ' + waarde.bagId + '</button>');
                        bag_p.append(bag_button);
                        bag_button.click(function() {
                            if (dbkjs.modules.bag) {
                                dbkjs.modules.bag.getVBO(waarde.bagId, function(result) {
                                    if (result.length === 0) {
                                        $('#collapse_algemeen_' + _obj.feature.id).append(
                                            '<div class="alert alert-warning alert-dismissable">' +
                                            '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
                                            '<strong>Mislukt!</strong>' +
                                            ' verblijfsobject ' + waarde.bagId + ' niet gevonden.' +
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
                        adres_row.append('<tr></tr>');
                    }
                } else {
                    adres_row.append('<tr></tr>');
                } 
            });
            algemeen_table_div.append(algemeen_table);
            _obj.panel_algemeen.append(algemeen_table_div);
            _obj.panel_group.html(_obj.panel_algemeen);
            _obj.panel_tabs.html('<li class="active"><a data-toggle="tab" href="#collapse_algemeen_' + DBKObject.identificatie + '">Algemeen</a></li>');
            return true;
        } else {
            return false;
        }
    },
    constructGevaarlijkeStof: function(gevaarlijkestof){
        var _obj = dbkjs.protocol.jsonDBK;
        if(gevaarlijkestof){
            $.each(gevaarlijkestof, function(gevstof_index, waarde) {
                var naamStof = dbkjs.util.isJsonNull(waarde.naamStof) ? "": waarde.naamStof;
            });
        }
    },
    constructContact: function(contact) {
        var _obj = dbkjs.protocol.jsonDBK;
        var id = 'collapse_contact_' + dbkjs.options.feature.identificatie;
        if (contact) {
            //null checks
            var contact_div = $('<div class="tab-pane" id="' + id + '"></div>');
            var contact_table_div = $('<div class="table-responsive"></div>');
            var contact_table = $('<table class="table table-hover"></table>');
            contact_table.append('<tr><th>functie</th><th>naam</th><th>telefoonnummer</th></tr>');
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
            _obj.panel_tabs.append('<li><a data-toggle="tab" href="#' + id + '">Contact</a></li>');
        } else {
            _obj.panel_tabs.append('<li class="disabled"><a href="#' + id + '">Contact</a></li>');
        }
    },
    constructBijzonderheid: function(bijzonderheid) {
        var _obj = dbkjs.protocol.jsonDBK;
        var id = 'collapse_bijzonderheid_' + dbkjs.options.feature.identificatie;
        if (bijzonderheid) {
            var bijzonderheid_div = $('<div class="tab-pane" id="' + id + '"></div>');
            var bijzonderheid_table_div = $('<div class="table-responsive"></div>');
            var bijzonderheid_table = $('<table class="table table-hover"></table>');
            bijzonderheid_table.append('<tr><th>soort</th><th>informatie</th></tr>');
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
            _obj.panel_tabs.append('<li><a data-toggle="tab" href="#' + id + '">Bijzonderheden</a></li>');
        } else {
            _obj.panel_tabs.append('<li class="disabled"><a href="#' + id + '">Bijzonderheden</a></li>');
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
                var realpath = window.location.protocol + '//' + window.location.hostname + ':' + 
                        window.location.port + '/media/' + dbkjs.options.organisation.id + '/' + waarde.URL;
                if (waarde.filetype === "pdf" || waarde.filetype === "doc" || waarde.filetype === "docx") {
                    image_carousel_inner.append('<div class="item ' + active + 
                            '"><img src="images/missing.gif""><div class="carousel-caption"><a href="' + realpath + 
                            '" target="_blank"><h1><i class="icon-download icon-large"></h1></i></a><h3>' + 
                            waarde.naam + 
                            '</h3><a href="' + url + '" target="_blank"><h2>Download bestand</h2></a></div></div>');
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
            _obj.panel_tabs.append('<li><a data-toggle="tab" href="#' + id + '">Media</a></li>');
        } else {
            _obj.panel_tabs.append('<li class="disabled"><a href="#' + id + '">Media</a></li>');
        }
    },
    constructVerblijf: function(verblijf) {
        var _obj = dbkjs.protocol.jsonDBK;
        var id = 'collapse_verblijf_' + dbkjs.options.feature.identificatie;
        if (verblijf) {
            var verblijf_div = $('<div class="tab-pane" id="' + id + '"></div>');
            var verblijf_table_div = $('<div class="table-responsive"></div>');
            var verblijf_table = $('<table class="table table-hover"></table>');
            verblijf_table.append('<tr><th>van</th><th>tot</th><th>aantal</th><th>nzr</th><th>groep</th><th>dagen</th></tr>');
            $.each(verblijf, function(verblijf_index, waarde) {
                var dagen = '';
                dagen += !waarde.maandag ? '<span class="label">ma</span>' : '<span class="label label-success">ma</span>';
                dagen += !waarde.dinsdag ? '<span class="label">di</span>' : '<span class="label label-success">di</span>';
                dagen += !waarde.woensdag ? '<span class="label">wo</span>' : '<span class="label label-success">wo</span>';
                dagen += !waarde.donderdag ? '<span class="label">do</span>' : '<span class="label label-success">do</span>';
                dagen += !waarde.vrijdag ? '<span class="label">vr</span>' : '<span class="label label-success">vr</span>';
                dagen += !waarde.zaterdag ? '<span class="label">za</span>' : '<span class="label label-success">za</span>';
                dagen += !waarde.zondag ? '<span class="label">zo</span>' : '<span class="label label-success">zo</span>';
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
            _obj.panel_tabs.append('<li><a data-toggle="tab" href="#' + id + '">Verblijf</a></li>');
        } else {
            _obj.panel_tabs.append('<li class="disabled"><a href="#' + id + '">Verblijf</a></li>');
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
            dbkjs.util.alert('Fout', ' Geen informatie gevonden', 'alert-danger');
        });
    }
};

