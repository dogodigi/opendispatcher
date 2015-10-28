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

var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;

/**
 * @class Module
 * @memberof dbkjs
 * @extends dbkjs.Class
 */
dbkjs.Module = dbkjs.Class({
  /**
   * Unique identifier for a module
   * @memberof dbkjs.Module
   * @property id
   * @type {String}
   */
  id: null,
  /**
   * Unique identifier for a module
   * @memberof dbkjs.Module
   * @property namespace
   * @type {String}
   */
  namespace: null,
  /**
   * @memberof dbkjs.Module
   * @property layer
   * @type OpenLayers.Layer
   */
  layer: null,
  /**
   * @memberof dbkjs.Module
   * @method
   */
  register: function(options) {

  }
});
