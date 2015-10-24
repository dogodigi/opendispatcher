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
dbkjs.modules = dbkjs.modules || {};
/**
 * @memberof dbkjs.modules
 * @exports filter
 * @todo Complete documentation.
 */
dbkjs.modules.filter = {
  /**
   *
   */
  id: "dbk.modules.filter",
  /**
   * @type {Object}
   */
  filter: {},
  /**
   * @type {Array}
   */
  selectie: [],
  /**
   * @type {Boolean}
   */
  activated: false,
  /**
   * @param {Object} options
   */
  register: function(options) {
    var _obj = dbkjs.modules.filter;
    _obj.namespace = options.namespace || _obj.namespace;
    _obj.url = options.url || _obj.url;
    _obj.visibility = options.visible || _obj.visibility;
    $('#btngrp_3').append('<a id="btn_filter" class="btn btn-default navbar-btn" href="#" title="' + i18n.t('filter.button') + '">' +
      '<i class="fa fa-filter"></i>' +
      '</a>');
    $('body').append(dbkjs.util.createModal('filter_dialog', '<i class="fa fa-filter"></i> ' + i18n.t('filter.filter')));
    $('#btn_filter').click(function() {
      //zet alle dbk's uit en zoom naar de regio.
      dbkjs.modules.updateFilter(0);
      $.each(dbkjs.protocol.jsonDBK.layers, function(idx, lyr) {
        lyr.destroyFeatures();
      });
      $('#zoom_extent').click();
      if (dbkjs.modules.search) {
        //clear layers
        dbkjs.modules.search.layer.removeAllFeatures();
      }

      if (dbkjs.viewmode === 'fullscreen') {
        dbkjs.util.getModalPopup('infopanel').hide();
      } else {
        $('#infopanel').hide();
      }
      if (!_obj.activated) {
        $('#filter_dialog_b').html('');
        $('#filter_dialog_b').append('<div id="filter_dialog_form" class="form-horizontal"></div>');
        _obj.getOmsFilter();
        _obj.getBhvFilter();
        _obj.getGevaarlijkestoffenFilter();
        _obj.getFlooringFilter();
        _obj.getInzetFilter();
        _obj.getConstructionFilter();
        _obj.getFunctieFilter();
        _obj.getGuidanceFilter();
        _obj.getRisicoKlasseFilter();
        var btn_filter_set = $('<div class="col-sm-12"><button id="btn_filter_set" class="btn btn-primary btn_5px btn-block" type="button">' + i18n.t('filter.activate') + '</button></div>');
        var btn_filter_reset = $('<div class="col-sm-12"><button id="btn_filter_reset" class="btn btn-default btn_5px btn-block" type="button">' + i18n.t('filter.reset') + '</button></div>');
        $('#filter_dialog_form').append(btn_filter_set);
        $('#filter_dialog_form').append(btn_filter_reset);
        $('#btn_filter_set').click(function() {
          _obj.getFilter();
          if (_obj.selectie.length > 0) {
            $('#btn_filter').removeClass('btn-default');
            $('#btn_filter').addClass('btn-warning');
            $('#btn_filter').prop('title', i18n.t('filter.adjust'));
          } else {
            $('#btn_filter').removeClass('btn-warning');
            $('#btn_filter').addClass('btn-default');
            $('#btn_filter').prop('title', i18n.t('filter.set'));
          }
          $('#btn_refresh').click();
        });
        $('#btn_filter_reset').click(function() {
          _obj.selectie = [];
          $("#sel_oms").prop('selectedIndex', 0);
          $("#sel_risk").prop('selectedIndex', 0);
          $("#sel_func").val([]);
          $("#sel_gevstof").prop('selectedIndex', 0);
          $("#sel_inzet").prop('selectedIndex', 0);
          $("#sel_construction").val([]);
          $("#sel_floor").prop('selectedIndex', 0);
          $("#sel_bhv").prop('selectedIndex', 0);
          $("#sel_guid").val([]);
          _obj.getFilter();
          $('#btn_filter').removeClass('btn-warning');
          $('#btn_filter').addClass('btn-default');
          $('#btn_filter').prop('title', i18n.t('filter.set'));
          $('#btn_refresh').click();
        });
      }
      _obj.activated = true;
      _obj.getFilter();
      $('#filter_dialog').modal('toggle');
    });
  },
  /**
   *
   */
  getFilter: function() {
    var _obj = dbkjs.modules.filter;
    var omsfilter = $("#sel_oms").val();
    var bhvfilter = $("#sel_bhv").val();
    var floorfilter = $("#sel_floor").val();
    var guidancefilter = $("#sel_guid").val() || [];
    var risicofilter = $("#sel_risk").val();
    var functiefilter = $("#sel_func").val();
    var gevstoffilter = $("#sel_gevstof").val();
    var inzetfilter = $("#sel_inzet").val();
    var constructionfilter = $("#sel_construction").val();
    _obj.selectie = [];
    $.each(dbkjs.modules.feature.features, function(fix, feat) {
      var compliant = true;
      if (floorfilter === 'above' && feat.attributes.flooring !== "above") {
        compliant = false;
      } else if (floorfilter === 'below' && feat.attributes.flooring !== "below") {
        compliant = false;
      } else if (floorfilter === 'both' && feat.attributes.flooring !== "both") {
        compliant = false;
      } else if (floorfilter === 'none' && (feat.attributes.flooring)) {
        compliant = false;
      }
      if (gevstoffilter === 'F' && feat.attributes.gevaarlijkestoffen !== 0) {
        compliant = false;
      } else if (gevstoffilter === 'T' && feat.attributes.gevaarlijkestoffen === 0) {
        compliant = false;
      }
      if (bhvfilter === 'F' && !dbkjs.util.isJsonNull(feat.attributes.BHVaanwezig)) {
        compliant = false;
      } else if (bhvfilter === 'T' && dbkjs.util.isJsonNull(feat.attributes.BHVaanwezig)) {
        compliant = false;
      }
      if (inzetfilter === 'F' && !dbkjs.util.isJsonNull(feat.attributes.inzetprocedure)) {
        compliant = false;
      } else if (inzetfilter === 'T' && dbkjs.util.isJsonNull(feat.attributes.inzetprocedure)) {
        compliant = false;
      }
      if (omsfilter === 'F' && !dbkjs.util.isJsonNull(feat.attributes.OMSNummer)) {
        compliant = false;
      } else if (omsfilter === 'T' && dbkjs.util.isJsonNull(feat.attributes.OMSNummer)) {
        compliant = false;
      }
      if (!dbkjs.util.isJsonNull(risicofilter)) {
        if (feat.attributes.risicoklasse !== risicofilter) {
          compliant = false;
        }
      }
      if (guidancefilter.length !== 0) {
        var testguidance = feat.attributes.guidance || [];
        if (_obj.diff(guidancefilter, testguidance).length !== guidancefilter.length) {
          compliant = false;
        }
      }

      if (!dbkjs.util.isJsonNull(constructionfilter) && !dbkjs.util.isJsonNull(feat.attributes.construction)) {
        if ($.inArray(feat.attributes.construction.toLowerCase(), constructionfilter) === -1) {
          compliant = false;
        }
      } else if (!dbkjs.util.isJsonNull(constructionfilter) && dbkjs.util.isJsonNull(feat.attributes.construction)) {
        compliant = false;
      }
      if (!dbkjs.util.isJsonNull(functiefilter) && !dbkjs.util.isJsonNull(feat.attributes.functie)) {
        if ($.inArray(feat.attributes.functie.toLowerCase(), functiefilter) === -1) {
          compliant = false;
        }
      } else if (!dbkjs.util.isJsonNull(functiefilter) && dbkjs.util.isJsonNull(feat.attributes.functie)) {
        compliant = false;
      }

      if (compliant) {
        _obj.selectie.push(feat.attributes.identificatie);
      }
    });
    var test = _obj.selectie.unique();
    _obj.selectie = test;
    $('#filter_dialog_f').html(_obj.selectie.length + ' ' + i18n.t('filter.selected'));
    return (_obj.selectie);
  },
  /**
   *
   */
  getInzetFilter: function() {
    var _obj = dbkjs.modules.filter;
    var formgroup = $('<div class="form-group">');
    formgroup.append('<label class="col-sm-4 control-label" for="sel_inzet">' + i18n.t('filter.procedure') + '</label> ');
    _obj.sel_inzet = $('<select id="sel_inzet" class="form-control"><select>');
    _obj.sel_inzet.append('<option value="" selected>' + i18n.t('filter.nofilter') + '</option>');
    _obj.sel_inzet.append('<option value="F">' + i18n.t('filter.without') + ' ' + i18n.t('filter.procedure').toLowerCase() + '</option>');
    _obj.sel_inzet.append('<option value="T">' + i18n.t('filter.with') + ' ' + i18n.t('filter.procedure').toLowerCase() + '</option>');
    formgroup.append($('<div class="col-sm-8"></div>').append(_obj.sel_inzet));
    $('#filter_dialog_form').append(formgroup);
    $('#sel_inzet').change(function() {
      _obj.getFilter();
    });
  },
  /**
   *
   */
  getGevaarlijkestoffenFilter: function() {
    var _obj = dbkjs.modules.filter;
    var formgroup = $('<div class="form-group">');
    formgroup.append('<label class="col-sm-4 control-label" for="sel_gevstof">' + i18n.t('filter.hazard') + '</label> ');
    _obj.sel_gevstof = $('<select id="sel_gevstof" class="form-control"><select>');
    _obj.sel_gevstof.append('<option value="" selected>' + i18n.t('filter.nofilter') + '</option>');
    _obj.sel_gevstof.append('<option value="F">' + i18n.t('filter.without') + ' ' + i18n.t('filter.hazard').toLowerCase() + '</option>');
    _obj.sel_gevstof.append('<option value="T">' + i18n.t('filter.with') + ' ' + i18n.t('filter.hazard').toLowerCase() + '</option>');
    formgroup.append($('<div class="col-sm-8"></div>').append(_obj.sel_gevstof));
    $('#filter_dialog_form').append(formgroup);
    $('#sel_gevstof').change(function() {
      _obj.getFilter();
    });
  },
  /**
   *
   */
  getBhvFilter: function() {
    var _obj = dbkjs.modules.filter;
    var formgroup = $('<div class="form-group">');
    formgroup.append('<label class="col-sm-4 control-label" for="sel_bhv">' + i18n.t('filter.bhv') + '</label> ');
    _obj.sel_bhv = $('<select id="sel_bhv" class="form-control"><select>');
    _obj.sel_bhv.append('<option value="" selected>' + i18n.t('filter.nofilter') + '</option>');
    _obj.sel_bhv.append('<option value="F">' + i18n.t('filter.without') + ' ' + i18n.t('filter.bhv').toLowerCase() + '</option>');
    _obj.sel_bhv.append('<option value="T">' + i18n.t('filter.with') + ' ' + i18n.t('filter.bhv').toLowerCase() + '</option>');
    formgroup.append($('<div class="col-sm-8"></div>').append(_obj.sel_bhv));
    $('#filter_dialog_form').append(formgroup);
    $('#sel_bhv').change(function() {
      _obj.getFilter();
    });
  },
  /**
   *
   */
  getFlooringFilter: function() {
    var _obj = dbkjs.modules.filter;
    var formgroup = $('<div class="form-group">');
    formgroup.append('<label class="col-sm-4 control-label" for="sel_floor">' + i18n.t('filter.flooring') + '</label> ');
    _obj.sel_floor = $('<select id="sel_floor" class="form-control"><select>');
    _obj.sel_floor.append('<option value="" selected>' + i18n.t('filter.nofilter') + '</option>');
    _obj.sel_floor.append('<option value="above">' + i18n.t('filter.above').toLowerCase() + '</option>');
    _obj.sel_floor.append('<option value="below">' + i18n.t('filter.below').toLowerCase() + '</option>');
    _obj.sel_floor.append('<option value="both">' + i18n.t('filter.both').toLowerCase() + '</option>');
    _obj.sel_floor.append('<option value="none">' + i18n.t('filter.notset') + '</option>');
    formgroup.append($('<div class="col-sm-8"></div>').append(_obj.sel_floor));
    $('#filter_dialog_form').append(formgroup);
    $('#sel_floor').change(function() {
      _obj.getFilter();
    });
  },
  /**
   *
   */
  getOmsFilter: function() {
    var _obj = dbkjs.modules.filter;
    var formgroup = $('<div class="form-group">');
    formgroup.append('<label class="col-sm-4 control-label" for="sel_oms">' + i18n.t('filter.oms') + '</label> ');
    _obj.sel_oms = $('<select id="sel_oms" class="form-control"><select>');
    _obj.sel_oms.append('<option value="" selected>' + i18n.t('filter.nofilter') + '</option>');
    _obj.sel_oms.append('<option value="F">' + i18n.t('filter.without') + ' ' + i18n.t('filter.oms').toLowerCase() + '</option>');
    _obj.sel_oms.append('<option value="T">' + i18n.t('filter.with') + ' ' + i18n.t('filter.oms').toLowerCase() + '</option>');
    formgroup.append($('<div class="col-sm-8"></div>').append(_obj.sel_oms));
    $('#filter_dialog_form').append(formgroup);
    $('#sel_oms').change(function() {
      _obj.getFilter();
    });
  },
  /**
   *
   */
  getRisicoKlasseFilter: function() {
    var _obj = dbkjs.modules.filter;
    var formgroup = $('<div class="form-group">');
    var risicoklassen = [];
    $.each(dbkjs.modules.feature.features, function(fix, feat) {
      if (!dbkjs.util.isJsonNull(feat.attributes.risicoklasse)) {
        risicoklassen.push(feat.attributes.risicoklasse);
      }
    });
    var test = risicoklassen.unique();
    if (test.length > 0) {
      formgroup.append('<label class="col-sm-4 control-label" for="sel_risk">' + i18n.t('filter.risk') + '</label> ');
      _obj.sel_risk = $('<select id="sel_risk" size="4" class="form-control"><select>');
      _obj.sel_risk.append('<option value="" selected>' + i18n.t('filter.nofilter') + '</option>');
      $.each(test, function(rix, risk) {
        _obj.sel_risk.append('<option value="' + risk + '">' + risk + '</option>');
      });

      formgroup.append($('<div class="col-sm-8"></div>').append(_obj.sel_risk));
      $('#filter_dialog_form').append(formgroup);
      $('#sel_risk').change(function() {
        _obj.getFilter();
      });
    } else {
      $('#filter_dialog_form').append('<div class="form-group from-group-sm"><div class="col-sm-4"></div><div class="col-sm-8">' + i18n.t('filter.norisk') + '</div></div> ');
    }
  },
  /**
   *
   */
  getGuidanceFilter: function() {
    var _obj = dbkjs.modules.filter;
    var formgroup = $('<div class="form-group">');
    var guidance = [];
    $.each(dbkjs.modules.feature.features, function(fix, feat) {
      if ($.isArray(feat.attributes.guidance)) {
        guidance = guidance.concat(feat.attributes.guidance);
      }
    });
    var test = guidance.unique();
    test.sort();
    if (test.length > 0) {
      formgroup.append('<label class="col-sm-4 control-label" for="sel_guid">' + i18n.t('filter.guidance') + '</label> ');
      _obj.sel_guid = $('<select id="sel_guid" size="4" class="form-control" MULTIPLE><select>');
      $.each(test, function(rix, guid) {
        _obj.sel_guid.append('<option value="' + guid + '">' + guid + '</option>');
      });

      formgroup.append($('<div class="col-sm-8"></div>').append(_obj.sel_guid));
      $('#filter_dialog_form').append(formgroup);
      $('#sel_guid').change(function() {
        _obj.getFilter();
      });
    } else {
      $('#filter_dialog_form').append('<div class="form-group from-group-sm"><div class="col-sm-4"></div><div class="col-sm-8">' + i18n.t('filter.noguidance') + '</div></div>');
    }
  },
  /**
   *
   */
  getFunctieFilter: function() {
    var _obj = dbkjs.modules.filter;
    var formgroup = $('<div class="form-group">');
    var functies = [];
    $.each(dbkjs.modules.feature.features, function(fix, feat) {
      if (!dbkjs.util.isJsonNull(feat.attributes.functie)) {
        functies.push(feat.attributes.functie.toLowerCase());
      }
    });
    var test = functies.unique();
    test.sort();
    if (test.length > 0) {
      formgroup.append('<label class="col-sm-4 control-label" for="sel_func">' + i18n.t('filter.functions') + '</label> ');
      _obj.sel_func = $('<select id="sel_func" size="4" class="form-control" MULTIPLE><select>');
      $.each(test, function(rix, functie) {
        _obj.sel_func.append('<option value="' + functie + '">' + functie + '</option>');
      });
      formgroup.append($('<div class="col-sm-8"></div>').append(_obj.sel_func));
      $('#filter_dialog_form').append(formgroup);
      $('#sel_func').change(function() {
        _obj.getFilter();
      });
    } else {
      $('#filter_dialog_form').append('<div class="form-group from-group-sm"><div class="col-sm-4"></div><div class="col-sm-8">' + i18n.t('filter.functions') + '</div></div>');
    }
  },
  /**
   *
   */
  getConstructionFilter: function() {
    var _obj = dbkjs.modules.filter;
    var formgroup = $('<div class="form-group">');
    var constructions = [];
    $.each(dbkjs.modules.feature.features, function(fix, feat) {
      if (!dbkjs.util.isJsonNull(feat.attributes.construction)) {
        constructions.push(feat.attributes.construction.toLowerCase());
      }
    });
    var test = constructions.unique();
    test.sort();
    if (test.length > 0) {
      formgroup.append('<label class="col-sm-4 control-label" for="sel_construction">' + i18n.t('filter.construction') + '</label> ');
      _obj.sel_construction = $('<select id="sel_construction" size="4" class="form-control" MULTIPLE><select>');
      //_obj.sel_func.append('<option value="" selected>' + i18n.t('filter.nofilter') + '</option>');
      $.each(test, function(rix, functie) {
        _obj.sel_construction.append('<option value="' + functie + '">' + functie + '</option>');
      });
      formgroup.append($('<div class="col-sm-8"></div>').append(_obj.sel_construction));
      $('#filter_dialog_form').append(formgroup);
      $('#sel_construction').change(function() {
        _obj.getFilter();
      });
    } else {
      $('#filter_dialog_form').append('<div class="form-group from-group-sm"><div class="col-sm-4"></div><div class="col-sm-8">' + i18n.t('filter.noconstructions') + '</div></div>');
    }
  },
  /**
   * @param {Array} source
   * @param {String} target
   * @return {Array} differences
   */
  diff: function(source, target) {
    var difference = [];
    for (var hint in source) {
      if ($.inArray(source[hint], target) !== -1) {
        difference.push(source[hint]);
      }
    }
    return difference;
  }
};
