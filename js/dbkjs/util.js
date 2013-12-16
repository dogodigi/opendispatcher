$.browser = {};
$.browser.mozilla = /mozilla/.test(navigator.userAgent.toLowerCase()) && !/webkit    /.test(navigator.userAgent.toLowerCase());
$.browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase());
$.browser.opera = /opera/.test(navigator.userAgent.toLowerCase());
$.browser.msie = /msie/.test(navigator.userAgent.toLowerCase());
$.browser.device = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));
var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.util = {
    layersLoading: [],
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
        } else if (typeof (title) === "string") {
            $('#' + modal_id).find('div.modal-header:first').html('<h4 class="modal-title">' + title + '</h4>');
        }

    },
    onClick: function(e) {
        //controleer of de layer onderdeel is van een module en een getfeatureinfo heeft
        $.each(dbkjs.map.layers, function(lay_index, lay){
            if(lay.visibility && lay.dbkjsParent && lay.dbkjsParent.getfeatureinfo){
                lay.dbkjsParent.getfeatureinfo(e);
            }
        });
    },
    isJsonNull: function(val) {
        if (val === "null" || val === null || val === "" || typeof (val) === "undefined" || val === "undefined") {
            return true;
        } else {
            return false;
        }
    },
    pad: function(num, size) {
        var s = num + "";
        while (s.length < size)
            s = "0" + s;
        return s;
    },
    parseSeconds: function(duration) {
        //duration is a momentjs object
        var x = duration.asSeconds();
        var hr = Math.floor(x / 3600);
        var min = Math.floor((x - (hr * 3600)) / 60);
        var sec = Math.floor(x - (hr * 3600) - (min * 60));
        if (min < 10) {
            min = '0' + min;
        }
        if (sec < 10) {
            sec = '0' + sec;
        }
        if (hr > 0) {
            hr += ':';
        } else {
            hr = '';
        }
        return hr + min + ':' + sec;
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
                if (typeof (feat.cluster) !== "undefined") {
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
                if (typeof (feat.cluster) !== "undefined") {
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
    createPriority: function(incidentnr, description, prio) {
        description = dbkjs.util.isJsonNull(description) ? '' : '<i>' + description + '</i>';
        incidentnr = dbkjs.util.isJsonNull(incidentnr) ? '' : '<strong>' + incidentnr + '</strong>';
        var labelclass = "label-default";
        if (prio) {
            if (prio === "Prio 1") {
                labelclass = "label-danger";
            }
            if (prio === "Prio 2") {
                labelclass = "label-warning";
            }
        }
        return $.trim(incidentnr + ' <span class="label ' + labelclass + '">' + prio + '</span>' + ' ' + description);

    },
    createNorm: function(name, real, norm) {
        name = dbkjs.util.isJsonNull(name) ? '' : '<i>' + name + '</i>';
        if (real === 0 || norm === 0) {
            return '';
        } else {
            var diff = Math.abs(real - norm);
            if (real - norm > 0) {
                sign = '+';
            } else {
                sign = '-';
            }
            if (real > norm) {
                if (real - norm > 300) {
                    labelclass = "label-danger";
                    color = "#D9534F";
                } else {
                    labelclass = "label-warning";
                    color = "#F0AD4E";
                }
            } else {
                labelclass = "label-success";
                color = "#5CB85C";
            }
            var output = '<tr><td colspan="2">Situatie: ' + name + ' - norm: ' + dbkjs.util.parseSeconds(moment.duration(norm, "seconds")) + '<td></tr>';
            output += '<tr><td colspan="2">Berekende opkomsttijd: <span class="label ' + labelclass + '">' + dbkjs.util.parseSeconds(moment.duration(real, "seconds")) + '</span><i style="color:' + color + ';"> ' + sign + dbkjs.util.parseSeconds(moment.duration(diff, "seconds")) + '</i><td></tr>';
            return output;
        }
    },
    createClassification: function(c1, c2, c3) {
        lc1 = dbkjs.util.isJsonNull(c1) ? '' : '<li><a href="#">' + c1 + '</a></li>';
        lc2 = dbkjs.util.isJsonNull(c2) ? '' : '<li><a href="#">' + c2 + '</a></li>';
        lc3 = dbkjs.util.isJsonNull(c3) ? '' : '<li><a href="#">' + c3 + '</a></li>';
        return '<ol class="breadcrumb classification">' +
                lc1 + lc2 + lc3 +
                '</ol>';
    },
    createAddress: function(city, municipality, street, housenr, housenradd, housename, zipcode) {
        city = dbkjs.util.isJsonNull(city) ? '' : city;
        municipality = dbkjs.util.isJsonNull(municipality) ? '' : municipality;
        street = dbkjs.util.isJsonNull(street) ? '' : street;
        housenr = dbkjs.util.isJsonNull(housenr) ? '' : housenr;
        housenr = housenr !== 0 ? housenr : '';
        housenradd = dbkjs.util.isJsonNull(housenradd) ? '' : housenradd;
        housename = dbkjs.util.isJsonNull(housename) ? '' : '<strong>' + housename + '</strong><br>';
        zipcode = dbkjs.util.isJsonNull(zipcode) ? '' : zipcode;
        municipality = (city === municipality) ? '' : municipality;
        var addressline1 = $.trim(street + ' ' + housenr + '  ' + housenradd);
        var addressline2 = $.trim(zipcode + '  ' + city + ' ' + municipality);
        var address_set = dbkjs.util.isJsonNull(addressline1) ? addressline2 : addressline1 + '<br>' + addressline2;
        var address = $('<address>' +
                housename +
                address_set +
                '</address>');
        return address;
    },
    createListGroup: function(item_array) {
        var listgroup = $('<ul class="list-group"></ul>');
        $.each(item_array, function(item_idx, item) {
            listgroup.append('<li class="list-group-item">' + item + '</li>');
        });
        return listgroup;
    },
    loadingStart: function(layer) {
        var arr_index = $.inArray(layer.name, this.layersLoading);
        if (arr_index === -1) {
            this.layersLoading.push(layer.name);
        }

        var alert = $('#systeem_meldingen');
        if (!alert[0]) {
            var alert = $('<div id="systeem_meldingen" class="alert alert-dismissable alert-info"></div>');
            alert.append('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>');
            alert.append('<i class="icon-spinner icon-spin"></i> Bezig met laden van ' + this.layersLoading.join(', ') + '...');
            $('body').append(alert);
            alert.show();
        } else {
            alert.removeClass('alert-success alert-info alert-warning alert-danger').addClass('alert-info');
            alert.html('');
            alert.append('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>');
            alert.append('<i class="icon-spinner icon-spin"></i> Bezig met laden van ' + this.layersLoading.join(', ') + '...');
            alert.show();
        }

    },
    loadingEnd: function(layer) {
        var alert = $('#systeem_meldingen');
        if (this.layersLoading.length !== 0) {
            var arr_index = $.inArray(layer.name, this.layersLoading);
            if (arr_index !== -1) {
                this.layersLoading.splice(arr_index, 1);
            }

            if (!alert[0]) {
                if (this.layersLoading.length === 0) {
                    alert.hide();
                } else {
                    var alert = $('<div id="systeem_meldingen" class="alert alert-dismissable alert-info"></div>');
                    alert.append('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>');
                    alert.append('<i class="icon-spinner icon-spin"></i> Bezig met laden van ' + this.layersLoading.join(', ') + '...');
                    $('body').append(alert);
                    alert.show();
                }
            } else {
                if (this.layersLoading.length === 0) {
                    alert.hide();
                } else {
                    alert.removeClass('alert-success alert-info alert-warning alert-danger').addClass('alert-info');
                    alert.html('');
                    alert.append('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>');
                    alert.append('<i class="icon-spinner icon-spin"></i> Bezig met laden van ' + this.layersLoading.join(', ') + '...');
                    alert.show();
                }
            }
        } else {
            alert.hide();
        }
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
    /**
     * Verander de titel van de opgegeven panel
     * 
     * @param {string} title
     * @param {string} dialogid
     */
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
    /**
     * 
     * @param {string} id (optioneel)
     * @returns {jQuery.DOMElement} de nieuwe tabtabel
     */
    createTabbable: function(id) {
        if (!id) {
            id = OpenLayers.Util.createUniqueID("dbkjs_tabbable_");
        }
        var tabbable = $('<div id="' + id + '" class="tabbable"></div>');
        var ul = $('<ul class="nav nav-tabs"></ul>');
        var tab = $('<div class="tab-content"></div>');
        // @todo voor nu alleen tabs boven. Wellicht in de toekomst wat flexibeler maken
        tabbable.append(ul);
        tabbable.append(tab);
        return tabbable;
    },
    /**
     * Retourneert de tab_content id placeholder zodat hierop 
     * kan worden ingevoerd, kan eventueel met een bestaande id worden
     * aangeroepen.
     * 
     * @param {string} parent_id
     * @param {string} tab_title
     * @param {string} tab_content
     * @param {boolean} active tab aan of uit.
     * @param {string} id (optional)
     * @returns {string}
     */
    appendTab: function(parent_id, tab_title, tab_content, active, id) {
        var parent_ul = $('#' + parent_id + ' ul:first');
        var parent_tab = $('#' + parent_id + ' .tab-content:first');

        var li;
        var ref;
        var pane;
        if (!id) {
            var id = OpenLayers.Util.createUniqueID("dbkjs.tab_pane_");
        }

        li = $('#' + id + '_tab');
        pane = $('#' + id);
        if (li.length === 0) {
            li = $('<li id="' + id + '_tab"></li>');
            ref = $('<a href="#' + id + '" data-toggle="tab"></a>');
            li.append(ref);
            parent_ul.append(li);
        }
        ref = li.children().first();
        if (pane.length === 0) {
            pane = $('<div class="tab-pane active" id="' + id + '"></div>');
            parent_tab.append(pane);
        }
        ref.html(tab_title);
        pane.html(tab_content);
        if (active) {
            //verwijder van alle andere tabs de active state!
            parent_ul.children().removeClass('active');
            parent_tab.children().removeClass('active');
            li.addClass('active');
            pane.addClass('active');
        }
        return id;
    },
    removeTab: function(parent_id, id) {
        $('#' + id + '_tab').remove();
        $('#' + id).remove();
        $('#' + parent_id + ' ul:first').children().first().addClass('active');
        $('#' + parent_id + ' .tab-content:first').children().first().addClass('active');
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
    createModal: function(id, title, styleoptions) {
        var modal_wrapper = $('<div class="modal fade" id="' + id + '"></div>');
        var modal_dialog = $('<div class="modal-dialog"></div>');
        var modal_content = $('<div class="modal-content"></div>');
        var modal_header = $('<div id="' + id + '_h" class="modal-header"><h4 class="modal-title">'+ title +'</h4></div>');
        var modal_body = $('<div id="' + id + '_b" class="modal-body"></div>');
        modal_content.append(modal_header);
        modal_content.append(modal_body);
        modal_wrapper.append(modal_dialog.append(modal_content));
        modal_wrapper.modal('hide');
        return modal_wrapper;
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
    },
    padspaces: function(num,field){
        var n = '' + num;
        var w = n.length;
        var l = field.length;
        var pad = w < l ? l-w : 0;
        return n + field.substr(0,pad);
    }
};