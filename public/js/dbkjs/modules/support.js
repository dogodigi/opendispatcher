/*!
 *  Copyright (c) 2014 Milo van der Linden (milo@dogodigi.net)
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

var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
dbkjs.modules.support = {
    id: "dbk.modules.support",
    register: function() {
        var _obj = dbkjs.modules.support;
        _obj.layer = new OpenLayers.Layer.Vector("Support");
        dbkjs.map.addLayer(_obj.layer);

        var markerStyle = {externalGraphic: 'images/supportmarker.png', graphicHeight:32, graphicWidth:32, graphicXOffset: -16, graphicYOffset: -32};

        var mark = dbkjs.util.getQueryVariable('mark');

        if(mark) {
            var coords = mark.split(",");
            var feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(coords[0], coords[1]),
                {},
                markerStyle
            );
            _obj.layer.addFeatures(feature);
        }

        if (dbkjs.options.organisation.support) {
            $('body').append('<div id="foutknop" class="btn-group">' +
                    '<a class="btn btn-default navbar-btn">' +
                    '<span><i class="fa fa-envelope-o"></i> ' + dbkjs.options.organisation.support.button +'</span>' +
                    '</a>' +
                    '</div>');
            var supportpanel = dbkjs.util.createDialog('supportpanel', '<i class="fa fa-envelope-o"></i> ' + dbkjs.options.organisation.support.button, 'bottom:0;left:0;');
            $('body').append(supportpanel);
            if(dbkjs.viewmode !== 'fullscreen') {
                $('.dialog').drags({handle: '.panel-heading'});
                $('.btn-group').drags({handle: '.drag-handle'});
            }
            // Foutknop //
//            var reciever = 'mailto:' + dbkjs.options.organisation.support.mail;
//            var subject = 'subject=' + dbkjs.options.APPLICATION + ' Melding' + dbkjs.options.VERSION + ' (' + dbkjs.options.RELEASEDATE + ')';
//            var body = 'body=' + location.href + ' (deze link wordt door de beheerder gecontroleerd)';
//            var sMailTo = dbkjs.util.htmlEncode(reciever + '?' + subject);
//            sMailTo += '&' + dbkjs.util.htmlEncode(body);
//            $('#foutknop').find('a').attr('href', sMailTo);

            $('#foutknop').click(function(){
                dbkjs.hoverControl.deactivate();
                dbkjs.selectControl.deactivate();
                _obj.layer.destroyFeatures();
                dbkjs.map.raiseLayer(_obj.layer, dbkjs.map.layers.length);
                var center = dbkjs.map.getCenter();
                var feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(center.lon, center.lat),
                    {some:'data'},
                    markerStyle
                );
                _obj.feature = feature;
                _obj.layer.addFeatures(feature);
                _obj.drag = new OpenLayers.Control.DragFeature(_obj.layer,{
                    'onDrag':function(feature, pixel){
                        _obj.feature = feature;
                    }
                });
                dbkjs.map.addControl(_obj.drag);
                _obj.drag.activate();
                $('#supportpanel_b').html('');
                //Selectie voor kaartlagen
                var layerarray = [];
                $.each(dbkjs.map.layers, function(l_index, layer) {
                    if ($.inArray(layer.name, ['hulplijn1', 'hulplijn2', 'Feature', 'Support']) === -1) {
                        //layername mag niet beginnen met OpenLayers_
                        if(layer.name.substring(0,11) !== "OpenLayers_"){
                            layerarray.push(layer.name);
                        }
                    }
                });
                layerarray.sort();
                var p = $('<form id="support-form" role="form"></form>');
                p.append('<p class="bg-info">Versleep eventueel het tekstballonnetje op de kaart om <br>aan te geven waar de fout is geconstateerd<br> of waar de melding over gaat.</p>');                
                var laag_input = $('<div class="form-group"><label for="subject">Onderwerp</label></div>');
                var select = $('<select name="subject" class="form-control" MULTIPLE></select>');
                if(dbkjs.options.organisation.support.subjects) {
                    var subjects = dbkjs.options.organisation.support.subjects.split(",");
                    for(var i = 0; i < subjects.length; i++) {
                        select.append('<option>' + subjects[i] + '</option>');
                    }
                } else {
                    select.append('<option selected>Algemene melding</option>');
                    var ignoreLayers = ["GMS Marker", "GPS Marker", "search"];
                    $.each(layerarray, function(l_index, name) {
                        if($.inArray(name, ignoreLayers) === -1) {
                            select.append('<option>' + name + '</option>');
                        }
                    });
                }
                laag_input.append(select);
                p.append(laag_input);
                var adres_input = $('<div class="form-group"><label for="address">Adres</label><input id="address" name="address" type="text" class="form-control" placeholder="Adres"></div>');
                p.append(adres_input);
                if(dbkjs.viewmode !== 'fullscreen') {
                    var gemeente_input = $('<div class="form-group"><label for="municipality">Gemeente</label><input id="municipality" name="municipality" type="text" class="form-control" placeholder="Gemeente"></div>');
                    p.append(gemeente_input);
                    var plaats_input = $('<div class="form-group"><label for="place">Plaats</label><input id="place" name="municipality" type="text" class="form-control" placeholder="Plaats"></div>');
                    p.append(plaats_input);
                }
                var user_input = $('<div class="form-group"><label for="name">Naam melder *</label><input id="name" name="name" type="text" class="form-control required" placeholder="Naam melder"></div>');
                p.append(user_input);
                var mail_input = $('<div class="form-group"><label for="email">E-mail *</label><input id="email" name="email" type="email" class="form-control required" placeholder="E-mail"></div>');
                p.append(mail_input);
                var tel_input = $('<div class="form-group"><label for="phone">Telefoon</label><input id="phone" name="phone" type="tel" class="form-control" placeholder="Telefoon"></div>');
                p.append(tel_input);
                var remarks_input = $('<div class="form-group"><label for="remarks">Melding *</label><textarea id="remarks" name="remarks" class="form-control required" placeholder="Melding"></textarea></div>');
                p.append(remarks_input);
                p.append('<p class="bg-danger">De velden met een sterretje <em>*</em> zijn verplicht!</p>');
                p.append('<button type="submit" class="btn btn-default">Verstuur</button>');
                $('#supportpanel_b').append(p);
                $('#supportpanel').show();
                $('#foutknop').hide();
                $("#support-form").bind('submit', function (e) {
                    var isValid = true;
                    var data = {};
                    $('#support-form').find('input, textarea, select').each(function(i, field) {

                        if($(field).hasClass("required") && field.value === ""){
                            isValid = false;
                            $(field).addClass("has-error");
                        }
                        data[field.name] = field.value;
                    });
                    if (!isValid) {
                        e.preventDefault();
                        return false;
                    }
                    else {
                        //add the permalink
                        data.permalink = $('#permalink').attr('href');
                        var i = data.permalink.indexOf("#");
                        var markParam = (data.permalink.indexOf("?") === -1 ? "?" : "&") + "mark=" + _obj.feature.geometry.x + "," + _obj.feature.geometry.y;
                        if(i === -1) {
                            data.permalink += markParam;
                        } else {
                            var hash = data.permalink.substring(i);
                            data.permalink = data.permalink.substring(0,i) + markParam + hash;
                        }
                        var geoJSON = new OpenLayers.Format.GeoJSON();
                        data.geometry = JSON.parse(geoJSON.write(_obj.feature.geometry));
                        data.srid = dbkjs.options.projection.srid;
                        var url = (dbkjs.options.urls && dbkjs.options.urls.annotation
                            ? dbkjs.options.urls.annotation
                            : dbkjs.basePath + 'api/annotation/');
                        jQuery.ajax({
                            type: "POST",
                            url: url,
                            dataType: "html",
                            data: data,
                            success: function (result) {
                                $('#supportpanel_b').html('<p class="bg-info">Uw melding is verstuurd. U ontvangt bericht omtrent de afhandeling.</p>');
                                _obj.layer.destroyFeatures();
                                _obj.drag.deactivate();
                                dbkjs.map.removeControl(_obj.drag);
                                dbkjs.hoverControl.activate();
                                dbkjs.selectControl.activate();

                                setTimeout(function() {
                                    supportpanel.find(".close").click();
                                }, 5000);
                            }
                        });
                        _obj.layer.destroyFeatures();
                        _obj.drag.deactivate();
                        dbkjs.map.removeControl(_obj.drag);
                        dbkjs.hoverControl.activate();
                        dbkjs.selectControl.activate();
                        e.preventDefault();
                        return false;
                    }
                });
            });
            supportpanel.find('.close').click(function(){
                _obj.layer.destroyFeatures();
                _obj.drag.deactivate();
                dbkjs.map.removeControl(_obj.drag);
                dbkjs.hoverControl.activate();
                dbkjs.selectControl.activate();
                $('#supportpanel').hide();
                $('#foutknop').show();
            });
        }
    }
};

