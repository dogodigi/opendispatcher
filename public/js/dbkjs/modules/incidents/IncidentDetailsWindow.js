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
 * Window which shows incident details. Subclass of SplitScreenWindow. Create
 * only one instance as it always uses modal popup name "incidentDetails".
 * @returns {IncidentDetailsWindow}
 */
function IncidentDetailsWindow() {
    SplitScreenWindow.call(this, "incidentDetails", "Incident");

    $(this).on('elements_created', function() {
        var v = ModalWindow.prototype.getView.call(this);
        v.html("Bezig...");
    });
}

IncidentDetailsWindow.prototype = Object.create(SplitScreenWindow.prototype);
IncidentDetailsWindow.prototype.constructor = IncidentDetailsWindow;

IncidentDetailsWindow.prototype.showError = function(e) {
    this.getView().text(e);
};

/**
 * Render an incident in the window view.
 * @param {object} incident Complete incident from AGSIncidentService.getAllIncidentInfo()
 * @param {boolean} restoreScrollTop
 * @returns {undefined}
 */
IncidentDetailsWindow.prototype.data = function(incident, showInzet, restoreScrollTop) {
    var v = this.getView();

    v.html("");
    if(!incident) {
        v.text("Er is momenteel geen incident waavoor dit voertuig is ingezet.");
        return;
    }

    var scrollTop = v.scrollTop();

    v.html(this.getIncidentHtml(incident, showInzet, false));

    if(restoreScrollTop) {
        v.scrollTop(scrollTop);
    }
};

/**
 * Get HTML to display incident. Boolean specificies whether to leave out time
 * dependent information ('1 minute ago') to compare changes.
 * @param {object} incident
 * @param {boolean} showInzet show voertuig inzet
 * @param {boolean} compareMode the result should only depend on the incident
 *   parameter, not other factors such as current time
 * @returns {undefined}
 */
IncidentDetailsWindow.prototype.getIncidentHtml = function(incident, showInzet, compareMode) {
    var html = '<div style:"width: 100%" class="table-responsive">';
    html += '<table class="table table-hover">';

    var columns = [
        { property: 'DTG_START_INCIDENT', date: true, label: 'Start incident' },
        { property: 'T_GUI_LOCATIE', date: false, label: 'Adres' },
        { property: 'POSTCODE', date: false, label: 'Postcode' },
        { property: 'PLAATS_NAAM', date: false, label: 'Woonplaats' },
        { property: 'PRIORITEIT_INCIDENT_BRANDWEER', date: false, label: 'Prioriteit', separate: true }
    ];

    $.each(columns, function(i, column) {
        var p = incident[column.property];
        if (!dbkjs.util.isJsonNull(p)) {
            var v;
            if(column.date) {
                var d = AGSIncidentService.prototype.getAGSMoment(p);
                v = d.format("dddd, D-M-YYYY HH:mm:ss") + (compareMode ? "" : " (" + d.fromNow() + ")");
            } else {
                v = dbkjs.util.htmlEncode(p);
            }
            if(column.separate) {
                html += '<tr><td>&nbsp;</td><td></td></tr>';
            }
            html += '<tr><td><span>' + column.label + "</span>: </td><td>" + v + "</td></tr>";
        }
    });

    html += '<tr><td>Melding classificatie:</td><td>' + dbkjs.util.htmlEncode(incident.classificatie) + '</td></tr>';

    html += '<tr><td>Karakteristieken:</td><td>';
    if(!incident.karakteristiek || incident.karakteristiek.length === 0) {
        html += "<h4>-</h4>";
    } else {
        html += '<div style:"width: 100%" class="table-responsive">';
        html += '<table class="table table-hover">';
        $.each(incident.karakteristiek, function(i, k) {
            if(!k.ACTUELE_KAR_WAARDE) {
                return;
            }
            html += "<tr><td>" + dbkjs.util.htmlEncode(k.NAAM_KARAKTERISTIEK) + "</td><td>" + dbkjs.util.htmlEncode(k.ACTUELE_KAR_WAARDE) + "</td></tr>";
        });
        html += '</table><div/>';
    }
    html += '</td></tr>';

    if(showInzet) {
        html += '<tr><td>Ingezette eenheden:</td><td id="eenheden">';
        var eenhBrw = "", eenhPol = "", eenhAmbu = "";
        $.each(incident.inzetEenheden, function(i, inzet) {
            var eenheid = (inzet.CODE_VOERTUIGSOORT ? inzet.CODE_VOERTUIGSOORT : "") + " " + inzet.ROEPNAAM_EENHEID;
            if(inzet.KAZ_NAAM) {
                eenheid += " (" + inzet.KAZ_NAAM + ")";
            }
            var span = (inzet.DTG_EIND_ACTIE ? "<span class='einde'>" : "<span>") + dbkjs.util.htmlEncode(eenheid) + "</span><br/>";
            if(inzet.T_IND_DISC_EENHEID === "B") {
                eenhBrw += span;
            } else if(inzet.T_IND_DISC_EENHEID === "P") {
                eenhPol += span;
            } else if(inzet.T_IND_DISC_EENHEID === "A") {
                eenhAmbu += span;
            }
        });
        html += '<div id="brw"><b>Brandweer</b><br/>' + eenhBrw + '</div>';
        html += '<div id="pol"><b>Politie</b><br/>' + eenhPol + '</div>';
        html += '<div id="ambu"><b>Ambu</b><br/>' + eenhAmbu + '</div>';
        html += '</td></tr>';
    }


    if(incident.kladblok.length !== 0) {
        html += '<tr><td id="kladblok" colspan="2">';
        var pre = "";
        $.each(incident.kladblok, function(i, k) {
            pre += AGSIncidentService.prototype.getAGSMoment(k.DTG_KLADBLOK_REGEL).format("DD-MM-YYYY HH:mm:ss ") +
                    dbkjs.util.htmlEncode(k.INHOUD_KLADBLOK_REGEL) + "\n";
        });
        html += "Kladblok:<br/><pre>" + pre + "</pre>";
        html += '</td></tr>';
    }

    html += '</table>';

    return html;
};