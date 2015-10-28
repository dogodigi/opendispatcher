/*
 *  Copyright (c) 2015 B3Partners (info@b3partners.nl)
 *
 *  This file is part of safetymapDBK
 *
 *  safetymapDBK is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  safetymapDBK is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with safetymapDBK. If not, see <http://www.gnu.org/licenses/>.
 *
 */

/**
 * Controller for displaying incident info for a specific voertuig when it is
 * ingezet.
 *
 * Events:
 * new_incident: when new incident is received
 * end_incident: inzet for incident was ended (may not trigger for some koppelingen)
 *
 * @param {Object} incidents dbk module
 * @returns {VoertuigInzetController}
 */
function VoertuigInzetController(incidents) {
    var me = this;
    me.service = incidents.service;

    me.button = new AlertableButton("btn_incident", "Incident", "bell-o");
    $(me.button).on('click', function() {
        me.incidentDetailsWindow.show();
        me.zoomToIncident();
    });

    me.incidentDetailsWindow = new IncidentDetailsWindow();
    me.incidentDetailsWindow.createElements("Incident");
    $(me.incidentDetailsWindow).on('show', function() {
        me.button.setAlerted(false);
    });

    me.markerLayer = new IncidentMarkerLayer();
    $(me.markerLayer).on('click', function(incident, marker) {
        me.markerClick(incident, marker);
    });
    me.marker = null;

    me.voertuignummer = window.localStorage.getItem("voertuignummer");

    me.dbkSelectMaxDistance = incidents.options.dbkSelectMaxDistance || 250;

    me.addConfigControls();

    $(this.service).on('initialized', function() {
        if(incidents.options.voertuignummerTypeahead) {
            me.enableVoertuignummerTypeahead();
        }
        me.setVoertuignummer(me.voertuignummer, true);
    });
}

/**
 * Add controls to configuration window.
 */
VoertuigInzetController.prototype.addConfigControls = function() {
    var me = this;
    $(dbkjs).one('dbkjs_init_complete', function() {
        var incidentSettings = $("<div><h4>Meldkamerkoppeling</h4><p/>" +
                "<div class='row'><div class='col-xs-12'>Voertuignummer: <input type='text' id='input_voertuignummer'>" +
                "</div></div><p/><p/><hr>");
        incidentSettings.insertAfter($("#settingspanel_b hr:last"));

        $("#settingspanel").on('hidden.bs.modal', function() {
            me.setVoertuignummer($("#input_voertuignummer").val());
        });

        $("#input_voertuignummer").val(me.voertuignummer);

        if(!me.voertuignummer) {
            // Open config window when voertuignummer not configured
            $("#c_settings").click();

            // Wait for transition to end to set focus
            window.setTimeout(function() { $("#input_voertuignummer").focus(); }, 1000);
        }
    });
};

/**
 * Get and enable typeahead data for voertuignummer config control. Service
 * must be initialized.
 */
VoertuigInzetController.prototype.enableVoertuignummerTypeahead = function() {
    var me = this;
    me.service.getVoertuignummerTypeahead()
    .done(function(datums) {
        $("#input_voertuignummer")
        .typeahead({
            name: 'voertuignummers',
            local: datums,
            limit: 10,
            template: function(d) {
                var s = d.tokens[0] + " " + d.value;
                if(d.tokens[2]) {
                    s += " (" + d.tokens[2] + ")";
                }
                return s;
            }
        });
    });
};

/**
 * Change voertuignummer, persist in browser local storage. Start getting inzet
 * info if not null (service must be initialized). Will cancel previous timeout
 * for getting inzet data, immediately get info for updated voertuignummer.
 *
 * @param {boolean} noDuplicateCheck get info even when argument is the same as
 *   instance variable this.voertuignummer, use when starting up
 */
VoertuigInzetController.prototype.setVoertuignummer = function(voertuignummer, noDuplicateCheck) {
    var me = this;
    if(me.voertuignummer === voertuignummer && !noDuplicateCheck) {
        return;
    }
    me.voertuignummer = voertuignummer;
    window.localStorage.setItem("voertuignummer", voertuignummer);

    me.cancelGetInzetInfo();
    me.getInzetInfo();
};

VoertuigInzetController.prototype.cancelGetInzetInfo = function() {
    var me = this;
    if(me.getInzetTimeout) {
        window.clearTimeout(me.getInzetTimeout);
        me.getInzetTimeout = null;
    }
};

VoertuigInzetController.prototype.getInzetInfo = function() {
    var me = this;

    if(!me.voertuignummer) {
        return;
    }

    var responseVoertuignummer = me.voertuignummer;
    me.service.getVoertuigInzet(responseVoertuignummer)
    .always(function() {
        me.getInzetTimeout = window.setTimeout(function() {
            me.getInzetInfo();
        }, 30000);
    })
    .fail(function(e) {
        var msg = "Kan meldkamerinfo niet ophalen: " + e;
        dbkjs.gui.showError(msg);
        this.button.setIcon("bell-slash");
        me.incidentDetailsWindow.showError(msg);
    })
    .done(function(incidentId) {
        if(responseVoertuignummer !== me.voertuignummer) {
            // Voertuignummer was changed since request was fired off, ignore!
            return;
        }
        if(incidentId) {
            me.inzetIncident(incidentId);
        } else {
            if(me.incidentId) {
                $("#zoom_extent").click();

                // Wait for layer loading messages to clear...
                window.setTimeout(function() {
                    dbkjs.util.alert('Melding', 'Inzet beeindigd');
                    window.setTimeout(function() {
                        $('#systeem_meldingen').hide();
                    }, 10000);
                }, 3000);
                me.geenInzet(true);
            }
        }
    });
};

VoertuigInzetController.prototype.geenInzet = function(triggerEvent) {
    this.disableIncidentUpdates();
    this.incidentId = null;
    this.incident = null;
    this.incidentDetailsWindow.data(null);
    this.incidentDetailsWindow.hide();
    this.markerLayer.clear();

    this.button.setAlerted(false);
    this.button.setIcon("bell-o");

    if(triggerEvent) {
        $(me).triggerHandler("end_incident");
    }
};

VoertuigInzetController.prototype.inzetIncident = function(incidentId) {
    var me = this;
    if(incidentId !== me.incidentId) {
        me.geenInzet(false);

        me.incidentId = incidentId;
        var responseIncidentId = incidentId;

        me.service.getAllIncidentInfo(responseIncidentId, false, true)
        .fail(function(e) {
            var msg = "Kan incidentinfo niet ophalen: " + e;
            dbkjs.gui.showError(msg);
            this.button.setIcon("bell-slash");
            me.incidentDetailsWindow.showError(msg);
        })
        .done(function(incident) {
            if(responseIncidentId !== me.incidentId) {
                // Incident was cancelled or changed since request was fired off, ignore
                return;
            }
            me.incident = incident;
            me.incidentDetailsWindow.data(incident, false);
            me.markerLayer.addIncident(incident, true);
            me.markerLayer.setZIndexFix();

            dbkjs.protocol.jsonDBK.deselect();
            me.selectIncidentDBK(incident);
            me.zoomToIncident();
            me.incidentDetailsWindow.show();
            me.enableIncidentUpdates();

            me.button.setIcon("bell");

            $(me).triggerHandler("new_incident", incident);
        });
    }
};

/**
 * Find and select DBK for the incident.
 * @param {object} incident
 */
VoertuigInzetController.prototype.selectIncidentDBK = function(incident) {
    var me = this;

    //var postcode = incident.POSTCODE;
    var straat1 = incident.NAAM_LOCATIE1;
    var straat2 = incident.NAAM_LOCATIE2;
    var plaats = incident.PLAATS_NAAM;
    var huisnummer = incident.HUIS_PAAL_NR;
    var x = incident.T_X_COORD_LOC;
    var y = incident.T_Y_COORD_LOC;

    console.log("Zoeken naar DBK voor incident NAAM_LOCATIE1=" + straat1 + ", NAAM_LOCATIE2=" + straat2 +
            ", PLAATS_NAAM=" + plaats + ", HUIS_PAAL_NR=" + huisnummer + ", positie=" + x +"," + y);
    if(!dbkjs.modules.feature.features) {
        return;
    }

    var matches = [];
    var huisnummerMatches = [];
    $.each(dbkjs.modules.feature.features, function (index, f) {
        var fas = f.attributes.adres;
        if(!fas) {
            return true;
        }
        var distance = null;
        if(x && y && f.geometry) {
            var dx = f.geometry.x - x;
            var dy = f.geometry.y - y;
            distance = Math.sqrt(dx*dx + dy*dy);
        }
        if(!distance || distance > me.dbkSelectMaxDistance) {
            return true;
        }
        console.log("DBK binnen max afstand: " + f.attributes.formeleNaam + ", " + Math.round(distance) + "m");
        $.each(fas, function (index, fa) {
            if(!fa) {
                return true;
            }

            //var matchPostcode = postcode && fa.postcode && postcode === fa.postcode;

            var matchWoonplaats = false;
            if(plaats && fa.woonplaatsNaam) {
                plaats = plaats.toLowerCase();
                var dbkPlaats = fa.woonplaatsNaam.toLowerCase();
                if(dbkPlaats === "den haag") {
                    dbkPlaats = "'s-gravenhage";
                }
                matchWoonplaats = plaats === dbkPlaats;
            }
            var matchStraat = straat1 && fa.openbareRuimteNaam && fa.openbareRuimteNaam.toLowerCase().indexOf(straat1.toLowerCase()) !== -1;
            matchStraat = matchStraat || (straat2 && fa.openbareRuimteNaam && fa.openbareRuimteNaam.toLowerCase().indexOf(straat2.toLowerCase()) !== -1);

            var matchHuisnummer = huisnummer && fa.huisnummer && huisnummer === Number(fa.huisnummer);

            if(matchWoonplaats && matchStraat) {
                matches.push({
                    dbk: f,
                    distance: distance
                });
                console.log("DBK adres matcht " + (matchHuisnummer ? "incl huisnummer" : "excl huisnummer") +" : " + f.attributes.formeleNaam + ", adres: " + fa.openbareRuimteNaam + " " + fa.huisnummer + ", " + fa.woonplaatsNaam);

                if(matchHuisnummer) {
                    huisnummerMatches.push(f);
                }
                return false; // don't search other adresses of this dbk
            }
        });
    });

    var dbk = null;
    if(huisnummerMatches.length === 1) {
        dbk = huisnummerMatches[0];
    } else {
        var minDist = null;
        $.each(matches, function(i, match) {
            if(!minDist || match.distance < minDist) {
                dbk = match.dbk;
                minDist = match.distance;
            }
        });
    }
    if(dbk) {
        console.log("DBK geselecteerd: " + dbk.attributes.formeleNaam);
        dbkjs.protocol.jsonDBK.process(dbk, null, true); // no zooming
    } else {
        console.log("Could not match incident DBK");
    }
};

VoertuigInzetController.prototype.zoomToIncident = function() {
    if(this.incident && this.incident.T_X_COORD_LOC && this.incident.T_Y_COORD_LOC) {
        dbkjs.map.setCenter(new OpenLayers.LonLat(this.incident.T_X_COORD_LOC, this.incident.T_Y_COORD_LOC), dbkjs.options.zoom);
    }
};

VoertuigInzetController.prototype.markerClick = function(incident, marker) {
    this.incidentDetailsWindow.show();
    this.zoomToIncident();
};

VoertuigInzetController.prototype.enableIncidentUpdates = function() {
    var me = this;

    this.disableIncidentUpdates();

    if(!this.incident) {
        return;
    }

    this.updateIncidentInterval = window.setInterval(function() {
        me.updateIncident(me.incidentId);
    }, 15000);
};

VoertuigInzetController.prototype.disableIncidentUpdates = function() {
    if(this.updateIncidentInterval) {
        window.clearInterval(this.updateIncidentInterval);
        this.updateIncidentInterval = null;
    }
};

VoertuigInzetController.prototype.updateIncident = function(incidentId) {
    var me = this;
    if(this.incidentId !== incidentId) {
        // Incident cancelled or changed since timeout was set, ignore
        return;
    }

    me.service.getAllIncidentInfo(incidentId, false, true)
    .fail(function(e) {
        var msg = "Kan incidentinfo niet updaten: " + e;
        dbkjs.gui.showError(msg);
        // Leave incidentDetailsWindow contents with old info
    })
    .done(function(incident) {
        if(me.incidentId !== incidentId) {
            // Incident cancelled or changed since request was fired off, ignore
            return;
        }

        // Always update window, updates moment.fromNow() times
        me.incidentDetailsWindow.data(incident, false, true);

        // Check if updated, enable alert state if true
        var oldIncidentHtml = me.incidentDetailsWindow.getIncidentHtml(me.incident, false, true);
        if(oldIncidentHtml !== me.incidentDetailsWindow.getIncidentHtml(incident, false, true)) {
            if(!me.incidentDetailsWindow.isVisible()) {
                me.button.setAlerted(true);
            }

            me.incident = incident;

            // Possibly update marker position
            me.markerLayer.clear();
            me.markerLayer.addIncident(incident, true);
            me.markerLayer.setZIndexFix();
        }
    });
};
