var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.util = {
    /**
     * script voor updaten zichtbaarheid van overlays 
     * @param {<OpenLayers.Layer>} obj
     */
    toggleOverlay: function(obj) {
        var layers = dbkjs.map.getLayersByName(obj.name);
        if (layers.length === 1) {
            if (obj.checked === true) {
                layers[0].setVisibility(true);
            } else {
                layers[0].setVisibility(false);
            }
        } else {
            alert('layer niet gevonden (of meer dan 1)');
        }
    },
    setModalTitle: function(modal_id, title) {
        if (title instanceof jQuery) {
            $('#' + modal_id).find('div.modal-header:first').html(title);
        } else if (typeof(title) === "string") {
            $('#' + modal_id).find('div.modal-header:first').html('<h4 class="modal-title">' + title + '</h4>');
        }

    },
    onClick: function(e) {
        $('#infopanel_b').html('');
        $('#infopanel_f').html('');
        if (dbkjs.modules) {
            $.each(dbkjs.modules, function(mod_index, module) {
                if ($.inArray(mod_index, dbkjs.options.regio.modules) > -1) {
                    if (typeof(module.layer) !== "undefined" && module.layer.visibility) {
                        // Controleer of het een van de dbk layers is waar op is geklikt.
                        if (dbkjs.protocol) {
                            if (dbkjs.protocol.imdbk21) {
                                if ($.inArray(module.id, ["dbko", "dbkf", "dbkgev", "dbkprep", "dbkprev"]) !== -1) {
                                    dbkjs.protocol.imdbk21.process(dbkjs.options.dbk);
                                } else {
                                    if (typeof(module.getfeatureinfo) !== "undefined") {
                                        module.getfeatureinfo(e);
                                    }
                                }
                            }
                        } else {
                            if (typeof(module.getfeatureinfo) !== "undefined") {
                                module.getfeatureinfo(e);
                            }
                        }
                    }
                }
            });
        }
    },
    isJsonNull: function(val) {
        if (val === "null" || val === null || val === "" || typeof(val) === "undefined") {
            return true;
        } else {
            return false;
        }
    },
    /**
     * 
     * @param {String} variable
     * @param {String} defaultvalue
     * @returns {String} the value for the given queryparameter
     */
    getQueryVariable: function(variable, defaultvalue) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        var returnval = defaultvalue;
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) === variable) {
                returnval = decodeURIComponent(pair[1]);
            }
        }
        return returnval;
    },
    convertOlToJstsGeom: function(olGeom) {
        var result = null;
        if (typeof olGeom !== 'undefined') {
            var jstsConverter = new jsts.io.WKTReader();
            //var olConverter = new OpenLayers.Format.WKT();
            //var wktGeom = olConverter.write(olGeom);
            var wktGeom = olGeom.toString();
            var jstsGeom = jstsConverter.read(wktGeom);
            if (jstsGeom !== null) {
                result = jstsGeom;
            }
        }
        return result;
    },
    convertJstsToOlGeom: function(jstsGeom) {
        var result = null;
        if (typeof jstsGeom !== 'undefined') {
            var jstsConverter = new jsts.io.WKTWriter();
            var olConverter = new OpenLayers.Format.WKT();
            var wktGeom = jstsConverter.write(jstsGeom);
            //olGeom.toString();
            var olGeom = olConverter.read(wktGeom);
            if (olGeom !== null) {
                result = olGeom;
            }
        }
        return result;
    },
    getFeaturesForBuffer: function(vLayer, buffer) {
        var result = [];
        var i;
        for (i = 0; i < vLayer.features.length; i++) {
            var feat = vLayer.features[i];
            var jstsGeom = convertOlToJstsGeom(feat.geometry);
            if (buffer.intersects(jstsGeom)) {
                if (typeof(feat.cluster) !== "undefined") {
                    var j;
                    for (j = 0; j < feat.cluster.length; j++) {
                        result.push(feat.cluster[j]);
                    }
                } else {
                    result.push(feat);
                }
            }
        }
        return result;
    },
    getFeaturesForLine: function(vLayer, jstsLine, bufdist) {
        var result = new Array();
        var i;
        for (i = 0; i < vLayer.features.length; i++) {
            var feat = vLayer.features[i];
            var jstsGeom = convertOlToJstsGeom(feat.geometry);
            if (jstsLine.distance(jstsGeom) < bufdist) {
                if (typeof(feat.cluster) !== "undefined") {
                    var j;
                    for (j = 0; j < feat.cluster.length; j++) {
                        result.push(feat.cluster[j]);
                    }
                } else {
                    result.push(feat);
                }
            }
        }
        return result;
    },
    touchEnabled: function() {
        if ("ontouchstart" in document.documentElement) {
            return true;
        } else {
            return false;
        }
    },
    mediaError: function(e) {
        var msg = $($(e).parent().find('p')[0]);
        if (msg) {
            msg.html('<a href="' + e.src + '">' + e.src + '</a><br>is geen geldige afbeelding');
        }
        e.src = "images/missing.gif";
        e.onerror = "";
        return true;
    },
    createListGroup: function(item_array) {
        var listgroup = $('<ul class="list-group"></ul>');
        $.each(item_array, function(item_idx, item) {
            listgroup.append('<li class="list-group-item">' + item + '</li>');
        });
        return listgroup;
    },
    alert: function(title, tekst, type) {
        if (!type) {
            type = 'alert-info';
        }
        var content = '<strong>' + title + '</strong> ' + tekst;
        var alert = $('#systeem_meldingen');
        if (!alert[0]) {
            var alert = $('<div id="systeem_meldingen" class="alert alert-dismissable ' + type + '"></div>');
            alert.append('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>');
            alert.append(content);
            $('body').append(alert);
            alert.show();
        } else {
            alert.removeClass('alert-success alert-info alert-warning alert-danger').addClass(type);
            alert.html('');
            alert.append('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>');
            alert.append(content);
            alert.show();
        }
    },
    htmlEncode: function(value) {
        if (value) {
            return $('<div/>').text(value).html();
        } else {
            return '';
        }
    },
    changeDialogTitle: function(title, dialogid) {
        var dialog;
        if (!dialogid) {
            //asume it is the infopanel.
            dialog = $('#infopanel_h');
        } else {
            dialog = $(dialogid + '_h');
        }
        if (title) {
            $(dialog.children('span')[0]).html(title);
        }
    },
    createDialog: function(id, title, styleoptions) {
        if (!styleoptions) {
            styleoptions = '';
        }
        var dialog = $('<div class="panel dialog" id="' + id + '" style="display:none;' + styleoptions + '"></div>');
        var heading = $('<div id="' + id + '_h" class="panel-heading"></div>');
        var close_button = $('<button type="button" class="close" aria-hidden="true">&times;</button>');
        heading.append(close_button);
        heading.append('<span class="h4">' + title + '</span>');
        var dg_body = $('<div id="' + id + '_b" class="panel-body"></div>');
        var dg_footer = $('<div id="' + id + '_f" class="panel-footer"></div>');
        dialog.append(heading);
        dialog.append(dg_body);
        dialog.append(dg_footer);
        close_button.click(function() {
            dialog.hide();
        });
        return dialog;
    },
    exportTableToCSV: function($table, filename) {
        var $rows = $table.find('tr:has(td)'),
                // Temporary delimiter characters unlikely to be typed by keyboard
                // This is to avoid accidentally splitting the actual contents
                tmpColDelim = String.fromCharCode(11), // vertical tab character
                tmpRowDelim = String.fromCharCode(0), // null character

                // actual delimiter characters for CSV format
                colDelim = '","',
                rowDelim = '"\r\n"',
                // Grab text from table into CSV formatted string
                csv = '"' + $rows.map(function(i, row) {
            var $row = $(row),
                    $cols = $row.find('td');

            return $cols.map(function(j, col) {
                var $col = $(col),
                        text = $col.text();

                return text.replace('"', '""'); // escape double quotes

            }).get().join(tmpColDelim);

        }).get().join(tmpRowDelim)
                .split(tmpRowDelim).join(rowDelim)
                .split(tmpColDelim).join(colDelim) + '"',
                // Data URI
                csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);

        $(this)
                .attr({
            'download': filename,
            'href': csvData,
            'target': '_blank'
        });
    }
};