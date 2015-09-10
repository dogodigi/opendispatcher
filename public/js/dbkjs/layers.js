/*!
 *  Copyright (c) 2015 Eddy Scheper (eddy.scheper@aris.nl)
 *
 *  This file is part of opendispatcher. safetymapDBK as a derived product
 *  complies to the same license.
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
 *  along with your copy of this software. If not, see <http://www.gnu.org/licenses/>.
 *
 */

var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.layers = {
    createBaseLayers: function () {
        var baselayer_ul = $('<ul id="baselayerpanel_ul" class="nav nav-pills nav-stacked">');
        $.each(dbkjs.options.baselayers, function (bl_index, bl) {
            var _li = $('<li class="bl" id="bl' + bl_index + '"><a href="#">' + bl.name + '</a></li>');
            baselayer_ul.append(_li);
            bl.events.register("loadstart", bl, function () {
                dbkjs.util.loadingStart(bl);
            });
            bl.events.register("loadend", bl, function () {
                dbkjs.util.loadingEnd(bl);
            });
            dbkjs.map.addLayer(bl);
            _li.on('click', function () {
                dbkjs.toggleBaseLayer(bl_index);
                if (dbkjs.viewmode === 'fullscreen') {
                    dbkjs.util.getModalPopup('baselayerpanel').hide();
                }
            });
        });
        $('#baselayerpanel_b').append(baselayer_ul);
        return baselayer_ul;
    }
};
