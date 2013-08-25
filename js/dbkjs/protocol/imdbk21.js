var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.imdbk21 = {
    feature: null,
    url: 'http://dbk.mapcache.nl/wfs?',
    processing: false,
    process: function(selection_id) {
        //controleer of de currentFeature id gelijk is aan de dbk,
        //http://dbk.mapcache.nl/wfs?request=GetFeature&version=2.0&typename=dbk:DBKFeature&outputFormat=gml32&featureID=DBKFeature.1367827139
        if (!this.feature) {
            if (!dbkjs.imdbk21.processing) {
                dbkjs.imdbk21.processing = true;
                dbkjs.imdbk21.feature = {id: selection_id, div: '<div>bezig met ophalen...</div>'};
                $('#infopanel_b').html(dbkjs.imdbk21.feature.div);
                $('#infopanel').show();
                dbkjs.imdbk21.getObject(selection_id);
            }
        } else if (selection_id === dbkjs.imdbk21.feature.id) {
            //doe niks
            $('#infopanel_b').html(dbkjs.imdbk21.feature.div);
            $('#infopanel').show();
        } else {
            //anders opnieuw ophalen.    
            if (!dbkjs.imdbk21.processing) {
                dbkjs.imdbk21.processing = true;
                dbkjs.imdbk21.feature = {id: selection_id, div: '<div>bezig met ophalen...</div>'};
                $('#infopanel_b').html(dbkjs.imdbk21.feature.div);
                $('#infopanel').show();
                dbkjs.imdbk21.getObject(selection_id);
            }
        }
    },
    info: function(response) {
        if (response && response.responseXML) {
            var xmldoc = $.xml2json(response.responseXML);
            console.log(xmldoc);
            //en nu de foto er uit halen bij wijze van proef.
            //fotocollection = xmldoc.getElementsByTagName("dbk:Foto");
            if (xmldoc["wfs:FeatureCollection"]["wfs:member"]) {
                if (xmldoc["wfs:FeatureCollection"]["wfs:member"]["dbk:DBKObject"]) {
                    dbkjs.imdbk21.feature.div = $('<div class="tabbable"></div>');
                    var panel_group = $('<div class="tab-content"></div>');
                    var panel_tabs = $('<ul class="nav nav-pills"></ul>');
                    /** Algemene dbk info **/
                    var formelenaam = xmldoc["wfs:FeatureCollection"]["wfs:member"]["dbk:DBKObject"]["dbk:formeleNaam"].value;
                    var informelenaam = xmldoc["wfs:FeatureCollection"]["wfs:member"]["dbk:DBKObject"]["dbk:informeleNaam"].value;
                    var controledatum = '<i>(onbekend)</i>';
                    if (xmldoc["wfs:FeatureCollection"]["wfs:member"]["dbk:DBKObject"]["dbk:controleDatum"]) {
                        controledatum = xmldoc["wfs:FeatureCollection"]["wfs:member"]["dbk:DBKObject"]["dbk:controleDatum"].value;
                    }
                    var bhvaanwezig = '<p>Geen BHV aanwezig of onbekend</p>';
                    if (xmldoc["wfs:FeatureCollection"]["wfs:member"]["dbk:DBKObject"]["dbk:BHVAanwezig"]) {
                        bhvaanwezig = '<p>BHV aanwezig</p>';
                    }
                    var omsnummer = '';
                    if (xmldoc["wfs:FeatureCollection"]["wfs:member"]["dbk:DBKObject"]["dbk:OMSnummer"]) {
                        omsnummer = '<p>OMS: ' + xmldoc["wfs:FeatureCollection"]["wfs:member"]["dbk:DBKObject"]["dbk:OMSnummer"].value + '</p>';
                    }
                    var gebruikstype = '';
                    if (xmldoc["wfs:FeatureCollection"]["wfs:member"]["dbk:DBKObject"]["dbk:gebruikstype"]) {
                        gebruikstype = '<p>Gebruikstype: ' + xmldoc["wfs:FeatureCollection"]["wfs:member"]["dbk:DBKObject"]["dbk:gebruikstype"].value + '</p>';
                    }
                    panel_group.html('<div class="tab-pane active" id="collapse_algemeen_' + dbkjs.imdbk21.feature.id + '">' +
                            '<h4>' + formelenaam + '</h4><h5>' + informelenaam + '</h5>' +
                            '<p>Controledatum: ' + controledatum + '</p>' + bhvaanwezig + omsnummer + gebruikstype +
                            '</div>');
                    panel_tabs.html('<li class="active"><a data-toggle="tab" href="#collapse_algemeen_' + dbkjs.imdbk21.feature.id + '">Algemeen</a></li>');
                    var bijzonderheid = xmldoc["wfs:FeatureCollection"]["wfs:member"]["dbk:DBKObject"]["dbk:bijzonderheid"];
                    if (bijzonderheid) {
                        bijzonderheid_div = $('<div class="tab-pane" id="collapse_bijzonderheid_' + dbkjs.imdbk21.feature.id + '"></div>');
                        if (bijzonderheid["dbk:Bijzonderheid"]) {
                            bijzonderheid_div.append(
                                        bijzonderheid["dbk:Bijzonderheid"]["dbk:volgnummer"].value + '. ' + 
                                        bijzonderheid["dbk:Bijzonderheid"]["dbk:soort"].value + ': ' + 
                                        bijzonderheid["dbk:Bijzonderheid"]["dbk:tekst"].value);
                        } else {
                            bijzonderheid_ul = $('<ul></ul>');
                            $.each(bijzonderheid, function(bijzonderheid_index, waarde) {
                                bijzonderheid_ul.append('<li>' +
                                        waarde["dbk:Bijzonderheid"]["dbk:volgnummer"].value + '. ' + 
                                        waarde["dbk:Bijzonderheid"]["dbk:soort"].value + ': ' + 
                                        waarde["dbk:Bijzonderheid"]["dbk:tekst"].value +
                                        '</li>');
                            });
                            bijzonderheid_div.append(bijzonderheid_ul);
                        }
                        panel_group.append(bijzonderheid_div);
                        panel_tabs.append('<li><a data-toggle="tab" href="#collapse_bijzonderheid_' + dbkjs.imdbk21.feature.id + '">Bijzonderheden</a></li>');
                    } else {
                        panel_tabs.append('<li class="disabled"><a href="#collapse_bijzonderheid_' + dbkjs.imdbk21.feature.id + '">Bijzonderheden</a></li>');
                    }
                    
                    var verblijf = xmldoc["wfs:FeatureCollection"]["wfs:member"]["dbk:DBKObject"]["dbk:verblijf"];
                    if (verblijf) {
                        verblijf_div = $('<div class="tab-pane" id="collapse_verblijf_' + dbkjs.imdbk21.feature.id + '"></div>');
                        if (verblijf["dbk:AantalPersonen"]) {
                            verblijf_div.append(verblijf["dbk:AantalPersonen"]["dbk:tijdvakBegintijd"].value.replace(":00Z", '').replace('Z', '') + ' tot ' +
                                    verblijf["dbk:AantalPersonen"]["dbk:tijdvakEindtijd"].value.replace(":00Z", '').replace('Z', '') + ' ' +
                                    verblijf["dbk:AantalPersonen"]["dbk:aantal"].value + ' ' +
                                    verblijf["dbk:AantalPersonen"]["dbk:typeAanwezigheidsgroep"].value);
                        } else {
                            verblijf_ul = $('<ul></ul>');
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
                        panel_group.append(verblijf_div);
                        panel_tabs.append('<li><a data-toggle="tab" href="#collapse_verblijf_' + dbkjs.imdbk21.feature.id + '">Verblijf</a></li>');
                    } else {
                        panel_tabs.append('<li class="disabled"><a href="#collapse_verblijf_' + dbkjs.imdbk21.feature.id + '">Verblijf</a></li>');
                    }


                    var foto = xmldoc["wfs:FeatureCollection"]["wfs:member"]["dbk:DBKObject"]["dbk:foto"];
                    if (foto) {
                        foto_div = $('<div class="tab-pane" id="collapse_foto_' + dbkjs.imdbk21.feature.id + '"></div>');
                        var image_carousel = $('<div id="carousel_foto_' + dbkjs.imdbk21.feature.id + '" class="carousel slide" data-interval="false"></div>');
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
                                image_carousel_nav.append('<li data-target="#carousel_foto_' + dbkjs.imdbk21.feature.id + '" data-slide-to="' + foto_index + '" class="' + active + '"></li>');
                            });
                            image_carousel.append(image_carousel_nav);
                            image_carousel.append(image_carousel_inner);
                            image_carousel.append('<a class="left carousel-control" href="#carousel_foto_' + dbkjs.imdbk21.feature.id + '" data-slide="prev">' +
                                    '<span class="icon-prev"></span></a>');
                            image_carousel.append('<a class="right carousel-control" href="#carousel_foto_' + dbkjs.imdbk21.feature.id + '" data-slide="next">' +
                                    '<span class="icon-next"></span></a>');


                        }
                        foto_div.append(image_carousel);
                        panel_group.append(foto_div);
                        panel_tabs.append('<li><a data-toggle="tab" href="#collapse_foto_' + dbkjs.imdbk21.feature.id + '">Media</a></li>');

                    } else {
                        panel_tabs.append('<li class="disabled"><a href="#collapse_foto_' + dbkjs.imdbk21.feature.id + '">Media</a></li>');
                    }
                    dbkjs.imdbk21.feature.div.append(panel_group);
                    dbkjs.imdbk21.feature.div.append(panel_tabs);
                    $('#infopanel_b').html(dbkjs.imdbk21.feature.div);
                }
            } else {
                dbkjs.imdbk21.feature = {};
                $('#infopanel_b').html('Geen informatie gevonden');
            }
            $('#infopanel_f').hide();
            dbkjs.imdbk21.processing = false;
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
        OpenLayers.Request.GET({url: dbkjs.imdbk21.url, "params": params, callback: dbkjs.imdbk21.info});
    },
    getGebied: function(id) {
        var params = {
            request: 'getFeature',
            version: '2.0',
            typename: 'dbk:DBKGebied',
            outputFormat: 'gml32',
            featureID: 'DBKGebied.' + id
        };
        OpenLayers.Request.GET({url: dbkjs.imdbk21.url, "params": params, callback: dbkjs.imdbk21.info});
    },
    getFeature: function(id) {
        var params = {
            request: 'getFeature',
            version: '2.0',
            typename: 'dbk:DBKFeature',
            outputFormat: 'gml32',
            featureID: 'DBKFeature.' + id
        };
        OpenLayers.Request.GET({url: dbkjs.imdbk21.url, "params": params, callback: dbkjs.imdbk21.info});
    }
};

