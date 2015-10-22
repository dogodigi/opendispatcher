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
/**
 * A collection of functions to manipulate the visual representation in the
 * application
 *
 * @module dbkjs
 * @class gui
 */
dbkjs.gui = {
  /**
   * Set the logo to be displayed in the application. Overrides the default logo
   * @method setLogo
   */
  setLogo: function() {
    if (dbkjs.options.organisation.logo) {
      $('#logo').css('background-image', 'url(' + dbkjs.options.organisation.logo + ')');
    }
  },

  /**
   * Create a button that gives users the possibility to refresh the map
   *
   * @method createRefreshButton
   */
  createRefreshButton: function(obj) {
    $('#btngrp_navigation').append(
      '<a id="btn_refresh" class="btn btn-default navbar-btn" href="#" title="' +
      i18n.t('app.refresh') + '"><i class="fa fa-refresh"></i></a>'
    );
    $('#btn_refresh').click(function() {
      if (dbkjs.viewmode !== 'fullscreen') {
        $('#btn_refresh > i').addClass('fa-spin');
      }
      obj.get();
    });
  },

  /**
   * Changes the dataset for the typeahead function and binds it
   * to an object
   *
   * @method updateSearchInput
   * @param obj {Object} Object to bind to
   * @param name {String}
   * @param dbk_naam_array {Array} array with searchable objects
   */
  updateSearchInput: function(obj, name, dbk_naam_array) {
    $('#search_input').typeahead('destroy');
    $('#search_input').val('');
    $('#search_input').typeahead({
      name: name,
      local: dbk_naam_array,
      limit: 10
    });
    $('#search_input').bind('typeahead:selected', function(obj, datum) {
      dbkjs.modules.feature.handleDbkOmsSearch(datum);
    });
  },

  /**
   * Update the title for the Information panel
   *
   * @method infoPanelUpdateTitle
   * @param text {String} Plain text or HTML formatted String
   */
  infoPanelUpdateTitle: function(text) {
    if (dbkjs.viewmode !== 'fullscreen') {
      dbkjs.util.changeDialogTitle(text);
    }
  },

  /**
   * Update the content for the Information panel
   *
   * @method infoPanelUpdateHtml
   * @param html {String} HTML formatted String
   */
  infoPanelUpdateHtml: function(html) {
    $('#infopanel_b').html(html);
  },

  /**
   * Update the footer for the Information panel
   *
   * @method infoPanelUpdateFooterHtml
   * @param html {String} HTML formatted String
   */
  infoPanelUpdateFooterHtml: function(html) {
    $('#infopanel_f').html(html);
  },

  /**
   * Add pagination to the Information panel
   *
   * @method infoPanelAddPagination
   */
  infoPanelAddPagination: function() {
    $('#infopanel_f').append('<ul id="Pagination" class="pagination"></ul>');
  },

  /**
   * Show the Information panel
   *
   * @method infoPanelShow
   */
  infoPanelShow: function() {
    $('#infopanel').show();
  },

  /**
   * Show the Information panel footer
   *
   * @method infoPanelShowFooter
   */
  infoPanelShowFooter: function() {
    $('#infopanel_f').show();
  },

  /**
   * Add DOM elements to the body of the
   * Information panel
   *
   * @method infoPanelAddItems
   * @param html {String} HTML formatted String
   */
  infoPanelAddItems: function(html) {
    $('#infopanel_b').append(html);
  },

  /**
   * Add a click Event to a DOM element
   *
   * @method infoPanelAddItemClickEvent
   * @param obj {Object} DOM element
   * @deprecated not used
   */
  infoPanelAddItemClickEvent: function(_obj) {

  },

  /**
   * Hide the Information panel
   *
   * @method infoPanelHide
   */
  infoPanelHide: function() {
    $('#infopanel').hide();
  },

  /**
   * Renders an error messag in the application
   * alert dialog
   *
   * @uses dbkjs.util.alert
   * @method showError
   * @param errMsg {String} Plain or HTML formatted String
   */
  showError: function(errMsg) {
    dbkjs.util.alert('Fout', ' ' + errMsg, 'alert-danger');
  },

  /**
   * Update the title for the Details panel
   *
   * @method detailsPanelUpdateTitle
   * @param text {String} Plain or HTML formatted String
   */
  detailsPanelUpdateTitle: function(text) {
    $('#vectorclickpanel_h').html('<span class="h4"><i class="fa fa-info-circle"></i>&nbsp;' + text + '</span>');
  },

  /**
   * Update the content for the Details panel
   *
   * @method detailsPanelUpdateHtml
   * @param html {String} HTML formatted String
   */
  detailsPanelUpdateHtml: function(html) {
    $('#vectorclickpanel_b').html(html);
  },

  /**
   * Show the Details panel
   *
   * @method detailsPanelShow
   */
  detailsPanelShow: function() {
    $('#vectorclickpanel').show();
  },

  /**
   * Hide the Details panel
   *
   * @method detailsPanelHide
   */
  detailsPanelHide: function() {
    $('#vectorclickpanel').hide();
  }
};
