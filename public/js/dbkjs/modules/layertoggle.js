/*!
 *  Copyright (c) 2014 Matthijs Laan (matthijslaan@b3partners.nl)
 *
 *  This file is part of opendispatcher/safetymapDBK
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

/**
 * IE workaround
 *
 * see <http://stackoverflow.com/questions/2790001/fixing-javascript-array-functions-in-internet-explorer-indexof-foreach-etc>
 */
if (!('filter' in Array.prototype)) {
  Array.prototype.filter = function(filter, that /*opt*/ ) {
    var other = [],
      v;
    for (var i = 0, n = this.length; i < n; i++)
      if (i in this && filter.call(that, v = this[i], i, this))
        other.push(v);
    return other;
  };
}

var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
/**
 * @memberof dbkjs.modules
 * @exports layertoggle
 * @todo Complete documentation.
 */
dbkjs.modules.layertoggle = {
  /**
   * @constant
   * @type dbkjs.Module.id
   * @default
   */
  id: "dbk.module.layertoggle",
  /**
   * Default layer toggle buttons toggle based on brandweervoorziening
   * category. Override in dbkjs.options.layertoggle.buttons, see comments for
   * toggle button options.
   */
  buttons: [{
    id: 'object',
    // Button label, can be null
    label: i18n.t('layertoggle.general'),
    // Button image if label is null
    img: null,
    // Font-awesome icon if label and img are null
    icon: null,
    
    // CSS applied to button
    css: {
      'background-color': 'green'
    },
    
    // Default button state
    active: true,
    
    // Names of layers to hide when button inactive
    layers: [], 

    // Function called when button is inactive, returns true if a feature should be hidden
    // Default: hide brandweervoorziening when category is 'objectinformatie'
    hideFeature: function(layer, feature) {
      return layer.name === "Brandweervoorzienining" && feature.attributes.category === 'objectinformatie';
    }
  },{
    id: 'prevent',
    label: i18n.t('layertoggle.prevent'),
    css: {
      'background-color': '#ffff4f'
    },
    active: true,
    layers: ['Brandcompartiment'],
    hideFeature: function(layer, feature) {
      return layer.name === "Brandweervoorziening" && feature.attributes.category === 'preventief';
    }    
  },{
    id: 'prepare',
    label: i18n.t('layertoggle.prepare'),
    css: {
      'background-color': '#0e90d2'
    },
    active: true,
    layers: [],
    hideFeature: function(layer, feature) {
      return layer.name === "Brandweervoorziening" && feature.attributes.category === 'preparatief';
    }    
  },{
    id: 'repress',
    label: i18n.t('layertoggle.repress'),
    css: {
      'background-color': '#0e90d2'
    },
    active: true,
    layers: ['Gevaarlijke stoffen'],
    hideFeature: function(layer, feature) {
      return layer.name === "Brandweervoorziening" && feature.attributes.category === 'repressief';
    }    
  }],
  availableToggles: {
    'toggleObject': {
      'label': 'Algemeen',
      'layers': [],
      'category': 'objectinformatie'
    },
    'togglePreventive': {
      'label': 'Preventie',
      'layers': ['Brandcompartiment'],
      'category': 'preventief'
    },
    'togglePreparative': {
      'label': 'Preparatie',
      'layers': [],
      'category': 'preparatief'
    },
    'toggleDanger': {
      'label': 'Repressie',
      'layers': ['Gevaarlijke stoffen'],
      'category': 'repressief'
    }
  },
  /**
   * Collection of disabled layers
   * @type {Array}
   */
  disabledLayers: [],
  /**
   *
   */
  enabled: false,
  /**
   *
   */
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
  /**
   * @param {Array} layers - Array of OpenLayers.Layer
   */
  enableLayers: function(layers) {
    var _obj = dbkjs.modules.layertoggle;
    // Temp array
    var disabledLayers = [].concat(_obj.disabledLayers);
    // Filter layers
    _obj.disabledLayers = disabledLayers.filter(function(elem, pos) {
      return layers.indexOf(elem) === -1;
    });
  },
  /**
   * @param {Array} layers - Array of OpenLayers.Layer
   */
  disableLayers: function(layers) {
    var _obj = dbkjs.modules.layertoggle;
    // Add all layers
    var disabledLayers = _obj.disabledLayers.concat(layers);
    // Remove duplicates
    _obj.disabledLayers = disabledLayers.filter(function(elem, pos) {
      return disabledLayers.indexOf(elem) === pos;
    });
  },
  /**
   * Check to see if a layer is enabled by parsing the name
   * @param {String} layerName - Name
   * @return {Boolean} enabled - true or false
   */
  isLayerEnabled: function(layerName) {
    var _obj = dbkjs.modules.layertoggle;
    if (!_obj.enabled) {
      // When not used, always return true
      return true;
    }
    return _obj.disabledLayers.indexOf(layerName) === -1;
  }
};
