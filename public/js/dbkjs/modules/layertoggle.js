/*!
 *  Copyright (c) 2014 B3Partners (info@b3partners.nl)
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

 // IE workaround from http://stackoverflow.com/questions/2790001/fixing-javascript-array-functions-in-internet-explorer-indexof-foreach-etc

 if (!('filter' in Array.prototype)) {
    Array.prototype.filter= function(filter, that /*opt*/) {
        var other= [], v;
        for (var i=0, n= this.length; i<n; i++)
            if (i in this && filter.call(that, v= this[i], i, this))
                other.push(v);
        return other;
    };
}

var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
dbkjs.modules.layertoggle = {
    id: "dbk.module.layertoggle",
    /**
     * Toggle layers based on type
     */
    availableToggles: {
        'toggleObject': {
            'label': 'Algemeen',
            'layers': [ ],
            'category': 'objectinformatie'
        },
        'togglePreventive': {
            'label': 'Preventie',
            'layers': [ 'Brandcompartiment' ],
            'category': 'preventief'
        },
        'togglePreparative': {
            'label': 'Preparatie',
            'layers': [  ],
            'category': 'preparatief'
        },
        'toggleDanger': {
            'label': 'Repressie',
            'layers': [ 'Gevaarlijke stoffen' ],
            'category': 'repressief'
        }
    },
    disabledLayers: [],
    enabled: false,
    register: function(options) {
        var _obj = dbkjs.modules.layertoggle;
        _obj.enabled = true;
        var buttonGroup = $('.layertoggle-btn-group');
        $.each(_obj.availableToggles, function(toggleKey, toggleOptions) {
            // Create a button for the required toggle and append the button to buttongroup
            var toggle = $('<a></a>')
                .attr({
                    'id': 'btn_' + toggleKey,
                    'class': 'btn btn-default navbar-btn active layer-toggle-btn ' + toggleKey,
                    'href': '#',
                    'title': i18n.t('toggle.' + toggleKey)
                })
                .append(toggleOptions.label)
                .click(function(e) {
                    e.preventDefault();
                    if (toggle.hasClass('active')) {
                        toggle.removeClass('active');
                        dbkjs.setDbkCategoryVisibility(toggleOptions.category, false);
                        _obj.disableLayers(toggleOptions.layers);
                    } else {
                        toggle.addClass('active');
                        dbkjs.setDbkCategoryVisibility(toggleOptions.category, true);
                        _obj.enableLayers(toggleOptions.layers);
                    }
                    dbkjs.protocol.jsonDBK.resetLayers();
                })
                .appendTo(buttonGroup);
            // Enable layers by default (by adding them all to enabledLayers)
            _obj.enableLayers(toggleOptions.layers);
        });
    },
    enableLayers: function(layers) {
        var _obj = dbkjs.modules.layertoggle;
        // Temp array
        var disabledLayers = [].concat(_obj.disabledLayers);
        // Filter layers
        _obj.disabledLayers = disabledLayers.filter(function(elem, pos) {
            return layers.indexOf(elem) === -1;
        });
    },
    disableLayers: function(layers) {
        var _obj = dbkjs.modules.layertoggle;
        // Add all layers
        var disabledLayers = _obj.disabledLayers.concat(layers);
        // Remove duplicates
        _obj.disabledLayers = disabledLayers.filter(function(elem, pos) {
            return disabledLayers.indexOf(elem) === pos;
        });
    },
    isLayerEnabled: function(layerName) {
        var _obj = dbkjs.modules.layertoggle;
        if(!_obj.enabled) {
            // When not used, always return true
            return true;
        }
        return _obj.disabledLayers.indexOf(layerName) === -1;
    }
};
