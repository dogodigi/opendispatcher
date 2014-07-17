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
dbkjs.modules.filter = {
    id: "dbk.modules.filter",
    filter: {},
    selectie: [],
    activated: false,
    register: function(options) {
        var _obj = dbkjs.modules.filter;
        _obj.namespace = options.namespace || _obj.namespace;
        _obj.url = options.url || _obj.url;
        _obj.visibility = options.visible || _obj.visibility;
        $('#btngrp_3').append('<a id="btn_filter" class="btn btn-default navbar-btn" href="#" title="Filter activeren">' +
                '<i class="fa fa-filter"></i>' +
                '</a>');
        $('body').append(dbkjs.util.createModal('filter_dialog', '<i class="fa fa-filter"></i> Filter'));
        $('#btn_filter').click(function() {
            //zet alle dbk's uit en zoom naar de regio.
            dbkjs.modules.updateFilter(0);
            $.each(dbkjs.protocol.jsonDBK.layers, function(idx, lyr){
                lyr.destroyFeatures();
            });
            $('#zoom_extent').click();
            if(dbkjs.modules.search){
                //clear layers
                dbkjs.modules.search.layer.removeAllFeatures();
            }
            
            if(dbkjs.viewmode === 'fullscreen') {
                dbkjs.util.getModalPopup('infopanel').hide();
            } else {
                $('#infopanel').hide();
            }
            if(!_obj.activated){
                _obj.getOmsFilter();
                _obj.getRisicoKlasseFilter();
                _obj.getFunctieFilter();
                _obj.getGevaarlijkestoffenFilter();
                _obj.getInzetFilter();

            }
            _obj.activated = true;
            _obj.getFilter();
            $('#filter_dialog').modal('toggle');
        });

        var btn_filter_set = $('<button id="btn_filter_set" class="btn btn-block btn_5px" type="button">Activeren</button>');
        var btn_filter_reset = $('<button id="btn_filter_reset" class="btn btn-block btn_5px" type="button">Reset</button>');
        $('#filter_dialog_b').append(btn_filter_set);
        $('#filter_dialog_b').append(btn_filter_reset);
        $('#btn_filter_set').click(function() {
            _obj.getFilter();
            if(_obj.selectie.length > 0){
                $('#btn_filter').removeClass('btn-default');
                $('#btn_filter').addClass('btn-warning');
                $('#btn_filter').prop('title','Filter aanpassen');
            } else {
                $('#btn_filter').removeClass('btn-warning');
                $('#btn_filter').addClass('btn-default');
                $('#btn_filter').prop('title','Filter instellen');
            }
            $('#btn_refresh').click();
        });
        $('#btn_filter_reset').click(function() {
            _obj.selectie = [];
            $("#sel_oms").prop('selectedIndex',0);
            $("#sel_risk").prop('selectedIndex',0);
            $("#sel_func").prop('selectedIndex',0);
            $("#sel_gevstof").prop('selectedIndex',0);
            $("#sel_inzet").prop('selectedIndex',0);
            _obj.getFilter();
            $('#btn_filter').removeClass('btn-warning');
            $('#btn_filter').addClass('btn-default');
            $('#btn_filter').prop('title','Filter instellen');
            $('#btn_refresh').click();
        });
    },

    getFilter: function() {
        var _obj = dbkjs.modules.filter;
        var omsfilter = $("#sel_oms").val();
        var risicofilter = $("#sel_risk").val();
        var functiefilter = $("#sel_func").val();
        var gevstoffilter = $("#sel_gevstof").val();
        var inzetfilter = $("#sel_inzet").val();
        //console.log("omsfilter: " + omsfilter + " risicofilter: " + risicofilter + " functiefilter: " + functiefilter);
        _obj.selectie = [];
        $.each(dbkjs.modules.feature.features, function(fix, feat){
            var compliant = true;
            
            if(gevstoffilter === 'F' && feat.attributes.gevaarlijkestoffen === 0){
                compliant = false;
            } else if (gevstoffilter === 'T' && feat.attributes.gevaarlijkestoffen > 0){
                compliant = false;
            }
            if(inzetfilter === 'F' && !dbkjs.util.isJsonNull(feat.attributes.inzetprocedure)){
                compliant = false;
            } else if (inzetfilter === 'T' && dbkjs.util.isJsonNull(feat.attributes.inzetprocedure)){
                compliant = false;
            }
            if(omsfilter === 'F' && !dbkjs.util.isJsonNull(feat.attributes.OMSNummer)){
                compliant = false;
            } else if (omsfilter === 'T' && dbkjs.util.isJsonNull(feat.attributes.OMSNummer)){
                compliant = false;
            }
            if(!dbkjs.util.isJsonNull(risicofilter)){
                if (feat.attributes.risicoklasse !== risicofilter){
                    compliant = false;
                }
            }
            if(!dbkjs.util.isJsonNull(functiefilter)){
                if (feat.attributes.functie !== functiefilter){
                    compliant = false;
                }
            }
            if(compliant){
                _obj.selectie.push(feat.attributes.identificatie);
            }
        });
        var test = _obj.selectie.unique();
        _obj.selectie = test;
        $('#filter_dialog_f').html(_obj.selectie.length + ' objecten geselecteerd');
        return(_obj.selectie);
    },
    getInzetFilter: function() {
        var _obj = dbkjs.modules.filter;
        $('#filter_dialog_b').append('<label for="sel_inzet">Inzetprocedure:</label> ');
        _obj.sel_inzet = $('<select id="sel_inzet" size="3" class="form-control"><select>');
        _obj.sel_inzet.append('<option value="" selected>Niet filteren</option>');
        _obj.sel_inzet.append('<option value="F">Zonder inzetprocedure</option>');
        _obj.sel_inzet.append('<option value="T">Met inzetprocedure</option>');
        $('#filter_dialog_b').append(_obj.sel_inzet);
        $('#sel_inzet').change(function(){
            _obj.getFilter();
        });
    },
    getGevaarlijkestoffenFilter: function() {
        var _obj = dbkjs.modules.filter;
        $('#filter_dialog_b').append('<label for="sel_gevstof">Gevaarlijkestoffen:</label> ');
        _obj.sel_gevstof = $('<select id="sel_gevstof" size="3" class="form-control"><select>');
        _obj.sel_gevstof.append('<option value="" selected>Niet filteren</option>');
        _obj.sel_gevstof.append('<option value="F">Zonder gevaarlijke stoffen</option>');
        _obj.sel_gevstof.append('<option value="T">Met gevaarlijke stoffen</option>');
        $('#filter_dialog_b').append(_obj.sel_gevstof);
        $('#sel_gevstof').change(function(){
            _obj.getFilter();
        });
    },
    getOmsFilter: function() {
        var _obj = dbkjs.modules.filter;
        $('#filter_dialog_b').append('<label for="sel_oms">OMS:</label> ');
        _obj.sel_oms = $('<select id="sel_oms" size="3" class="form-control"><select>');
        _obj.sel_oms.append('<option value="" selected>Niet filteren</option>');
        _obj.sel_oms.append('<option value="F">Zonder oms</option>');
        _obj.sel_oms.append('<option value="T">Met oms</option>');
        $('#filter_dialog_b').append(_obj.sel_oms);
        $('#sel_oms').change(function(){
            _obj.getFilter();
        });
    },
    getRisicoKlasseFilter: function() {
        var _obj = dbkjs.modules.filter;
        var risicoklassen = [];
        $.each(dbkjs.modules.feature.features, function(fix, feat){
            if(!dbkjs.util.isJsonNull(feat.attributes.risicoklasse)){
                risicoklassen.push(feat.attributes.risicoklasse);
            }
        });
        var test = risicoklassen.unique();
        if(test.length > 0){
            $('#filter_dialog_b').append('<label for="sel_risico">Risicoklasse:</label> ');
            _obj.sel_risk = $('<select id="sel_risico" size="6" class="form-control"><select>');
            _obj.sel_risk.append('<option value="" selected>Niet filteren</option>');
            $.each(test, function(rix, risk){
                _obj.sel_risk.append('<option value="'+ risk +'">'+ risk +'</option>');
            });
        
            $('#filter_dialog_b').append(_obj.sel_risk);
            $('#sel_risk').change(function(){
                _obj.getFilter();
            });
        } else {
            $('#filter_dialog_b').append('<div>Er zijn geen risicoklassen ingevuld</div> ');
        }
    },
    getFunctieFilter: function() {
        var _obj = dbkjs.modules.filter;
        var functies = [];
        $.each(dbkjs.modules.feature.features, function(fix, feat){
            if(!dbkjs.util.isJsonNull(feat.attributes.functie)){
                functies.push(feat.attributes.functie);
            }
        });
        var test = functies.unique();
        if(test.length > 0){
            $('#filter_dialog_b').append('<label for="sel_func">Functies:</label> ');
            _obj.sel_func = $('<select id="sel_func" size="6" class="form-control"><select>');
            _obj.sel_func.append('<option value="" selected>Niet filteren</option>');
            $.each(test, function(rix, risk){
                _obj.sel_func.append('<option value="'+ risk +'">'+ risk +'</option>');
            });
        
            $('#filter_dialog_b').append(_obj.sel_func);
            $('#sel_func').change(function(){
                _obj.getFilter();
            });
        } else {
            $('#filter_dialog_b').append('<div>Er zijn geen functies ingevuld</div> ');
        }
    }
};
