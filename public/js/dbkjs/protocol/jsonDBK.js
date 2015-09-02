/*!
 *  Copyright (c) 2014 Milo van der Linden (milo@dogodigi.net)
 *
 *  This file is part of opendispatcher/safetymapsDBK
 *
 *  opendispatcher is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  opendispatcher is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with opendispatcher. If not, see <http://www.gnu.org/licenses/>.
 *
 */

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
    active_tab: 'algemeen',
    layersVisible: false,
    init: function() {
        var _obj = dbkjs.protocol.jsonDBK;
        _obj.layerPandgeometrie = new OpenLayers.Layer.Vector("Pandgeometrie",{
            styleMap: dbkjs.config.styles.dbkpand
        });
         dbkjs.map.events.register("moveend", null, function() {
            if (dbkjs.map.zoom < 12){
                _obj.hideLayers();
            } else {
                _obj.showLayers();
            }
        });
        _obj.layerBrandcompartiment = new OpenLayers.Layer.Vector("Brandcompartiment",{
            styleMap: dbkjs.config.styles.dbkcompartiment
        });
         _obj.layerHulplijn2 = new OpenLayers.Layer.Vector("hulplijn2",{
            styleMap: dbkjs.config.styles.hulplijn2
        });
        _obj.layerHulplijn1 = new OpenLayers.Layer.Vector("hulplijn1",{
            styleMap: dbkjs.config.styles.hulplijn1
        });
        _obj.layerHulplijn = new OpenLayers.Layer.Vector("Hulplijn",{
            styleMap: dbkjs.config.styles.hulplijn
        });

        _obj.layerToegangterrein = new OpenLayers.Layer.Vector("Toegang terrein",{
            styleMap: dbkjs.config.styles.toegangterrein
        });
        _obj.layerBrandweervoorziening = new OpenLayers.Layer.Vector("Brandweervoorziening",{
            styleMap: dbkjs.config.styles.brandweervoorziening
        });
        _obj.layerGevaarlijkestof = new OpenLayers.Layer.Vector("Gevaarlijke stoffen",{
            styleMap: dbkjs.config.styles.gevaarlijkestof
        });
        _obj.layerTekstobject = new OpenLayers.Layer.Vector("Tekst objecten",{
            styleMap: dbkjs.config.styles.tekstobject
        });
        _obj.layers = [
            _obj.layerPandgeometrie,
            _obj.layerBrandcompartiment,
            _obj.layerHulplijn2,
            _obj.layerHulplijn1,
            _obj.layerHulplijn,
            _obj.layerToegangterrein,
            _obj.layerBrandweervoorziening,
            _obj.layerGevaarlijkestof,
            _obj.layerTekstobject
        ];
        _obj.selectlayers = [];
        _obj.hoverlayers = [
            _obj.layerBrandweervoorziening,
            _obj.layerBrandcompartiment,
            _obj.layerGevaarlijkestof,
            _obj.layerHulplijn,
            _obj.layerToegangterrein
        ];
        dbkjs.map.addLayers(_obj.layers);
        dbkjs.selectControl.setLayer((dbkjs.selectControl.layers || dbkjs.selectControl.layer).concat(_obj.hoverlayers));
        dbkjs.hoverControl.setLayer((dbkjs.hoverControl.layers || dbkjs.hoverControl.layer).concat(_obj.hoverlayers));
        dbkjs.hoverControl.activate();
        dbkjs.selectControl.activate();

    },
    hideLayers: function(){
        var _obj = dbkjs.protocol.jsonDBK;
        _obj.layersVisible = false;
        $.each(_obj.layers, function(lindex, lyr) {
            lyr.setVisibility(false);
        });
    },
    showLayers: function(){
        var _obj = dbkjs.protocol.jsonDBK;
        _obj.layersVisible = true;
        $.each(_obj.layers, function(lindex, lyr) {
            //afhankelijkheid van module layertoggle kan niet worden afgedwongen.
            if(dbkjs.modules.layertoggle){
                if(dbkjs.modules.layertoggle.isLayerEnabled(lyr.name)) {
                    lyr.setVisibility(true);
                }
            } else {
                lyr.setVisibility(true);
            }
        });
    },
    resetLayers: function() {
        var _obj = dbkjs.protocol.jsonDBK;
        $.each(_obj.layers, function(lindex, lyr) {
            var currentVisibility = _obj.layersVisible;
            if(currentVisibility && !dbkjs.modules.layertoggle.isLayerEnabled(lyr.name)) {
                currentVisibility = false;
            }
            lyr.setVisibility(currentVisibility);
        });
    },
    getfeatureinfo: function(e){
        dbkjs.gui.detailsPanelUpdateTitle(e.feature.layer.name);
        html = '<div style:"width: 100%" class="table-responsive">';
        html += '<table class="table table-hover">';
        for (var j in e.feature.attributes) {
            //if ($.inArray(j, ['Omschrijving', 'GEVIcode', 'UNnr', 'Hoeveelheid', 'NaamStof']) > -1) {
            if (!dbkjs.util.isJsonNull(e.feature.attributes[j])) {
                html += '<tr><td><span>' + j + "</span>: </td><td>" + e.feature.attributes[j] + "</td></tr>";
            }
            //}
        }
        html += '</table>';
        html += '</div>';
        //dbkjs.util.appendTab(dbkjs.wms_panel.attr("id"),'Brandcompartiment',html, true, 'br_comp_tab');
        dbkjs.gui.detailsPanelUpdateHtml(html);
        dbkjs.gui.detailsPanelShow();
    },
    process: function(feature) {
        var _obj = dbkjs.protocol.jsonDBK;
        _obj.active_tab = 'algemeen';
        dbkjs.gui.infoPanelUpdateFooterHtml('');
        if (feature && feature.attributes && feature.attributes.typeFeature) {
            if (feature.data && feature.data.hasOwnProperty('formeleNaam') && feature.data.hasOwnProperty('informeleNaam')) {
                $('.dbk-title')
                        .text(feature.data.formeleNaam + ' ' + feature.data.informeleNaam)
                        .css('visibility', 'visible')
                        .on('click', function () {
                            dbkjs.modules.feature.zoomToFeature(feature);
                        });
            }
            if (!dbkjs.options.feature || feature.id !== dbkjs.options.feature.id) {
                if (!dbkjs.protocol.jsonDBK.processing) {
                    if (dbkjs.viewmode === 'fullscreen') {
                        dbkjs.util.getModalPopup('infopanel').hide();
                        dbkjs.util.getModalPopup('dbkinfopanel').hide();
                    } else {
                        dbkjs.gui.infoPanelHide();
                    }
                    dbkjs.protocol.jsonDBK.processing = true;
                    dbkjs.util.alert('<i class="fa fa-spinner fa-spin"></i>', i18n.t('dialogs.running'), 'alert-info');
                    if (feature.attributes.typeFeature === 'Object') {
                        dbkjs.protocol.jsonDBK.getObject(feature);
                    } else if (feature.attributes.typeFeature === 'Gebied') {
                        dbkjs.protocol.jsonDBK.getGebied(feature);
                    }
                }
            } else {
                //Check if processing is finished
                if (!dbkjs.protocol.jsonDBK.processing) {

                    if (dbkjs.viewmode === 'fullscreen') {
                        $('#dbkinfopanel_b').html(dbkjs.options.feature.div);
                    } else {
                        dbkjs.gui.infoPanelUpdateHtml(dbkjs.options.feature.div);
                        dbkjs.gui.infoPanelUpdateFooterHtml('');
                        dbkjs.gui.infoPanelShow();
                    }
                }
            }
        }
    },
    activateSelect: function (layer) {
        var _obj = dbkjs.protocol.jsonDBK;
        layer.events.on({
            "featureselected": _obj.getfeatureinfo,
            "featuresadded": function () {
            },
            "featureunselected": function (e) {
                dbkjs.gui.detailsPanelHide();
            }
        });
    },
    info: function(data, noZoom) {
        var _obj = dbkjs.protocol.jsonDBK;
        var objecttype = "object";
        if (data.DBKObject || data.DBKGebied) {
            if (data.DBKObject) {
                dbkjs.options.feature = data.DBKObject;
            } else {
                dbkjs.options.feature = data.DBKGebied;
                objecttype = "gebied";
            }
            _obj.panel_group = $('<div class="tab-content"></div>');
            _obj.panel_tabs = $('<ul class="nav nav-pills"></ul>');
            var div = $('<div class="tabbable"></div>');
            if (_obj.constructAlgemeen(dbkjs.options.feature, objecttype)) {
                dbkjs.gui.infoPanelUpdateTitle('<i class="fa fa-building"></i> ' + dbkjs.options.feature.formeleNaam);
                _obj.constructContact(dbkjs.options.feature);
                _obj.constructOmsdetail(dbkjs.options.feature);
                _obj.constructBijzonderheid(dbkjs.options.feature);
                _obj.constructVerblijf(dbkjs.options.feature);
                _obj.constructMedia(dbkjs.options.feature);
                _obj.constructFloors(dbkjs.options.feature);
                _obj.constructBrandweervoorziening(dbkjs.options.feature);
                _obj.constructGevaarlijkestof(dbkjs.options.feature);
                div.append(_obj.panel_group);
                div.append(_obj.panel_tabs);
                if (dbkjs.viewmode === 'fullscreen') {
                    $('#dbkinfopanel_b').html(div);
                } else {
                    dbkjs.gui.infoPanelUpdateHtml('');
                    dbkjs.gui.infoPanelAddItems(div);
                }
                $('#systeem_meldingen').hide();
            }

            // Construct additional geometries.
            _obj.constructPandGeometrie(dbkjs.options.feature);
            _obj.constructGeometrie(dbkjs.options.feature);
            _obj.constructHulplijn(dbkjs.options.feature);
            _obj.constructToegangterrein(dbkjs.options.feature);
            _obj.constructBrandcompartiment(dbkjs.options.feature);
            _obj.constructTekstobject(dbkjs.options.feature);


            if (!noZoom && dbkjs.options.zoomToPandgeometrie) {
                dbkjs.modules.feature.zoomToPandgeometrie();
            }

            if (dbkjs.viewmode === 'fullscreen') {
                //dbkjs.util.getModalPopup('infopanel').show();
            } else {
                dbkjs.gui.infoPanelShow();
            }

            if (dbkjs.viewmode !== 'fullscreen') {
                _obj.addMouseoverHandler("#bwvlist", _obj.layerBrandweervoorziening);
                _obj.addMouseoutHandler("#bwvlist", _obj.layerBrandweervoorziening);
                _obj.addMouseoverHandler("#gvslist", _obj.layerGevaarlijkestof);
                _obj.addMouseoutHandler("#gvslist", _obj.layerGevaarlijkestof);
                _obj.addRowClickHandler("#floorslist", "verdiepingen");
            }

            _obj.processing = false;
        } else {
            dbkjs.options.feature = null;
            dbkjs.util.alert(i18n.t('app.error'), i18n.t('dialogs.infoNotFound'), 'alert-danger');
        }
    },
    constructRow: function (val, caption) {
        if (!dbkjs.util.isJsonNull(val)) {
            var output = '<tr><td>' + caption + '</td><td>' + val + '</td></tr>';
            return output;
        } else {
            return '';
        }
    },
    constructAlgemeen: function (DBKObject, dbktype) {
        var _obj = dbkjs.protocol.jsonDBK;
        /** Algemene dbk info **/
        var controledatum = dbkjs.util.isJsonNull(DBKObject.controleDatum) ? '<span class="label label-warning">' +
                i18n.t('dbk.unknown') + '</span>' : moment(DBKObject.controleDatum).format('YYYY-MM-DD hh:mm');
        if (dbkjs.showStatus) {
            var status = dbkjs.util.isJsonNull(DBKObject.status) ? '<span class="label label-warning">' +
                    i18n.t('dbk.unknown') + '</span>' : DBKObject.status;
        }
        ;
        var bhvaanwezig = '<span class="label label-warning">' +
                i18n.t('dbk.noEmergencyResponse') + '</span>';
        if (!dbkjs.util.isJsonNull(DBKObject.BHVaanwezig)) {
            if (DBKObject.BHVaanwezig === true) {
                bhvaanwezig = '<span class="label label-success">' +
                        i18n.t('dbk.emergencyResponsePresent') + '</span>';
            } else {
                bhvaanwezig = '<span class="label label-warning">' +
                        i18n.t('dbk.noEmergencyResponse') + '</span>';
            }
        }
        var informelenaam = dbkjs.util.isJsonNull(DBKObject.informeleNaam) ? '' : DBKObject.informeleNaam;
        var risicoklasse = dbkjs.util.isJsonNull(DBKObject.risicoklasse) ? '' : DBKObject.risicoklasse;
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
        if (!dbkjs.util.isJsonNull(DBKObject.bouwlaag)) {
            bouwlaag = DBKObject.bouwlaag;
        } else {
            bouwlaag = i18n.t('dbk.unknown');
        }
        if (!dbkjs.util.isJsonNull(DBKObject.laagsteBouwlaag)) {
            laagstebouwlaag = DBKObject.laagsteBouwlaag === 0 ? 0 : -DBKObject.laagsteBouwlaag + ' (' + -DBKObject.laagsteBouwlaag + ')';
        } else {
            laagstebouwlaag = i18n.t('dbk.unknown');
        }
        if (!dbkjs.util.isJsonNull(DBKObject.hoogsteBouwlaag)) {
            hoogstebouwlaag = DBKObject.hoogsteBouwlaag === 0 ? 0 : DBKObject.hoogsteBouwlaag + ' (' + (DBKObject.hoogsteBouwlaag - 1) + ')';
        } else {
            hoogstebouwlaag = i18n.t('dbk.unknown');
        }
        dbkjs.options.feature.bouwlaag = bouwlaag;
        var active_tab = _obj.active_tab === 'algemeen' ? 'active' : '';
        dbkjs.options.dbk = DBKObject.identificatie;
        dbkjs.disableloadlayer = true;
        if (dbkjs.permalink) {
            dbkjs.permalink.updateLink();
        }
        _obj.panel_algemeen = $('<div class="tab-pane ' + active_tab + '" id="collapse_algemeen_' + DBKObject.identificatie + '"></div>');
        var algemeen_table_div = $('<div class="table-responsive"></div>');
        var algemeen_table = $('<table class="table table-hover"></table>');
        if (dbktype === "object") {
            algemeen_table.append(_obj.constructRow(informelenaam, i18n.t('dbk.alternativeName')));
            algemeen_table.append(_obj.constructRow(controledatum, i18n.t('dbk.dateChecked')));
            if (dbkjs.showStatus) {
                algemeen_table.append(_obj.constructRow(status, i18n.t('dbk.status')));
            }
            algemeen_table.append(_obj.constructRow(bhvaanwezig, i18n.t('dbk.emergencyResponse')));
            algemeen_table.append(_obj.constructRow(inzetprocedure, i18n.t('dbk.procedure')));
            algemeen_table.append(_obj.constructRow(gebouwconstructie, 'Gebouwconstructie'));
            algemeen_table.append(_obj.constructRow(omsnummer, i18n.t('dbk.fireAlarmCode')));
            algemeen_table.append(_obj.constructRow(gebruikstype, i18n.t('dbk.application')));
            algemeen_table.append(_obj.constructRow(risicoklasse, i18n.t('dbk.risk')));
            algemeen_table.append(_obj.constructRow(bouwlaag, i18n.t('dbk.level')));
            algemeen_table.append(_obj.constructRow(laagstebouwlaag, i18n.t('dbk.lowLevel') + ' (' + i18n.t('dbk.floor') + ')'));
            algemeen_table.append(_obj.constructRow(hoogstebouwlaag, i18n.t('dbk.highLevel') + ' (' + i18n.t('dbk.floor') + ')'));
        } else if (dbktype === "gebied") {
            algemeen_table.append(_obj.constructRow(informelenaam, i18n.t('dbk.alternativeName')));
            algemeen_table.append(_obj.constructRow(controledatum, i18n.t('dbk.dateChecked')));
        }
        if (DBKObject.adres) {
            //adres is een array of null
            $.each(DBKObject.adres, function (adres_index, waarde) {
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
                    if (!dbkjs.util.isJsonNull(waarde.bagId)) {
                        var bag_div = $('<td></td>');
                        var bag_p = $('<p></p>');
                        var bag_button = $('<button type="button" class="btn btn-primary">' + i18n.t('dbk.tarryobjectid') + ' ' + dbkjs.util.pad(waarde.bagId, 16) + '</button>');
                        bag_p.append(bag_button);
                        bag_button.click(function () {
                            if ($.inArray('bag', dbkjs.options.organisation.modules) > -1) {
                                dbkjs.modules.bag.getVBO(waarde.bagId, function (result) {
                                    if (result.length === 0) {
                                        $('#collapse_algemeen_' + _obj.feature.id).append(
                                                '<div class="alert alert-warning alert-dismissable">' +
                                                '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
                                                '<strong>' + i18n.t('app.fail') +
                                                '</strong>' +
                                                dbkjs.util.pad(waarde.bagId, 16) + ' ' + i18n.t('dialogs.infoNotFound') +
                                                '</div>'
                                                );
                                    } else {
                                        $('#bagpanel_b').html('');
                                        $.each(result, function (result_index, waarde) {
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
        }
        algemeen_table_div.append(algemeen_table);
        _obj.panel_algemeen.append(algemeen_table_div);
        _obj.panel_group.html(_obj.panel_algemeen);
        if (active_tab === 'active') {
            _obj.panel_tabs.html('<li class="active"><a data-toggle="tab" href="#collapse_algemeen_' + DBKObject.identificatie + '">' + i18n.t('dbk.general') + '</a></li>');
        } else {
            _obj.panel_tabs.html('<li><a data-toggle="tab" href="#collapse_algemeen_' + DBKObject.identificatie + '">' + i18n.t('dbk.general') + '</a></li>');
        }
        _obj.panel_tabs.html();
        return true;
    },
    constructBrandweervoorziening: function (feature) {
        var _obj = dbkjs.protocol.jsonDBK;
        if (feature.brandweervoorziening) {
            var id = 'collapse_brandweervoorziening_' + feature.identificatie;
            var bv_div = $('<div class="tab-pane" id="' + id + '"></div>');
            var bv_table_div = $('<div class="table-responsive"></div>');
            var bv_table = $('<table id="bwvlist" class="table table-hover"></table>');
            bv_table.append('<tr><th>' +
                    i18n.t('prevention.type') + '</th><th>' +
                    i18n.t('prevention.name') + '</th><th>' +
                    i18n.t('prevention.comment') + '</th></tr>');

            var features = [];
            $.each(feature.brandweervoorziening, function (idx, myGeometry) {
                var information = myGeometry.aanvullendeInformatie || '';
                var myFeature = new OpenLayers.Feature.Vector(new OpenLayers.Format.GeoJSON().read(myGeometry.geometry, "Geometry"));
                myFeature.attributes = {
                    "type": myGeometry.typeVoorziening,
                    "name": myGeometry.naamVoorziening,
                    "information": information,
                    "rotation": myGeometry.hoek,
                    "category": myGeometry.categorie,
                    "namespace": myGeometry.namespace,
                    "radius": myGeometry.radius,
                    "fid": "brandweervoorziening_ft_" + idx
                };

                var myrow = $('<tr id="' + idx + '">' +
                        '<td><img class="thumb" src="' + dbkjs.basePath + "images/" + myFeature.attributes.namespace.toLowerCase() + '/' +
                        myFeature.attributes.type + '.png" alt="' +
                        myFeature.attributes.type + '" title="' +
                        myFeature.attributes.type + '"></td>' +
                        '<td>' + myFeature.attributes.name + '</td>' +
                        '<td>' + myFeature.attributes.information + '</td>'
                        + '</tr>');
                //@@ Toekennen van callback verplaatst naar info().
                bv_table.append(myrow);
                features.push(myFeature);

            });
            _obj.layerBrandweervoorziening.addFeatures(features);
            _obj.activateSelect(_obj.layerBrandweervoorziening);
            bv_table_div.append(bv_table);
            bv_div.append(bv_table_div);
            _obj.panel_group.append(bv_div);
            _obj.panel_tabs.append('<li><a data-toggle="tab" href="#' + id + '">' + i18n.t('dbk.prevention') + '</a></li>');

        }
    },
    constructGevaarlijkestof: function (feature) {
        var _obj = dbkjs.protocol.jsonDBK;
        if (feature.gevaarlijkestof) {
            var id = 'collapse_gevaarlijkestof_' + feature.identificatie;
            var bv_div = $('<div class="tab-pane" id="' + id + '"></div>');
            var bv_table_div = $('<div class="table-responsive"></div>');
            var bv_table = $('<table id="gvslist" class="table table-hover"></table>');
            bv_table.append('<tr><th>' +
                i18n.t('chemicals.type') + '</th><th>' +
                i18n.t('chemicals.indication') + '</th><th>' +
                i18n.t('chemicals.name') + '</th><th>' +
                i18n.t('chemicals.quantity') + '</th><th>' +
                i18n.t('chemicals.information') + '</th></tr>');
            var features = [];
            $.each(feature.gevaarlijkestof, function (idx, myGeometry) {
                var name = myGeometry.naamStof || '';
                var quantity = myGeometry.hoeveelheid ? myGeometry.hoeveelheid.replace(/([0-9]+)([lL])/, "$1\u2113") : myGeometry.hoeveelheid || '';
                var information = myGeometry.aanvullendeInformatie || '';
                var myFeature = new OpenLayers.Feature.Vector(new OpenLayers.Format.GeoJSON().read(myGeometry.geometry, "Geometry"));
                myFeature.attributes = {
                    "type": myGeometry.symboolCode,
                    "name": name,
                    "namespace": myGeometry.namespace,
                    "quantity": quantity,
                    "indication": myGeometry.gevaarsindicatienummer,
                    "information": information,
                    "unnumber": myGeometry.UNnummer,
                    "fid": "gevaarlijkestof_ft_" + idx
                };
                var geviblock = '';
                if (myFeature.attributes.indication !== 0 && myFeature.attributes.unnumber !== 0) {
                    geviblock = '<div class="gevicode">' + myFeature.attributes.indication +
                            '</div><div class="unnummer">' +
                            myFeature.attributes.unnumber + '</div>';
                }
                var myrow = $('<tr id="' + idx + '">' +
                        '<td><img class="thumb" src="' + dbkjs.basePath + 'images/' + myFeature.attributes.namespace.toLowerCase() + '/' +
                        myFeature.attributes.type + '.png" alt="' +
                        myFeature.attributes.type + '" title="' +
                        myFeature.attributes.type + '"></td>' +
                        '<td>' + geviblock + '</td>' +
                        '<td>' + myFeature.attributes.name + '</td>' +
                        '<td>' + myFeature.attributes.quantity + '</td>' +
                        '<td>' + myFeature.attributes.information + '</td>' +
                        '</tr>');
                bv_table.append(myrow);
                features.push(myFeature);
            });
            _obj.layerGevaarlijkestof.addFeatures(features);
            _obj.activateSelect(_obj.layerGevaarlijkestof);
            bv_table_div.append(bv_table);
            bv_div.append(bv_table_div);
            _obj.panel_group.append(bv_div);
            _obj.panel_tabs.append('<li><a data-toggle="tab" href="#' + id + '">' + i18n.t('dbk.chemicals') + '</a></li>');
        }
    },
    constructFloors: function (feature) {
        var _obj = dbkjs.protocol.jsonDBK;
        if (feature.verdiepingen && feature.verdiepingen.length > 1) {
            var id = 'collapse_floors_' + feature.identificatie;
            var active_tab = _obj.active_tab === 'verdiepingen' ? 'active' : '';
            var verdiepingen_div = $('<div class="tab-pane ' + active_tab + '" id="' + id + '"></div>');
            var verdiepingen_table_div = $('<div class="table-responsive"></div>');
            var verdiepingen_table = $('<table id ="floorslist" class="table table-hover"></table>');
            verdiepingen_table.append('<tr><th>' +
                    i18n.t('dbk.floor') + '</th></tr>');
            $.each(feature.verdiepingen, function (verdiepingen_index, waarde) {
                var myrow;
                var sterretje = '';
                if (waarde.type === 'hoofdobject') {
                    sterretje = ' (' + i18n.t('dbk.mainobject') + ')';
                }
                if (waarde.identificatie !== feature.identificatie) {
                    //Show the hyperlink!
                    myrow = $('<tr id="' + waarde.identificatie + '">' +
                        '<td>' + waarde.bouwlaag + sterretje + '</td>' +
                        '</tr>');
                    myrow.click(function(){
                        _obj.getObject(waarde.identificatie, 'verdiepingen', true);
                        if(dbkjs.viewmode === 'fullscreen') {
                            dbkjs.util.getModalPopup('dbkinfopanel').hide();
                        }
                    });
                } else {
                    //No hyperlink, current object
                    myrow = $('<tr>' +
                            '<td><strong><em>' + waarde.bouwlaag + sterretje + '</em><strong></td>' +
                            '</tr>');

                }
                verdiepingen_table.append(myrow);
            });
            verdiepingen_table_div.append(verdiepingen_table);
            verdiepingen_div.append(verdiepingen_table_div);
            _obj.panel_group.append(verdiepingen_div);
            if (active_tab === 'active') {
                _obj.panel_tabs.append('<li class="' + active_tab + '"><a data-toggle="tab" href="#' + id + '">' + i18n.t('dbk.floors') + '</a></li>');
            } else {
                _obj.panel_tabs.append('<li><a data-toggle="tab" href="#' + id + '">' + i18n.t('dbk.floors') + '</a></li>');
            }
        }
    },
    constructContact: function (feature) {
        var _obj = dbkjs.protocol.jsonDBK;
        var id = 'collapse_contact_' + feature.identificatie;
        if (feature.contact) {
            var active_tab = _obj.active_tab === 'gevaarlijkestof' ? 'active' : '';
            var contact_div = $('<div class="tab-pane" ' + active_tab + ' id="' + id + '"></div>');
            var contact_table_div = $('<div class="table-responsive"></div>');
            var contact_table = $('<table class="table table-hover"></table>');
            contact_table.append('<tr><th>' +
                    i18n.t('contact.role') + '</th><th>' +
                    i18n.t('contact.name') + '</th><th>' +
                    i18n.t('contact.telephone') + '</th></tr>');
            $.each(feature.contact, function (contact_index, waarde) {
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
            _obj.panel_tabs.append('<li><a data-toggle="tab" href="#' + id + '">' + i18n.t('dbk.contact') + '</a></li>');
        }
    },
    constructOmsdetail: function (feature) {
        var _obj = dbkjs.protocol.jsonDBK;
        var id = 'collapse_omsdetail_' + feature.identificatie;
        if (feature.oms_details) {
            var active_tab = _obj.active_tab === 'gevaarlijkestof' ? 'active' : '';
            var omsdetail_div = $('<div class="tab-pane" ' + active_tab + ' id="' + id + '"></div>');

            var omscontact_table_div = $('<div class="table-responsive"></div>');
            var omscontact_table = $('<table class="table table-hover"></table>');
            omscontact_table.append('<tr><th>' +
                    i18n.t('oms.contact') + '</th><th>' +
                    i18n.t('oms.telephone') + '</th><th>' +
                    i18n.t('oms.mobile') + '</th></tr>');

            var omsinfo_table_div = $('<div class="table-responsive"></div>');
            var omsinfo_table = $('<table class="table table-hover"></table>');
            var omscrit_table_div = $('<div class="table-responsive"></div>');
            var omscrit_table = $('<table class="table table-hover"></table>');
            $.each(feature.oms_details, function (omsdetail_index, waarde) {
                var critstring = '';
                omsinfo_table.append(
                        '<tr>' +
                        '<td><b>' + i18n.t('oms.number') + '</b></td>' +
                        '<td>' + waarde.omsnummer + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td><b>' + i18n.t('oms.objectname') + '</b></td>' +
                        '<td>' + waarde.objectnaam + '</td>' +
                        '</tr>'
                        );
                for (var i = 1; i < 17; i++) {
                    if (waarde['crit' + i]) {
                        critstring += '<tr>' +
                                '<td><b>' + i18n.t('oms.criterium') + ' ' + i + '</b></td>' +
                                '<td> </td>' +
                                '<td>' + waarde['crit' + i] + '</td>' +
                                '</tr>';
                    }
                }
                omscrit_table.append(critstring);
                omscontact_table.append(
                        '<tr>' +
                        '<td>' + i18n.t('dbk.general') + '</td>' +
                        '<td colspan="2">' + waarde.tel_alg + '</td>' +
                        '</tr>'
                        );
                for (var i = 1; i < 4; i++) {
                    var naam = waarde['sh_' + i + '_naam'] || '';
                    var telvast = waarde['sh_' + i + '_tel_vast'] || '';
                    var telmob = waarde['sh_' + i + '_tel_mob'] || '';
                    var contactstring = '' + naam + telvast + telmob;
                    if ( contactstring.length > 0)
                        omscontact_table.append('<tr>' +
                                '<td>' + naam + '</td>' +
                                '<td>' + telvast + '</td>' +
                                '<td>' + telmob + '</td>' +
                                '</tr>');
                }


            });
            omsinfo_table_div.append(omsinfo_table);
            omscrit_table_div.append(omscrit_table);
            omscontact_table_div.append(omscontact_table);
            omsdetail_div.append(omsinfo_table_div);
            omsdetail_div.append(omscontact_table_div);
            omsdetail_div.append(omscrit_table_div);
            _obj.panel_group.append(omsdetail_div);
            _obj.panel_tabs.append('<li><a data-toggle="tab" href="#' + id + '">' + i18n.t('dbk.omsdetail') + '</a></li>');
        }
    },
    constructBijzonderheid: function (feature) {
        var _obj = dbkjs.protocol.jsonDBK;
        var id = 'collapse_bijzonderheid_' + feature.identificatie;
        if (feature.bijzonderheid) {
            var bijzonderheid_div = $('<div class="tab-pane" id="' + id + '"></div>');
            var bijzonderheid_table_div = $('<div class="table-responsive"></div>');
            var bijzonderheid_table = $('<table class="table table-hover"></table>');
            bijzonderheid_table.append('<tr><th>' + i18n.t('particularies.type') + '</th><th>' + i18n.t('particularies.comment') + '</th></tr>');
            var set = {
                Algemeen: {titel: 'Algemeen', waarde: ''},
                Preparatie: {titel: 'Preparatie', waarde: ''},
                Preventie: {titel: 'Preventie', waarde: ''},
                Repressie: {titel: 'Repressie', waarde: ''}
            };
            $.each(feature.bijzonderheid, function (bijzonderheid_index, waarde) {
                if (!dbkjs.util.isJsonNull(waarde.soort)) {
                    var bijz = {soort: waarde.soort, tekst: waarde.tekst};
                    set[waarde.soort].waarde += bijz.tekst + '<br>';
                }
            });
            $.each(set, function (set_idx, set_entry) {
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
            _obj.panel_tabs.append('<li><a data-toggle="tab" href="#' + id + '">' + i18n.t('dbk.particularities') + '</a></li>');
        }
    },
    constructMedia: function (feature) {
        var _obj = dbkjs.protocol.jsonDBK;
        var id = 'collapse_foto_' + feature.identificatie;
        var car_id = 'carousel_foto_' + feature.identificatie;
        if (feature.foto) {
            feature.images = [];
            var foto_div = $('<div class="tab-pane" id="' + id + '"></div>');
            var image_carousel = $('<div id="' + car_id + '" class="carousel slide" data-interval="false"></div>');
            var image_carousel_inner = $('<div class="carousel-inner"></div>');
            var image_carousel_nav = $('<ol class="carousel-indicators"></ol>');
            $.each(feature.foto, function (foto_index, waarde) {
                var active = '';
                if (foto_index === 0) {
                    active = 'active';
                } else {
                    active = '';
                }
                var timestamp = new Date().getTime();
                var realpath = dbkjs.mediaPath + waarde.URL;
                //@@var realpath = dbkjs.basePath + 'media/' + waarde.URL;
                if (waarde.filetype === "document" || waarde.filetype === "pdf" || waarde.filetype === "doc" || waarde.filetype === "docx") {
                    image_carousel_inner.append('<div class="item ' + active +
                            '"><img src="' + dbkjs.basePath + 'images/missing.gif""><div class="carousel-caption"><a href="' + realpath +
                            //@@'"><img src="images/missing.gif""><div class="carousel-caption"><a href="' + realpath +
                            '" target="_blank"><h1><i class="fa fa-download fa-3"></h1></i></a><h3>' +
                            waarde.naam +
                            '</h3><a href="' + realpath + '" target="_blank"><h2>' + i18n.t('app.download') + '</h2></a></div></div>');
                } else if (waarde.filetype === "weblink") {
                    image_carousel_inner.append('<div class="item ' + active +
                            '"><img src="' + dbkjs.basePath + 'images/missing.gif""><div class="carousel-caption"><a href="' + waarde.URL +
                            //@@'"><img src="images/missing.gif""><div class="carousel-caption"><a href="' + waarde.URL +
                            '" target="_blank"><h1><i class="fa fa-external-link fa-3"></i></h1><h2>' +
                            i18n.t('app.hyperlink') + '</h2></a></div></div>'
                            );
                } else if (waarde.filetype === 'afbeelding') {
                    image_carousel_inner.append('<div class="item ' + active + '"><img src="' + realpath +
                            '" onerror="dbkjs.util.mediaError(this);"><div class="carousel-caption"><h3>' +
                            waarde.naam + '</h3></div></div>');
                    feature.images.push(realpath);
                }
                if (feature.foto.length > 1) {
                    image_carousel_nav.append('<li data-target="#' + car_id + '" data-slide-to="' +
                            foto_index + '" class="' + active + '"></li>');
                }
            });
            image_carousel.append(image_carousel_nav);
            image_carousel.append(image_carousel_inner);
            if (feature.foto.length > 1) {
                image_carousel.append('<a class="left carousel-control" href="#' + car_id + '" data-slide="prev">' +
                        '<span class="fa fa-arrow-left"></span></a>');
                image_carousel.append('<a class="right carousel-control" href="#' + car_id + '" data-slide="next">' +
                        '<span class="fa fa-arrow-right"></span></a>');
            }
            foto_div.append(image_carousel);
            _obj.panel_group.append(foto_div);
            _obj.panel_tabs.append('<li><a data-toggle="tab" href="#' + id + '">' + i18n.t('dbk.media') + '</a></li>');
        }
    },
    constructVerblijf: function (feature) {
        var _obj = dbkjs.protocol.jsonDBK;
        var id = 'collapse_verblijf_' + feature.identificatie;
        if (feature.verblijf) {
            var verblijf_div = $('<div class="tab-pane" id="' + id + '"></div>');
            var verblijf_table_div = $('<div class="table-responsive"></div>');
            var verblijf_table = $('<table class="table table-hover"></table>');
            verblijf_table.append('<tr><th>' + i18n.t('tarry.from') + '</th><th>' +
                    i18n.t('tarry.to') + '</th><th>' +
                    i18n.t('tarry.ammount') + '</th><th>' +
                    i18n.t('tarry.notSelfReliant') + '</th><th>' +
                    i18n.t('tarry.group') + '</th><th>' +
                    i18n.t('tarry.days') + '</th></tr>');
            $.each(feature.verblijf, function (verblijf_index, waarde) {
                var dagen = '';
                var nsr = waarde.aantalNietZelfredzaam || 0;
                var sr = waarde.aantal || 0;
                dagen += !waarde.maandag ? '<span class="label label-default">' + moment.weekdaysMin(1) + '</span>' : '<span class="label label-success">' + moment.weekdaysMin(1) + '</span>';
                dagen += !waarde.dinsdag ? '<span class="label label-default">' + moment.weekdaysMin(2) + '</span>' : '<span class="label label-success">' + moment.weekdaysMin(2) + '</span>';
                dagen += !waarde.woensdag ? '<span class="label label-default">' + moment.weekdaysMin(3) + '</span>' : '<span class="label label-success">' + moment.weekdaysMin(3) + '</span>';
                dagen += !waarde.donderdag ? '<span class="label label-default">' + moment.weekdaysMin(4) + '</span>' : '<span class="label label-success">' + moment.weekdaysMin(4) + '</span>';
                dagen += !waarde.vrijdag ? '<span class="label label-default">' + moment.weekdaysMin(5) + '</span>' : '<span class="label label-success">' + moment.weekdaysMin(5) + '</span>';
                dagen += !waarde.zaterdag ? '<span class="label label-default">' + moment.weekdaysMin(6) + '</span>' : '<span class="label label-success">' + moment.weekdaysMin(6) + '</span>';
                dagen += !waarde.zondag ? '<span class="label label-default">' + moment.weekdaysMin(0) + '</span>' : '<span class="label label-success">' + moment.weekdaysMin(0) + '</span>';
                verblijf_table.append('<tr>' +
                        '<td>' + waarde.tijdvakBegintijd.substring(0, 5) + '</td>' +
                        '<td>' + waarde.tijdvakEindtijd.substring(0, 5) + '</td>' +
                        '<td>' + sr + '</td>' +
                        '<td>' + nsr + '</td>' +
                        '<td>' + waarde.typeAanwezigheidsgroep + '</td>' +
                        '<td>' + dagen + '</td>' +
                        '</tr>');
            });
            verblijf_table_div.append(verblijf_table);
            verblijf_div.append(verblijf_table_div);
            _obj.panel_group.append(verblijf_div);
            _obj.panel_tabs.append('<li><a data-toggle="tab" href="#' + id + '">' + i18n.t('dbk.tarry') + '</a></li>');
        }
    },
    constructPandGeometrie: function (feature) {
        var _obj = dbkjs.protocol.jsonDBK;
        if (feature.pandgeometrie) {
            var features = [];
            $.each(feature.pandgeometrie, function (idx, myGeometry) {
                var myFeature = new OpenLayers.Feature.Vector(new OpenLayers.Format.GeoJSON().read(myGeometry.geometry, "Geometry"));
                myFeature.attributes = {"id": myGeometry.bagId, "status": myGeometry.bagStatus};
                features.push(myFeature);
            });
            _obj.layerPandgeometrie.addFeatures(features);
            _obj.activateSelect(_obj.layerPandgeometrie);
        }
    },
    constructGeometrie: function (feature) {
        var _obj = dbkjs.protocol.jsonDBK;
        if (feature.geometry) {
            //gebied!
            var features = [];
            var myFeature = new OpenLayers.Feature.Vector(new OpenLayers.Format.GeoJSON().read(dbkjs.options.feature.geometry, "Geometry"));
            myFeature.attributes = {"id": feature.identificatie, "type": "gebied"};
            features.push(myFeature);
            _obj.layerPandgeometrie.addFeatures(features);
            _obj.activateSelect(_obj.layerPandgeometrie);
        }
    },
    constructHulplijn: function (feature) {
        var _obj = dbkjs.protocol.jsonDBK;
        if (feature.hulplijn) {
            var features = [];
            var features1 = [];
            var features2 = [];
            $.each(feature.hulplijn, function (idx, myGeometry) {
                var myBearing = 0;
                var myline = new OpenLayers.Format.GeoJSON().read(myGeometry.geometry, "Geometry");
                var myFeature = new OpenLayers.Feature.Vector(myline);
                if (myGeometry.typeHulplijn === "Arrow") {
                    var myVertices = myline.getVertices();
                    var myEndpoint = myVertices[myVertices.length - 1];
                    //revert bearing. Don't knwo why, but it works ;-)
                    myBearing = -(dbkjs.util.bearing(myVertices[myVertices.length - 2], myVertices[myVertices.length - 1]));
                    myFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Collection([myline, myEndpoint]));
                }
                var aanvinfo = dbkjs.util.isJsonNull(myGeometry.aanvullendeInformatie) ? '' : myGeometry.aanvullendeInformatie;
                myFeature.attributes = {"type": myGeometry.typeHulplijn, "rotation": myBearing, "information": aanvinfo};
                features.push(myFeature);
                if (myGeometry.typeHulplijn === "Cable") {
                    features1.push(myFeature.clone());
                }
                if (myGeometry.typeHulplijn === "Conduit") {
                    features1.push(myFeature.clone());
                }
                if (myGeometry.typeHulplijn === "Fence") {
                    features1.push(myFeature.clone());
                }
                if (myGeometry.typeHulplijn === "Fence_O") {
                    features1.push(myFeature.clone());
                }
                if (myGeometry.typeHulplijn === "Gate") {
                    features1.push(myFeature.clone());
                    features2.push(myFeature.clone());
                }
                if (myGeometry.typeHulplijn === "Bbarrier") {
                    features1.push(myFeature.clone());
                    features2.push(myFeature.clone());
                }

            });
            _obj.layerHulplijn.addFeatures(features);
            _obj.layerHulplijn1.addFeatures(features1);
            _obj.layerHulplijn2.addFeatures(features2);
            _obj.activateSelect(_obj.layerHulplijn);
        }
    },
    constructToegangterrein: function (feature) {
        var _obj = dbkjs.protocol.jsonDBK;
        if (feature.toegangterrein) {
            var features = [];
            $.each(feature.toegangterrein, function (idx, myGeometry) {
                var myBearing = 0;
                var myline = new OpenLayers.Format.GeoJSON().read(myGeometry.geometry, "Geometry");
                var myFeature = new OpenLayers.Feature.Vector(myline);
                var myVertices = myline.getVertices();
                var myEndpoint = myVertices[myVertices.length - 1];
                //revert bearing. Don't knwo why, but it works ;-)
                myBearing = -(dbkjs.util.bearing(myVertices[myVertices.length - 2], myVertices[myVertices.length - 1]));
                myFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Collection([myline, myEndpoint]));
                myFeature.attributes = {"primary": myGeometry.primair, "rotation": myBearing,
                    "title": myGeometry.naamRoute, "information": myGeometry.aanvullendeInformatie};
                features.push(myFeature);
            });
            _obj.layerToegangterrein.addFeatures(features);
            _obj.activateSelect(_obj.layerToegangterrein);
        }
    },
    constructBrandcompartiment: function (feature) {
        var _obj = dbkjs.protocol.jsonDBK;
        if (feature.brandcompartiment) {
            var features = [];
            $.each(feature.brandcompartiment, function (idx, myGeometry) {
                var myline = new OpenLayers.Format.GeoJSON().read(myGeometry.geometry, "Geometry");
                if (!dbkjs.util.isJsonNull(myGeometry.Label)) {
                    //create a feature for every center of every segment of the line, place the label there
                    var labelfeatures = [];
                    labelfeatures.push(myline);
                    //$.each(myline.components,function(cidx, component){
                    //    var labelFeature = myline.getCentroid();
                    //    labelfeatures.push(labelFeature);
                    //});
                    //labelfeatures.push(myFeature);
                    var outFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Collection(labelfeatures));
                    outFeature.attributes = {"type": myGeometry.typeScheiding, "label": myGeometry.Label};
                    features.push(outFeature);
                } else {
                    var myFeature = new OpenLayers.Feature.Vector(myline);
                    myFeature.attributes = {
                        "type": myGeometry.typeScheiding,
                        "informatie": myGeometry.aanvullendeInformatie,
                    };
                    features.push(myFeature);
                }

            });
            _obj.layerBrandcompartiment.addFeatures(features);
            _obj.activateSelect(_obj.layerBrandcompartiment);
        }
    },
    constructTekstobject: function (feature) {
        var _obj = dbkjs.protocol.jsonDBK;
        if (feature.tekstobject) {
            var features = [];
            $.each(feature.tekstobject, function (idx, myGeometry) {
                var myFeature = new OpenLayers.Feature.Vector(new OpenLayers.Format.GeoJSON().read(myGeometry.geometry, "Geometry"));
                //@todo: De omschrijving moet er nog bij, ook in de database!
                myFeature.attributes = {
                    "title": myGeometry.tekst,
                    "rotation": myGeometry.hoek,
                    "scale": myGeometry.schaal + 2
                };
                features.push(myFeature);
            });
            _obj.layerTekstobject.addFeatures(features);
            _obj.activateSelect(_obj.layerTekstobject);
        }
    },
    getObject: function (feature, activetab, noZoom) {
        var _obj = dbkjs.protocol.jsonDBK;
        if (activetab) {
            _obj.active_tab = activetab;
        }
        //clear all layers first!
        $.each(_obj.layers, function (idx, lyr) {
            lyr.destroyFeatures();
        });
        var params = {
            srid: dbkjs.options.projection.srid,
            timestamp: new Date().getTime()
        };
        var fid;
        if (feature.attributes) {
            fid = feature.attributes.identificatie;
        } else {
            //the function is not recieving a feature, but a string
            fid = feature;
        }
        $.getJSON(dbkjs.dataPath + 'object/' + fid + '.json', params).done(function (data) {
            dbkjs.protocol.jsonDBK.info(data, noZoom);
        }).fail(function (jqxhr, textStatus, error) {
            dbkjs.options.feature = null;
            dbkjs.util.alert(i18n.t('app.error'), i18n.t('dialogs.infoNotFound'), 'alert-danger');
        });
    },
    getGebied: function (feature, activetab) {
        var _obj = dbkjs.protocol.jsonDBK;
        if (activetab) {
            _obj.active_tab = activetab;
        }
        //clear all layers first!
        $.each(_obj.layers, function (idx, lyr) {
            lyr.destroyFeatures();
        });
        var params = {
            srid: dbkjs.options.projection.srid,
            timestamp: new Date().getTime()
        };
        var fid;
        if (feature.attributes) {
            fid = feature.attributes.identificatie;
        } else {
            //the function is not recieving a feature, but a string
            fid = feature;
        }
        $.getJSON(dbkjs.dataPath + 'gebied/' + fid + '.json', params).done(function (data) {
            dbkjs.protocol.jsonDBK.info(data);
        }).fail(function (jqxhr, textStatus, error) {
            dbkjs.options.feature = null;
            dbkjs.util.alert(i18n.t('app.error'), i18n.t('dialogs.infoNotFound'), 'alert-danger');
        });
    },
    addMouseoverHandler: function (tableid, vLayer) {
        $(tableid).on("mouseover", "tr", function () {
            //event.preventDefault();
            var idx = $(this).attr("id");
            var feature = vLayer.features[idx];
            if (feature) {
                dbkjs.selectControl.select(feature);
            }
            return false;
        });
    },
    addMouseoutHandler: function (tableid, vLayer) {
        $(tableid).on("mouseout", "tr", function () {
            //event.preventDefault();
            var idx = $(this).attr("id");
            var feature = vLayer.features[idx];
            if (feature) {
                dbkjs.selectControl.unselect(feature);
            }
            return false;
        });
    },
    addRowClickHandler: function (tableid, detailtype) {
        $(tableid).on("click", "tr", function () {
            var _obj = dbkjs.protocol.jsonDBK;
            var identificatie = $(this).attr("id");
            if (identificatie) {
                _obj.getObject(identificatie, detailtype);
            }
            if (dbkjs.viewmode === 'fullscreen') {
                dbkjs.util.getModalPopup('dbkinfopanel').hide();
            }
            return false;
        });

    }
};
