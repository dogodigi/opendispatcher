var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.protocol = dbkjs.protocol || {};
dbkjs.protocol.imdbk21 = {
    feature: null,
    url: 'http://dbk.mapcache.nl/wfs?',
    processing: false,
    panel_group: null,
    panel_tabs: null,
    panel_algemeen: null,
    process: function(selection_id) {
//controleer of de currentFeature id gelijk is aan de dbk,
//http://dbk.mapcache.nl/wfs?request=GetFeature&version=2.0&typename=dbk:DBKFeature&outputFormat=gml32&featureID=DBKFeature.1367827139
        if (!this.feature) {
            if (!dbkjs.protocol.imdbk21.processing) {
                dbkjs.protocol.imdbk21.processing = true;
                dbkjs.protocol.imdbk21.feature = {id: selection_id, div: '<div>bezig met ophalen...</div>'};
                $('#infopanel_b').html(dbkjs.protocol.imdbk21.feature.div);
                $('#infopanel').show();
                dbkjs.protocol.imdbk21.getObject(selection_id);
            }
        } else if (selection_id === dbkjs.protocol.imdbk21.feature.id) {
//doe niks
            $('#infopanel_b').html(dbkjs.protocol.imdbk21.feature.div);
            $('#infopanel').show();
        } else {
//anders opnieuw ophalen.    
            if (!dbkjs.protocol.imdbk21.processing) {
                dbkjs.protocol.imdbk21.processing = true;
                dbkjs.protocol.imdbk21.feature = {id: selection_id, div: '<div>bezig met ophalen...</div>'};
                $('#infopanel_b').html(dbkjs.protocol.imdbk21.feature.div);
                $('#infopanel').show();
                dbkjs.protocol.imdbk21.getObject(selection_id);
            }
        }
    },
    info: function(response) {
        var _obj = dbkjs.protocol.imdbk21;
        if (response && response.responseXML) {
            var xmldoc = $.xml2json(response.responseXML);
            console.log(xmldoc);
            //en nu de foto er uit halen bij wijze van proef.
            //fotocollection = xmldoc.getElementsByTagName("dbk:Foto");
            if (xmldoc["wfs:FeatureCollection"]["wfs:member"]) {
                _obj.panel_group = $('<div class="tab-content"></div>');
                _obj.panel_tabs = $('<ul class="nav nav-pills"></ul>');
                if (xmldoc["wfs:FeatureCollection"]["wfs:member"]["dbk:DBKObject"]) {
                    _obj.feature.div = $('<div class="tabbable"></div>');
                    if (_obj.constructAlgemeen(xmldoc["wfs:FeatureCollection"]["wfs:member"]["dbk:DBKObject"])) {
                        _obj.constructAdres(xmldoc["wfs:FeatureCollection"]["wfs:member"]["dbk:DBKObject"]["dbk:adres"]);
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
                    _obj.feature.div.append(_obj.panel_group);
                    _obj.feature.div.append(_obj.panel_tabs);
                    $('#infopanel_b').html(_obj.feature.div);
                }
            } else {
                _obj.feature = {};
                $('#infopanel_b').html('Geen informatie gevonden');
            }
            $('#infopanel_f').hide();
            _obj.processing = false;
        }
    },
    constructRow: function(val, caption) {
        if (!dbkjs.util.isJsonNull(val)) {
            var output = '<div class="row">' + '<div class="col-xs-3">' + caption + '</div><div class="col-xs-9">' + val + '</div>' + '</div>';
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
            var informelenaam = DBKObject["dbk:informeleNaam"].value;
            $("#infopanel_h").html('<span class="h4">' + formelenaam + '</span><span class="h5">&nbsp;' + informelenaam + '</span>');
            var controledatum = '<span class="label label-warning">Niet bekend</span>';
            var bhvaanwezig = '<span class="label label-warning">Geen BHV aanwezig of onbekend</span>';
            var omsnummer = '';
            var gebruikstype = '';
            var bouwlaag = '';
            var laagste;
            var hoogste;
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
            _obj.panel_algemeen = $('<div class="tab-pane active" id="collapse_algemeen_' + _obj.feature.id + '">' +
                    _obj.constructRow(controledatum, 'Controledatum') +
                    _obj.constructRow(bhvaanwezig, 'BHV') +
                    _obj.constructRow(omsnummer, 'OMS nummer') +
                    _obj.constructRow(gebruikstype, 'Gebruik') +
                    _obj.constructRow(bouwlaag, 'Bouwlagen') +
                    '</div>');
            _obj.panel_group.html(_obj.panel_algemeen);
            _obj.panel_tabs.html('<li class="active"><a data-toggle="tab" href="#collapse_algemeen_' + _obj.feature.id + '">Algemeen</a></li>');
            return true;
        } else {
            return false;
        }
    },
    constructBijzonderheid: function(bijzonderheid) {
        var _obj = dbkjs.protocol.imdbk21;
        if (bijzonderheid) {
            var bijzonderheid_div = $('<div class="tab-pane" id="collapse_bijzonderheid_' + _obj.feature.id + '"></div>');
            if (bijzonderheid["dbk:Bijzonderheid"]) {
                bijzonderheid_div.append(
                        //bijzonderheid["dbk:Bijzonderheid"]["dbk:volgnummer"].value + '. ' + 
                        '<h4>' + bijzonderheid["dbk:Bijzonderheid"]["dbk:soort"].value + '</h4><p>' +
                        bijzonderheid["dbk:Bijzonderheid"]["dbk:tekst"].value + '</p>');
            } else {
                var bijzonderheid_ul = $('<ul></ul>');
                $.each(bijzonderheid, function(bijzonderheid_index, waarde) {
                    bijzonderheid_ul.append('<li>' +
                            //waarde["dbk:Bijzonderheid"]["dbk:volgnummer"].value + '. ' + 
                            '<i>' + waarde["dbk:Bijzonderheid"]["dbk:soort"].value + ' - </i> ' +
                            waarde["dbk:Bijzonderheid"]["dbk:tekst"].value +
                            '</li>');
                });
                bijzonderheid_div.append(bijzonderheid_ul);
            }
            _obj.panel_group.append(bijzonderheid_div);
            _obj.panel_tabs.append('<li><a data-toggle="tab" href="#collapse_bijzonderheid_' + _obj.feature.id + '">Bijzonderheden</a></li>');
        } else {
            _obj.panel_tabs.append('<li class="disabled"><a href="#collapse_bijzonderheid_' + _obj.feature.id + '">Bijzonderheden</a></li>');
        }
    },
    constructAdres: function(adres) {
        var _obj = dbkjs.protocol.imdbk21;
        var huisnummer = '';
        var openbareruimtenaam = '';
        var postcode = '';
        var woonplaatsnaam = '';
        if (adres) {
            //var adres_div = $('<div class="tab-pane" id="collapse_adres_' + _obj.feature.id + '"></div>');\
            var adres_row = $('<div class="row"></div>');
            var adres_div = $('<div class="col-xs-12"></div>');
            if (adres["dbk:Adres"]) {
                if (adres["dbk:Adres"]["dbk:huisnummer"]) {
                    huisnummer = adres["dbk:Adres"]["dbk:huisnummer"].value;
                }
                if (adres["dbk:Adres"]["dbk:postcode"]) {
                    postcode = adres["dbk:Adres"]["dbk:postcode"].value;
                }
                if (adres["dbk:Adres"]["dbk:woonplaatsNaam"]) {
                    woonplaatsnaam = adres["dbk:Adres"]["dbk:woonplaatsNaam"].value;
                }
                if (adres["dbk:Adres"]["dbk:openbareRuimteNaam"]) {
                    openbareruimtenaam = adres["dbk:Adres"]["dbk:openbareRuimteNaam"].value;
                }
                adres_div.append(
                        openbareruimtenaam + ' ' + huisnummer + '<br/>' +
                        woonplaatsnaam + ' ' + postcode
                        );
            } else {
                var adres_ul = $('<ul></ul>');
                $.each(adres, function(adres_index, waarde) {
                    if (adres["dbk:Adres"]["dbk:huisnummer"]) {
                        huisnummer = waarde["dbk:Adres"]["dbk:huisnummer"].value;
                    }
                    if (adres["dbk:Adres"]["dbk:postcode"]) {
                        postcode = waarde["dbk:Adres"]["dbk:postcode"].value;
                    }
                    if (adres["dbk:Adres"]["dbk:woonplaatsNaam"]) {
                        woonplaatsnaam = waarde["dbk:Adres"]["dbk:woonplaatsNaam"].value;
                    }
                    if (adres["dbk:Adres"]["dbk:openbareRuimteNaam"]) {
                        openbareruimtenaam = waarde["dbk:Adres"]["dbk:openbareRuimteNaam"].value;
                    }
                    adres_ul.append('<li>' +
                            openbareruimtenaam + ' ' + huisnummer + '<br/>' +
                            woonplaatsnaam + ' ' + postcode +
                            '</li>');
                });
            }
            adres_div.append(adres_ul);
            adres_row.append(adres_div);
            _obj.panel_algemeen.append(adres_row);
        }
    },
    constructMedia: function(foto) {
        var _obj = dbkjs.protocol.imdbk21;
        if (foto) {
            var foto_div = $('<div class="tab-pane" id="collapse_foto_' + _obj.feature.id + '"></div>');
            var image_carousel = $('<div id="carousel_foto_' + _obj.feature.id + '" class="carousel slide" data-interval="false"></div>');
            var image_carousel_inner = $('<div class="carousel-inner"></div>');
            if (foto["dbk:Foto"]) {
                var url = foto["dbk:Foto"]["dbk:URL"].value;
                image_carousel_inner.append('<div class="item active"><img src="' + url + '"><div class="carousel-caption">' + foto["dbk:Foto"]["dbk:naam"].value) + '</div></div>';
                image_carousel.append(image_carousel_inner);
            } else {
                var image_carousel_nav = $('<ol class="carousel-indicators"></ol>');
                $.each(foto, function(foto_index, waarde) {
                    var url = waarde["dbk:Foto"]["dbk:URL"].value;
                    if (foto_index === 0) {
                        active = 'active';
                    } else {
                        active = '';
                    }
                    image_carousel_inner.append('<div class="item ' + active + '"><img src="' + url + '"><div class="carousel-caption">' + waarde["dbk:Foto"]["dbk:naam"].value) + '</div></div>';
                    image_carousel_nav.append('<li data-target="#carousel_foto_' + _obj.feature.id + '" data-slide-to="' + foto_index + '" class="' + active + '"></li>');
                });
                image_carousel.append(image_carousel_nav);
                image_carousel.append(image_carousel_inner);
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
            if (verblijf["dbk:AantalPersonen"]) {
                verblijf_div.append(verblijf["dbk:AantalPersonen"]["dbk:tijdvakBegintijd"].value.replace(":00Z", '').replace('Z', '') + ' tot ' +
                        verblijf["dbk:AantalPersonen"]["dbk:tijdvakEindtijd"].value.replace(":00Z", '').replace('Z', '') + ' ' +
                        verblijf["dbk:AantalPersonen"]["dbk:aantal"].value + ' ' +
                        verblijf["dbk:AantalPersonen"]["dbk:typeAanwezigheidsgroep"].value);
            } else {
                var verblijf_ul = $('<ul></ul>');
                $.each(verblijf, function(verblijf_index, waarde) {
                    verblijf_ul.append('<li>' +
                            waarde["dbk:AantalPersonen"]["dbk:tijdvakBegintijd"].value.replace(":00Z", '').replace('Z', '') + ' tot ' +
                            waarde["dbk:AantalPersonen"]["dbk:tijdvakEindtijd"].value.replace(":00Z", '').replace('Z', '') + ' ' +
                            waarde["dbk:AantalPersonen"]["dbk:aantal"].value + ' ' +
                            waarde["dbk:AantalPersonen"]["dbk:typeAanwezigheidsgroep"].value +
                            '</li>');
                });
                verblijf_div.append(verblijf_ul);
            }
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
        OpenLayers.Request.GET({url: dbkjs.protocol.imdbk21.url, "params": params, callback: dbkjs.protocol.imdbk21.info});
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

