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
 * Get incident information from an ArcGIS REST service configured on an Oracle
 * GMS replica database. Call initialize() after constructing the new object.
 *
 * Events:
 * initialized: when initialize() resolves
 *
 * @param {string} url The URL to the ArcGIS REST MapService
 * @returns {AGSIncidentService}
 */
function AGSIncidentService(url) {
    var me = this;
    me.url = url;
    if(!me.url) {
        throw "Null AGS incident service URL";
    }
}

/**
 * Get authentication token (if tokenUrl, user and pass supplied) and load service
 * info.
 * @param {string} tokenUrl optional
 * @param {string} user optional
 * @param {string} pass optional
 * @returns {Promise} A promise which will be resolved when the service info
 *  is succesfully loaded, or rejected on error.
 */
AGSIncidentService.prototype.initialize = function(tokenUrl, user, pass) {
    var me = this;
    var dInitialize = $.Deferred();

    var dToken;
    if(tokenUrl && user && pass) {
        dToken = me.getToken(tokenUrl, user, pass);
    } else {
        dToken = $.Deferred().resolve(null);
    }

    dToken
    .fail(function(e) {
        dInitialize.reject("Failure getting AGS auth token: " + e);
    })
    .done(function() {
        me.loadServiceInfo()
        .fail(function(e) {
            dInitialize.reject("Failure loading AGS incident service info: " + e);
        })
        .done(function() {
            dInitialize.resolve();
            $(me).triggerHandler('initialized');
        });
    });
    return dInitialize.promise();
};

/**
 * Static utility function: return a string with the information from an AGS
 * response with error property.
 * @param {Object} data Response from AGS service with error property
 * @returns {string} Description of the error
 */
AGSIncidentService.prototype.getAGSError = function(data) {
    return "Error code " + data.error.code + ": " + data.error.message;
};

/**
 * Static utility function: return a moment from epoch value returned by AGS.
 * @param {number} epoch as returned by AGS. Requires: moment.js
 * @returns {moment} the moment at the time defined by the epoch
 */
AGSIncidentService.prototype.getAGSMoment = function(epoch) {
    // Contrary to docs, AGS returns milliseconds since epoch in local time
    // instead of UTC
    return new moment(epoch).add(new Date().getTimezoneOffset(), 'minutes');
};

/**
 * Static utility function: resolve a deffered with the results from a AGS table
 * query returning the feature attributes as objects in an array or reject the
 * deferred on error.
 * @param {jQuery.Deferred} d The deferred to resolve or reject
 * @param {object} data from ajax response
 * @param {object} jqXHR from ajax response
 * @param {function} processFunction optional: function to process result with.
 *   If specified will be called for each feature with attributes as argument.
 *   The last returned value from this function will be used to resolve the
 *   promise with.
 * @param {function} noResultFunction optional function to provide the argument
 *   to resolve with if no features found, if not specified resolves to an
 *   empty array.
 * @param {function} postProcessFunction optional function to call to provide
 *   the resolve argument after processing all features. Use if post processing
 *   is needed with data from all features and the last result of the
 *   processFunction cannot be used to resolve the promise with.
 * @returns {undefined}
 */
AGSIncidentService.prototype.resolveAGSFeatures = function(d, data, jqXHR, processFunction, noResultFunction, postProcessFunction) {
    var me = this;
    if(data.error) {
        d.reject(me.getAGSError(data));
    } else if(!data.features) {
        d.reject(jqXHR.statusText);
    } else {
        var result = noResultFunction ? noResultFunction() : [];
        $.each(data.features, function(i, feature) {
            if(processFunction) {
                result = processFunction(feature.attributes);
            } else {
                result.push(feature.attributes);
            }
        });
        if(postProcessFunction) {
            d.resolve(postProcessFunction());
        } else {
            d.resolve(result);
        }
    }
};

/**
 * Get the AGS authentication token, and set timeout to automatically refresh it
 * once it will expire.
 * @param {string} tokenUrl
 * @param {string} user
 * @param {string} pass
 * @returns {Promise} A promise which will be rejected on error or resolved
 *   when the token is succesfully retrieved (this.token updated with the token).
 */
AGSIncidentService.prototype.getToken = function(tokenUrl, user, pass) {
    var me = this;
    var d = $.Deferred();

    $.ajax(tokenUrl, {
        dataType: "json",
        data: {
            f: "pjson",
            username: user,
            password: pass
        }
    })
    .always(function(data, textStatus, jqXHR) {
        if(data.token) {
            me.token = data.token;

            window.setTimeout(function() {
                // failure is ignored when updating token, maybe trigger event?
                me.getToken(tokenUrl, user, pass);
            }, data.expires - new moment().valueOf() - (5*60*1000));

            d.resolve();
        } else if(data.error) {
            d.reject(me.getAGSError(data));
        } else {
            d.reject(jqXHR.statusText);
        }
    });
    return d.promise();
};

/**
 * Get AGS MapService info to map table names to URLs.
 * @returns {Promise} A promise which will be resolved when this.tableUrls is
 *   initialized or be rejected on error.
 */
AGSIncidentService.prototype.loadServiceInfo = function() {
    var me = this;
    var d = $.Deferred();
    $.ajax(me.url, {
        dataType: "json",
        data: {
            f: "pjson",
            token: me.token
        }
    })
    .always(function(data, textStatus, jqXHR) {
        if(data.error) {
            d.reject(me.getAGSError(data));
        } else if(!data.tables) {
            d.reject(jqXHR.statusText);
        } else {
            me.tableUrls = {};
            $.each(data.tables, function(i,table) {
                var name = table.name.substring(table.name.indexOf(".")+1).replace("%", "");
                me.tableUrls[name] = me.url + "/" + table.id;
            });
            d.resolve();
        }
    });
    return d.promise();
};

/**
 * Static utility function: get display string for incident object
 * @param {Object} incident as received from AGS
 * @returns {string}
 */
AGSIncidentService.prototype.getIncidentTitle = function(incident) {
    return this.getAGSMoment(incident.DTG_START_INCIDENT).format("D-M-YYYY HH:mm:ss") + " "
            + dbkjs.util.htmlEncode((incident.PRIORITEIT_INCIDENT_BRANDWEER ? " PRIO "
            + incident.PRIORITEIT_INCIDENT_BRANDWEER : "") + " "
            + incident.T_GUI_LOCATIE + ", "
            + dbkjs.util.htmlEncode(incident.PLAATS_NAAM));
};

/**
 * Get all voertuignummers from inzet archive as typeahead datums, value is
 * ROEPNAAM_EENHEID, tokens also include CODE_VOERTUIGSOORT and KAZ_NAAM.
 * @returns {Promise} A promise which on success will resolve with the datums
 *   array as argument.
 */
AGSIncidentService.prototype.getVoertuignummerTypeahead = function() {
    var me = this;
    var d = $.Deferred();
    $.ajax(me.tableUrls.GMSARC_INZET_EENHEID + "/query", {
        dataType: "json",
        data: {
            f: "pjson",
            token: me.token,
            where: "T_IND_DISC_EENHEID = 'B'",
            orderByFields: "CODE_VOERTUIGSOORT,ROEPNAAM_EENHEID,KAZ_NAAM",
            outFields: "CODE_VOERTUIGSOORT,ROEPNAAM_EENHEID,KAZ_NAAM",
            returnDistinctValues: true
        }
    })
    .always(function(data, textStatus, jqXHR) {
        var datums = [];
        me.resolveAGSFeatures(d, data, jqXHR, function(f) {
            datums.push( { value: f.ROEPNAAM_EENHEID, tokens: [f.CODE_VOERTUIGSOORT, f.ROEPNAAM_EENHEID, f.KAZ_NAAM] });
            return datums;
        });
    });
    return d.promise();
};

/**
 * Get incident ID where the voertuignummer is currently ingezet.
 * @param {string} voertuignummer for which incident inzet is to be checked
 * @returns {Promise} A promise which will resolve with null when the voertuig
 *   is not ingezet or the incident ID for the incident when it is. The promise
 *   will be rejected on error.
 */
AGSIncidentService.prototype.getVoertuigInzet = function(voertuignummer) {
    var me = this;
    var d = $.Deferred();

    if(!voertuignummer) {
        d.reject("Null voertuignummer");
    } else {
        $.ajax(me.tableUrls.GMS_INZET_EENHEID + "/query", {
            dataType: "json",
            data: {
                f: "pjson",
                token: me.token,
                where: "T_IND_DISC_EENHEID = 'B' AND ROEPNAAM_EENHEID = '" + voertuignummer + "' AND DTG_EIND_ACTIE IS NULL",
                outFields: "INCIDENT_ID"
            }
        })
        .always(function(data, textStatus, jqXHR) {
            me.resolveAGSFeatures(d, data, jqXHR, function(f) {
                return f.INCIDENT_ID;
            },
            function() {
                return null;
            });
        });
    }
    return d.promise();
};

/**
 * Get all info for incident: incident properties, classificatie, karakteristiek,
 * kladblok.
 * @param {number} incidentId
 * @param {boolean} archief Use archive tables instead of current incident tables
 * @param {boolean} noInzetEenheden Do not get inzet eenheden
 * @returns {Promise} A promise which will be resolved with an object with the
 *  incident attributes as returned by AGS, with additional properties for
 *  classificatie, karakteristiek and kladlok all in one when succesful. Rejected
 *  on failure (of any subrequest) or if incident was not found.
 */
AGSIncidentService.prototype.getAllIncidentInfo = function(incidentId, archief, noInzetEenheden) {
    var me = this;
    var d = $.Deferred();

    if(!incidentId) {
        d.reject("Null incidentId");
    } else {
        // First get incident, if not found don't do requests for additional
        // properties
        me.getIncident(incidentId, archief)
        .fail(function(e) {
            d.reject(e);
        })
        .done(function(incident) {

            if(!incident) {
                d.resolve(null);
            } else {
                // Get additional properties
                var dClassificatie;

                if(archief) {
                    // Classificaties directly in incident attributes
                    var a = [];
                    if(incident.BRW_MELDING_CL) {
                        a.push(incident.BRW_MELDING_CL);
                    }
                    if(incident.BRW_MELDING_CL1) {
                        a.push(incident.BRW_MELDING_CL1);
                    }
                    if(incident.BRW_MELDING_CL2) {
                        a.push(incident.BRW_MELDING_CL2);
                    }
                    dClassificatie = a.length === 0 ? "" : a.join(", ");
                } else {
                    dClassificatie = me.getClassificaties(incident);
                }

                var dKarakteristiek = me.getKarakteristiek(incidentId, archief);
                var dKladblok = me.getKladblok(incidentId, archief);
                var dInzetEenheden = noInzetEenheden ? null : me.getInzetEenheden(incidentId, archief, false);

                $.when(dClassificatie, dKarakteristiek, dKladblok, dInzetEenheden)
                .fail(function(classificatie, karakteristiek, kladblok, inzetEenheden) {
                    d.reject("Kan geen extra incident info ophalen, classificaties: " +
                        classificatie + ", karakteristiek: " + karakteristiek +
                        ", kladblok: " + kladblok + ", inzet eenheden: " + inzetEenheden);
                })
                .done(function(classificatie, karakteristiek, kladblok, inzetEenheden) {

                    // Set additional properties in incident
                    incident.classificatie = classificatie;
                    incident.karakteristiek = karakteristiek;
                    incident.kladblok = kladblok;
                    incident.inzetEenheden = inzetEenheden;

                    incident.getTitle = function() {
                        return me.getIncidentTitle(incident);
                    };

                    d.resolve(incident);
                });
            }
        });
    }
    return d.promise();
};

/**
 * Get incident properties for incident id
 * @param {number} incidentId
 * @param {boolean} archief set to true to get archived incident
 * @returns {Promise} Resolved with incident attributes on success, null if
 *   incident not found or rejected on error.
 */
AGSIncidentService.prototype.getIncident = function(incidentId, archief) {
    var me = this;
    var d = $.Deferred();

    if(!incidentId) {
        return d.resolve(null);
    }

    $.ajax(me.tableUrls[archief ? "GMSARC_INCIDENT" : "GMS_INCIDENT"] + "/query", {
        dataType: "json",
        data: {
            f: "pjson",
            token: me.token,
            where: "INCIDENT_ID = " + incidentId,
            outFields: "*"
        }
    })
    .always(function(data, textStatus, jqXHR) {
        me.resolveAGSFeatures(d, data, jqXHR, function(f) {
            return f;
        },
        function() {
            return null;
        });
    });

    return d.promise();
};

/**
 * Get classificaties for one or multiple incidenten. Pass a single object with
 * an (optional) BRW_MELDING_CL_ID property or an array of them. For a single
 * object resolves to null or a string with the classification. When an array
 * is passed as argument, resolves to an object with the INCIDENT_ID properties
 * of the objects in the array as properties and the classifications as property
 * values (if the object in the array had a BRW_MELDING_CL_ID).
 * @param {type} incidenten Array or object with BRW_MELDING_CL_ID and INCIDENT_ID properties
 * @returns {Promise} A promise to be resolved as described above or rejected on
 *   error.
 */
AGSIncidentService.prototype.getClassificaties = function(incidenten) {
    var me = this;
    var d = $.Deferred();

    var meldingClIds = [];
    if(incidenten instanceof Array) {
        $.each(incidenten, function(i, incident) {
            if(incident.BRW_MELDING_CL_ID) {
                meldingClIds.push(incident.BRW_MELDING_CL_ID);
            }
        });
    } else {
        // Get classificaties voor single incident
        if(incidenten.BRW_MELDING_CL_ID) {
            meldingClIds = [incidenten.BRW_MELDING_CL_ID];
        }
    }

    if(meldingClIds.length === 0) {
        if(incidenten instanceof Array) {
            d.resolve({});
        } else {
            d.resolve(null);
        }
        return d;
    }

    $.ajax(me.tableUrls.GMS_MLD_CLASS_NIVO_VIEW + "/query", {
        dataType: "json",
        data: {
            f: "pjson",
            token: me.token,
            where: "MELDING_CL_ID IN (" + meldingClIds.join(",") + ")",
            outFields: "*"
        }
    })
    .always(function(data, textStatus, jqXHR) {
        var classificaties = {};
        me.resolveAGSFeatures(d, data, jqXHR, function(c) {
            // processFunction
            var vals = [];
            if(c.NIVO1) {
                vals.push(c.NIVO1);
            }
            if(c.NIVO2) {
                vals.push(c.NIVO2);
            }
            if(c.NIVO3) {
                vals.push(c.NIVO3);
            }
            classificaties[c.MELDING_CL_ID] = vals.join(", ");
        },
        function() {
            // noResultFunction
            if(incidenten instanceof Array) {
                return {};
            } else {
                return null;
            }
        },
        function() {
            // postProcessFunction
            if(incidenten instanceof Array) {
                var classificatiesByIncidentId = {};
                $.each(incidenten, function(i, incident) {
                    if(incident.BRW_MELDING_CL_ID && classificaties[incident.BRW_MELDING_CL_ID]) {
                        classificatiesByIncidentId[incident.INCIDENT_ID] = classificaties[incident.BRW_MELDING_CL_ID];
                    }
                });
                return classificatiesByIncidentId;
            } else {
                return classificaties[incidenten.BRW_MELDING_CL_ID];
            }
        });
    });
    return d.promise();
};

/**
 * Gets karakteristieken for incident id
 * @param {number} incidentId
 * @returns {Promise} Resolved with array with karakteristieken when succesful
 *   or rejected on error
 */
AGSIncidentService.prototype.getKarakteristiek = function(incidentId) {
    var me = this;
    var d = $.Deferred();

    if(!incidentId) {
        return d.resolve([]);
    }

    $.ajax(me.tableUrls.GMSARC_KARAKTERISTIEK + "/query", {
        dataType: "json",
        data: {
            f: "pjson",
            token: me.token,
            where: "INCIDENT_ID = " + incidentId,
            outFields: "NAAM_KARAKTERISTIEK,ACTUELE_KAR_WAARDE"
        }
    })
    .always(function(data, textStatus, jqXHR) {
        me.resolveAGSFeatures(d, data, jqXHR);
    });
    return d.promise();
};

AGSIncidentService.prototype.getKladblok = function(incidentId, archief) {
    var me = this;
    var d = $.Deferred();

    if(!incidentId) {
        return d.resolve([]);
    }

    $.ajax(me.tableUrls[archief ? "GMSARC_KLADBLOK" : "GMS_KLADBLOK"] + "/query", {
        dataType: "json",
        data: {
            f: "pjson",
            token: me.token,
            where: "INCIDENT_ID = " + incidentId + " AND TYPE_KLADBLOK_REGEL = 'KB' AND T_IND_DISC_KLADBLOK_REGEL LIKE '_B_' AND WIJZIGING_ID IS NULL",
            orderByFields: "DTG_KLADBLOK_REGEL,KLADBLOK_REGEL_ID,VOLG_NR_KLADBLOK_REGEL",
            outFields: "*"
        }
    })
    .always(function(data, textStatus, jqXHR) {
        me.resolveAGSFeatures(d, data, jqXHR);
    });
    return d.promise();
};

AGSIncidentService.prototype.getInzetEenheden = function(incidentIds, archief, alleenBrandweer) {
    var me = this;
    var d = $.Deferred();

    if(!incidentIds || incidentIds.length === 0) {
        return d.resolve(incidentIds instanceof Array ? [] : null);
    }
    incidentIds = incidentIds instanceof Array ? incidentIds : [incidentIds];

    $.ajax(me.tableUrls[archief ? "GMSARC_INZET_EENHEID" : "GMS_INZET_EENHEID"] + "/query", {
        dataType: "json",
        data: {
            f: "pjson",
            token: me.token,
            where: "INCIDENT_ID IN (" + incidentIds.join(",") + ") " + (alleenBrandweer ? "AND T_IND_DISC_EENHEID = 'B'" : ""),
            orderByFields: "DTG_OPDRACHT_INZET",
            outFields: "*"
        }
    })
    .always(function(data, textStatus, jqXHR) {
        me.resolveAGSFeatures(d, data, jqXHR);
    });
    return d.promise();
};
