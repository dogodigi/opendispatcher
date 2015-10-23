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

/* global dbkjsbuildinfo, parseFloat */

var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
/**
 * @memberof dbkjs
 * @namespace
 */
dbkjs.layout = {
    id: 'dbk.layout',
    /**
     * Activate the layout
     */
    activate: function () {
        var _obj = dbkjs.layout;
        _obj.settingsDialog('#settingspanel_b');
    },
    /**
     * Create a dialog for settings
     * @param {Object} parent - DOM element to connect the dialog to
     */
    settingsDialog: function (parent) {
        $(parent).append('<h4>' + i18n.t('app.contrast') + '</h4><p>' + i18n.t('app.selectContrast') + '</p>');
        $(parent).append('<p><div class="row"><div class="col-xs-6">' +
                '<div class="input-group">' +
                '<input id="input_contrast" type="text" class="form-control">' +
                '</div></div>' +
                '<div class="col-xs-6"><span class="button-grp">' +
                '<button id="click_contrast_down" class="btn btn-default" type="button"><i class="fa fa-adjust"></i>&nbsp;<i class="fa fa-minus"></i></button>' +
                '<button id="click_contrast_up" class="btn btn-default" type="button"><i class="fa fa-plus">&nbsp;<i class="fa fa-adjust"></i></button>' +
                '</span></div></div></p>'
                );
        $(parent).append('<hr>');
        $(parent).append("<h4>" + i18n.t('app.layout') + "</h4>");
        $(parent).append('<p><div class="row"><div class="col-xs-12">' +
                '<label><input type="checkbox" id="checkbox_scaleStyle">' + i18n.t('app.scaleStyle') +
                '</label></div></div></p>' +
                '<p><hr/><div class="row"><div class="col-xs-12">' +
                '<p style="padding-bottom: 15px">' + i18n.t('app.styleSizeAdjust') + '</p>' +
                '<input id="slider_styleSizeAdjust" style="width: 210px" data-slider-id="styleSizeAdjustSlider" type="text" ' +
                ' data-slider-min="-4" data-slider-max="10" data-slider-step="1"/>' +
                '</div></div></p>'
                );

        $("#slider_styleSizeAdjust").slider({
            value: dbkjs.options.styleSizeAdjust,
            tooltip: "always"
        });
        $("#slider_styleSizeAdjust").on('slide', function (e) {
            dbkjs.options.styleSizeAdjust = e.value;
            dbkjs.redrawScaledLayers();
        });
        $("#slider_styleSizeAdjust").on('slideStop', function (e) {
            dbkjs.options.styleSizeAdjust = e.value;
            dbkjs.redrawScaledLayers();
        });
        $("#checkbox_scaleStyle").prop("checked", dbkjs.options.styleScaleAdjust);
        $("#checkbox_scaleStyle").on('change', function (e) {
            dbkjs.options.styleScaleAdjust = e.target.checked;
            dbkjs.redrawScaledLayers();
        });

        var _relversion = 'Development';
        var _relapp = 'Opendispatcher';
        var _reldate = 'N/A';
        var _relremarks = 'The app is running in development mode';

        if (window.dbkjsbuildinfo) {
            _relversion = dbkjsbuildinfo.VERSION || 'Development';
            _relapp = dbkjsbuildinfo.APPLICATION || 'Opendispatcher';
            _reldate = dbkjsbuildinfo.RELEASEDATE || 'N/A';
            _relremarks = dbkjsbuildinfo.REMARKS || 'The app is running in development mode';
        }
        $.getJSON(dbkjs.dataPath + 'bag/info').done(function(data) {
            if(data[0].bag_update){
                $(parent).append(
                '<p><hr/><strong>' + i18n.t('bag.updated') + '</strong> ' + data[0].bag_update + '</p>'
                );
            }
        });
        $.getJSON(dbkjs.dataPath + 'infra/info').done(function(data) {
            if(data[0].updated){
                $(parent).append(
                '<p><hr/><strong>' + i18n.t('infra.updated') + '</strong> ' + data[0].updated + '</p>'
                );
            } else {
                //remove infra search
                $( "#li_s_infra" ).remove();
            }
        }).fail(function(data){
            $( "#li_s_infra" ).remove();
        });

        $(parent).append(
                '<p><hr/><strong>' + _relapp + '</strong> ' + _relversion + ' (' + _reldate + ')' + '</p>' +
                '<p>' + _relremarks + '</p>'
                );

        $('#input_contrast').val(parseFloat(dbkjs.map.baseLayer.opacity).toFixed(1));
        $('#input_contrast').keypress(function (event) {
            if (event.keyCode === 13) {
                var newOpacity = parseFloat($('#input_contrast').val()).toFixed(1);
                if (newOpacity > 1.0) {
                    $('#input_contrast').val(1.0);
                    dbkjs.map.baseLayer.setOpacity(1.0);
                } else if (newOpacity > 1.0) {
                    $('#input_contrast').val(1.0);
                    dbkjs.map.baseLayer.setOpacity(1.0);
                } else {
                    $('#input_contrast').val(parseFloat($('#input_contrast').val()).toFixed(1));
                    dbkjs.map.baseLayer.setOpacity(newOpacity);
                }
            }
        });
        $('#click_contrast_up').click(function () {
            var newOpacity = parseFloat(($('#input_contrast').val()) + 0.1).toFixed(1);
            if (newOpacity > 1.0) {
                $('#input_contrast').val(1.0);
                dbkjs.map.baseLayer.setOpacity(1.0);
            } else {
                $('#input_contrast').val((parseFloat($('#input_contrast').val()) + 0.1).toFixed(1));
                dbkjs.map.baseLayer.setOpacity(newOpacity);
            }
        });
        $('#click_contrast_down').click(function () {
            var newOpacity = parseFloat(($('#input_contrast').val()) - 0.1).toFixed(1);
            if (newOpacity < 0.0) {
                $('#input_contrast').val(0.0);
                dbkjs.map.baseLayer.setOpacity(0.0);
            } else {
                $('#input_contrast').val((parseFloat($('#input_contrast').val()) - 0.1).toFixed(1));
                dbkjs.map.baseLayer.setOpacity(newOpacity);
            }
        });
    }
};
