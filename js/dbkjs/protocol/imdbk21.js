var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.protocol = dbkjs.protocol || {};
dbkjs.protocol.imdbk21 = {
    feature: null,
    processing: false,
    panel_group: null,
    panel_tabs: null,
    panel_algemeen: null,
    process: function(selection_id) {
//controleer of de currentFeature id gelijk is aan de dbk,
//http://dbk.mapcache.nl/wfs?request=GetFeature&version=2.0&typename=dbk:DBKFeature&outputFormat=gml32&featureID=DBKFeature.1367827139
        if (selection_id) {
            if (!this.feature) {
                if (!dbkjs.protocol.imdbk21.processing) {
                    $('#infopanel').hide();
                    dbkjs.protocol.imdbk21.processing = true;
                    dbkjs.util.alert('<i class="icon-spinner icon-spin"></i>', ' Objectinformatie wordt opgehaald...', 'alert-info');
                    dbkjs.protocol.imdbk21.feature = {id: selection_id, div: ''};
                    dbkjs.protocol.imdbk21.getObject(selection_id);
                }
            } else if (selection_id === dbkjs.protocol.imdbk21.feature.id) {
                //doe niks
                if (!dbkjs.protocol.imdbk21.processing) {
                    $('#infopanel_b').html(dbkjs.protocol.imdbk21.feature.div);
                    $('#infopanel').show();
                    //reset naar eerste tab
                }

            } else {
                //anders opnieuw ophalen.    
                if (!dbkjs.protocol.imdbk21.processing) {
                    $('#infopanel').hide();
                    dbkjs.protocol.imdbk21.processing = true;
                    dbkjs.util.alert('<i class="icon-spinner icon-spin"></i>', ' Objectinformatie wordt opgehaald...', 'alert-info');
                    dbkjs.protocol.imdbk21.feature = {id: selection_id, div: ''};
                    dbkjs.protocol.imdbk21.getObject(selection_id);
                }
            }
        }
    },
    info: function(response) {
        var _obj = dbkjs.protocol.imdbk21;
        if (response) {
            if (response.responseXML) {
                var xmldoc = $.xml2json(response.responseXML);
            } else {
                // let op; internet explorer retourneert altijd null voor responseXML
                // proberen om responseText op te vangen
                // if ($.browser.msie) {
                var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(response.responseText, "application/xml");
                var xmldoc = $.xml2json(xmlDoc);
            }
            if (xmldoc["ows:ExceptionReport"]) {
                _obj.feature = {};
                dbkjs.util.alert('Fout', ' Er is een systeemfout opgetreden. Neem contact op met de beheerder', 'alert-danger');
            } else {
                if (xmldoc["wfs:FeatureCollection"]["wfs:member"]) {
                    _obj.panel_group = $('<div class="tab-content"></div>');
                    _obj.panel_tabs = $('<ul class="nav nav-pills"></ul>');
                    if (xmldoc["wfs:FeatureCollection"]["wfs:member"]["dbk:DBKObject"]) {
                        var div = $('<div class="tabbable"></div>');
                        if (_obj.constructAlgemeen(xmldoc["wfs:FeatureCollection"]["wfs:member"]["dbk:DBKObject"])) {
                            _obj.constructBijzonderheid(
                                    xmldoc["wfs:FeatureCollection"]["wfs:member"]["dbk:DBKObject"]["dbk:bijzonderheid"]
                                    );
                            _obj.constructVerblijf(
                                    xmldoc["wfs:FeatureCollection"]["wfs:member"]["dbk:DBKObject"]["dbk:verblijf"]
                                    );
                            _obj.constructMedia(
                                    xmldoc["wfs:FeatureCollection"]["wfs:member"]["dbk:DBKObject"]["dbk:foto"]
                                    );
                        }
                        ;
                        div.append(_obj.panel_group);
                        div.append(_obj.panel_tabs);
                        dbkjs.protocol.imdbk21.feature.div = div;
                        $('#infopanel_b').html(div);
                        $('#systeem_meldingen').hide();
                    }
                    $('#infopanel').show();
                } else {
                    _obj.feature = {};
                    dbkjs.util.alert('Fout', ' Geen informatie gevonden', 'alert-danger');
                }
            }
            _obj.processing = false;
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
        var _obj = dbkjs.protocol.imdbk21;
        /** Algemene dbk info **/
        if (DBKObject) {
            var formelenaam = DBKObject["dbk:formeleNaam"].value;
            dbkjs.util.changeDialogTitle('<i class="icon-building"></i> ' + formelenaam);
            var controledatum = '<span class="label label-warning">Niet bekend</span>';
            var bhvaanwezig = '<span class="label label-warning">Geen BHV aanwezig of onbekend</span>';
            var informelenaam = '';
            var woonplaatsnaam = '';
            var postcode = '';
            var huisnummer = '';
            var openbareruimtenaam = '';
            var omsnummer = '';
            var gebruikstype = '';
            var bouwlaag = '';
            var laagste;
            var hoogste;
            if (DBKObject["dbk:informeleNaam"]) {
                informelenaam = DBKObject["dbk:informeleNaam"].value;
            }
            if (DBKObject["dbk:controleDatum"]) {
                controledatum = DBKObject["dbk:controleDatum"].value;
            }
            if (DBKObject["dbk:BHVAanwezig"]) {
                bhvaanwezig = '<span class="label label-success">BHV aanwezig</span>';
            }
            if (DBKObject["dbk:OMSnummer"]) {
                omsnummer = '' + DBKObject["dbk:OMSnummer"].value + '';
            }

            if (DBKObject["dbk:gebruikstype"]) {
                gebruikstype = '' + DBKObject["dbk:gebruikstype"].value + '';
            }

            if (DBKObject["dbk:laagsteBouwlaag"]) {
                laagste = '' + DBKObject["dbk:laagsteBouwlaag"].value + '';
            }
            if (DBKObject["dbk:hoogsteBouwlaag"]) {
                hoogste = '' + DBKObject["dbk:hoogsteBouwlaag"].value + '';
            }
            if (laagste && hoogste) {
                bouwlaag = '' + laagste + ' t/m ' + hoogste + '';
            } else if (laagste && !hoogste) {
                bouwlaag = 'Laagste bouwlaag: ' + laagste + '';
            } else if (hoogste && !laagste) {
                bouwlaag = 'Hoogste bouwlaag: ' + hoogste + '';
            }
            _obj.panel_algemeen = $('<div class="tab-pane active" id="collapse_algemeen_' + _obj.feature.id + '"></div>');
            var algemeen_table_div = $('<div class="table-responsive"></div>');
            var algemeen_table = $('<table class="table table-hover"></table>');
            algemeen_table.append(_obj.constructRow(informelenaam, 'Informele naam'));
            algemeen_table.append(_obj.constructRow(controledatum, 'Controledatum'));
            algemeen_table.append(_obj.constructRow(bhvaanwezig, 'BHV'));
            algemeen_table.append(_obj.constructRow(omsnummer, 'OMS nummer'));
            algemeen_table.append(_obj.constructRow(gebruikstype, 'Gebruik'));
            algemeen_table.append(_obj.constructRow(bouwlaag, 'Bouwlagen'));
            var adres = DBKObject["dbk:adres"];
            if (adres) {
                //var adres_div = $('<div class="tab-pane" id="collapse_adres_' + _obj.feature.id + '"></div>');\

                if (adres["dbk:Adres"]) {
                    var temp = adres;
                    adres = [];
                    adres.push(temp);
                }
                $.each(adres, function(adres_index, waarde) {
                    var adres_row = $('<tr></tr>');
                    var adres_div = $('<td></td>');
                    var bag_div = $('<td></td>');
                    if (waarde["dbk:Adres"]["dbk:huisnummer"]) {
                        huisnummer = waarde["dbk:Adres"]["dbk:huisnummer"].value;
                    }
                    if (waarde["dbk:Adres"]["dbk:postcode"]) {
                        postcode = waarde["dbk:Adres"]["dbk:postcode"].value;
                    }
                    if (waarde["dbk:Adres"]["dbk:woonplaatsNaam"]) {
                        woonplaatsnaam = waarde["dbk:Adres"]["dbk:woonplaatsNaam"].value;
                    }
                    if (waarde["dbk:Adres"]["dbk:openbareRuimteNaam"]) {
                        openbareruimtenaam = waarde["dbk:Adres"]["dbk:openbareRuimteNaam"].value;
                    }
                    adres_div.append('' +
                            openbareruimtenaam + ' ' + huisnummer + '<br/>' +
                            woonplaatsnaam + ' ' + postcode +
                            '');
                    if (waarde["dbk:Adres"]["dbk:bagId"]) {
                        var bag_p = $('<p></p>');
                        var bag_button = $('<button type="button" class="btn btn-primary">BAG raadplegen</button>');
                        bag_p.append(bag_button);
                        bag_button.click(function() {
                            if (dbkjs.modules.bag) {
                                dbkjs.modules.bag.getVBO(waarde["dbk:Adres"]["dbk:bagId"]['dbk:NEN3610ID']['dbk:lokaalID'].value, function(result) {
                                    if (result.length === 0) {
                                        $('#collapse_algemeen_' + _obj.feature.id).append(
                                                '<div class="alert alert-warning alert-dismissable">' +
                                                '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
                                                '<strong>Mislukt!</strong>' +
                                                ' verblijfsobject ' + waarde["dbk:Adres"]["dbk:bagId"]['dbk:NEN3610ID']['dbk:lokaalID'].value + ' niet gevonden.' +
                                                '</div>'
                                                );
                                    } else {

                                    }

                                });
                            } else {
                                alert(waarde["dbk:Adres"]["dbk:bagId"]['dbk:NEN3610ID']['dbk:lokaalID'].value);
                            }
                        });
                        bag_div.append(bag_p);
                    }
                    adres_row.append(adres_div);
                    adres_row.append(bag_div);
                    algemeen_table.append(adres_row);
                });
                algemeen_table_div.append(algemeen_table);
                _obj.panel_algemeen.append(algemeen_table_div);
                _obj.panel_group.html(_obj.panel_algemeen);
                _obj.panel_tabs.html('<li class="active"><a data-toggle="tab" href="#collapse_algemeen_' + _obj.feature.id + '">Algemeen</a></li>');
                return true;
            } else {
                return false;
            }
        }
    },
    constructContact: function(contact) {
        var _obj = dbkjs.protocol.imdbk21;
        if (bijzonderheid) {
            var bijzonderheid_div = $('<div class="tab-pane" id="collapse_bijzonderheid_' + _obj.feature.id + '"></div>');
            if (bijzonderheid["dbk:Bijzonderheid"]) {
                var temp = bijzonderheid;
                bijzonderheid = [];
                bijzonderheid.push(temp);
            }
            var bijzonderheid_table_div = $('<div class="table-responsive"></div>');
            var bijzonderheid_table = $('<table class="table table-hover"></table>');
            bijzonderheid_table.append('<tr><th>#</th><th>soort</th><th>informatie</th></tr>');
            $.each(bijzonderheid, function(bijzonderheid_index, waarde) {
                bijzonderheid_table.append(
                        '<tr>' +
                        '<td>' + waarde["dbk:Bijzonderheid"]["dbk:volgnummer"].value + '</td>' +
                        '<td>' + waarde["dbk:Bijzonderheid"]["dbk:soort"].value + '</td>' +
                        '<td>' + waarde["dbk:Bijzonderheid"]["dbk:tekst"].value + '</td>'
                        + '</tr>'
                        );
            });
            bijzonderheid_table_div.append(bijzonderheid_table);
            bijzonderheid_div.append(bijzonderheid_table_div);
            _obj.panel_group.append(bijzonderheid_div);
            _obj.panel_tabs.append('<li><a data-toggle="tab" href="#collapse_bijzonderheid_' + _obj.feature.id + '">Bijzonderheden</a></li>');
        } else {
            _obj.panel_tabs.append('<li class="disabled"><a href="#collapse_bijzonderheid_' + _obj.feature.id + '">Bijzonderheden</a></li>');
        }
    },
    constructBijzonderheid: function(bijzonderheid) {
        var _obj = dbkjs.protocol.imdbk21;
        if (bijzonderheid) {
            var bijzonderheid_div = $('<div class="tab-pane" id="collapse_bijzonderheid_' + _obj.feature.id + '"></div>');
            if (bijzonderheid["dbk:Bijzonderheid"]) {
                var temp = bijzonderheid;
                bijzonderheid = [];
                bijzonderheid.push(temp);
            }
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
                var lu = waarde["dbk:Bijzonderheid"]["dbk:soort"].value;
                set[lu].waarde += waarde["dbk:Bijzonderheid"]["dbk:tekst"].value + '<br>';
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
            _obj.panel_tabs.append('<li><a data-toggle="tab" href="#collapse_bijzonderheid_' + _obj.feature.id + '">Bijzonderheden</a></li>');
        } else {
            _obj.panel_tabs.append('<li class="disabled"><a href="#collapse_bijzonderheid_' + _obj.feature.id + '">Bijzonderheden</a></li>');
        }
    },
    constructMedia: function(foto) {
        var _obj = dbkjs.protocol.imdbk21;
        if (foto) {
            var foto_div = $('<div class="tab-pane" id="collapse_foto_' + _obj.feature.id + '"></div>');
            var image_carousel = $('<div id="carousel_foto_' + _obj.feature.id + '" class="carousel slide" data-interval="false"></div>');
            var image_carousel_inner = $('<div class="carousel-inner"></div>');
            //if (foto["dbk:Foto"]) {
            if (foto["dbk:Foto"]) {
                var temp = foto;
                foto = [];
                foto.push(temp);
            }

            var image_carousel_nav = $('<ol class="carousel-indicators"></ol>');
            $.each(foto, function(foto_index, waarde) {
                var url = waarde["dbk:Foto"]["dbk:URL"].value;
                var naam = waarde["dbk:Foto"]["dbk:naam"].value;
                if (foto_index === 0) {
                    active = 'active';
                } else {
                    active = '';
                }
                var url_arr = url.split(".");
                var extension = url_arr[url_arr.length - 1];
                if (extension === "pdf" || extension === "doc" || extension === "docx") {
                    image_carousel_inner.append('<div class="item ' + active + '"><img src="images/missing.gif""><div class="carousel-caption"><a href="' + url + '" target="_blank"><h1><i class="icon-download icon-large"></h1></i></a><h3>' + waarde["dbk:Foto"]["dbk:naam"].value + '</h3><a href="' + url + '" target="_blank"><h2>Download bestand</h2></a></div></div>');
                } else {
                    image_carousel_inner.append('<div class="item ' + active + '"><img src="' + url + '" onerror="dbkjs.util.mediaError(this);"><div class="carousel-caption"><h3>' + naam + '</h3><p></p></div></div>');
                }

                if (foto.length > 1) {
                    image_carousel_nav.append('<li data-target="#carousel_foto_' + _obj.feature.id + '" data-slide-to="' + foto_index + '" class="' + active + '"></li>');
                }
            });
            image_carousel.append(image_carousel_nav);
            image_carousel.append(image_carousel_inner);
            if (foto.length > 1) {
                image_carousel.append('<a class="left carousel-control" href="#carousel_foto_' + _obj.feature.id + '" data-slide="prev">' +
                        '<span class="icon-prev"></span></a>');
                image_carousel.append('<a class="right carousel-control" href="#carousel_foto_' + _obj.feature.id + '" data-slide="next">' +
                        '<span class="icon-next"></span></a>');
            }
            foto_div.append(image_carousel);
            _obj.panel_group.append(foto_div);
            _obj.panel_tabs.append('<li><a data-toggle="tab" href="#collapse_foto_' + _obj.feature.id + '">Media</a></li>');
        } else {
            _obj.panel_tabs.append('<li class="disabled"><a href="#collapse_foto_' + _obj.feature.id + '">Media</a></li>');
        }
    },
    constructVerblijf: function(verblijf) {
        var _obj = dbkjs.protocol.imdbk21;
        if (verblijf) {
            var verblijf_div = $('<div class="tab-pane" id="collapse_verblijf_' + _obj.feature.id + '"></div>');
            //if (verblijf["dbk:AantalPersonen"]) {
            if (verblijf["dbk:AantalPersonen"]) {
                var temp = verblijf;
                verblijf = [];
                verblijf.push(temp);
            }
            var verblijf_table_div = $('<div class="table-responsive"></div>');
            var verblijf_table = $('<table class="table table-hover"></table>');
            verblijf_table.append('<tr><th>van</th><th>tot</th><th>aantal</th><th>groep</th></tr>');
            $.each(verblijf, function(verblijf_index, waarde) {
                verblijf_table.append('<tr>' +
                        '<td>' + waarde["dbk:AantalPersonen"]["dbk:tijdvakBegintijd"].value.replace(":00Z", '').replace('Z', '') + '</td>' +
                        '<td>' + waarde["dbk:AantalPersonen"]["dbk:tijdvakEindtijd"].value.replace(":00Z", '').replace('Z', '') + '</td>' +
                        '<td>' + waarde["dbk:AantalPersonen"]["dbk:aantal"].value + '</td>' +
                        '<td>' + waarde["dbk:AantalPersonen"]["dbk:typeAanwezigheidsgroep"].value + '</td>' +
                        '</tr>');
            });
            verblijf_table_div.append(verblijf_table);
            verblijf_div.append(verblijf_table_div);
            _obj.panel_group.append(verblijf_div);
            _obj.panel_tabs.append('<li><a data-toggle="tab" href="#collapse_verblijf_' + _obj.feature.id + '">Verblijf</a></li>');
        } else {
            _obj.panel_tabs.append('<li class="disabled"><a href="#collapse_verblijf_' + _obj.feature.id + '">Verblijf</a></li>');
        }
    },
    getObject: function(id) {
        var params = {
            request: 'getFeature',
            version: '2.0',
            typename: 'dbk:DBKObject',
            outputFormat: 'gml32',
            featureID: 'DBKObject.' + id
        };
        OpenLayers.Request.GET({
            url: dbkjs.options.regio.safetymaps_url + 'wfs',
            //url: 'http://dbk.mapcache.nl/data/DBKObject_1371547912.xml', 
            "params": params, callback: dbkjs.protocol.imdbk21.info});
    },
    getGebied: function(id) {
        var params = {
            request: 'getFeature',
            version: '2.0',
            typename: 'dbk:DBKGebied',
            outputFormat: 'gml32',
            featureID: 'DBKGebied.' + id
        };
        OpenLayers.Request.GET({url: dbkjs.protocol.imdbk21.url, "params": params, callback: dbkjs.protocol.imdbk21.info});
    },
    getFeature: function(id) {
        var params = {
            request: 'getFeature',
            version: '2.0',
            typename: 'dbk:DBKFeature',
            outputFormat: 'gml32',
            featureID: 'DBKFeature.' + id
        };
        OpenLayers.Request.GET({url: dbkjs.protocol.imdbk21.url, "params": params, callback: dbkjs.protocol.imdbk21.info});
    }
};

