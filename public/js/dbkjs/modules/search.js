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

/* global OpenLayers, i18n */

var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
dbkjs.modules.updateFilter = function (id) {
    //Is er een DBK geselecteerd of is de id leeg?
    $.each(dbkjs.modules, function (mod_index, module) {
        if ($.inArray(mod_index, dbkjs.options.organisation.modules) > -1) {
            if (module.updateFilter) {
                module.updateFilter(id);
            }
        }
    });
};
dbkjs.modules.search = {
    id: "dbk.modules.search",
    style: {
        strokeColor: '#CCCC00',
        fillColor: '#ffffff',
        strokeWidth: 0,
        fillOpacity: 0.1
    },
    layer: null,
    searchPopup: null,
    viewmode: 'default',
    register: function (options) {
        if (options && options.viewmode) {
            this.viewmode = options.viewmode;
        }
        if (this.viewmode === 'fullscreen') {
            this.fullscreenLayout();
        } else {
            this.inlineLayout();
        }
        this.layer = new OpenLayers.Layer.Vector('search');
        dbkjs.map.addLayer(this.layer);
    },
    inlineLayout: function () {
        var search_div = $('#btn-grp-search');
        var search_group = $('<div></div>').addClass('input-group navbar-btn');
        var search_pre = $('<span id="search-add-on" class="input-group-addon"><i class="fa fa-building"></i></span>');
        var search_input = $('<input id="search_input" name="search_input" type="text" class="form-control" placeholder="' + i18n.t("search.dbkplaceholder") + '">');
        var search_btn_grp = $(
            '<div class="input-group-btn">' +
                '<button type="button" class="btn btn-default dropdown-toggle needsclick" data-toggle="dropdown">' + i18n.t("search.search") + ' <span class="caret"></span></button>' +
                '<ul class="dropdown-menu pull-right" id="search_dropdown">' +
                '<li><a href="#" id="s_dbk"><i class="fa fa-building"></i> ' + i18n.t("search.dbk") + '</a></li>' +
                '<li><a href="#" id="s_oms"><i class="fa fa-bell"></i> ' + i18n.t("search.oms") + '</a></li>' +
                '<li><a href="#" id="s_adres"><i class="fa fa-home"></i> ' + i18n.t("search.address") + '</a></li>' +
                '<li><a href="#" id="s_coord"><i class="fa fa-thumb-tack"></i> ' + i18n.t("search.coordinates") + '</a></li>' +
                '</ul>' +
                '</div>'
        );
        search_group.append(search_pre);
        search_group.append(search_input);
        search_group.append(search_btn_grp);
        search_div.append(search_group);
        search_div.show();
        // If function is enabled, add ability to search infrastructure point objects
        $('#search_dropdown').append('<li id="li_s_infra"><a href="#" id="s_infra"><i class="fa fa-car"></i> ' + i18n.t("search.infrastructure") + '</a></li>');
        this.activate();
    },
    fullscreenLayout: function() {
        var _obj = dbkjs.modules.search;
        $('<a></a>')
            .attr({
                'id': 'btn_opensearch',
                'class': 'btn btn-default navbar-btn',
                'href': '#',
                'title': i18n.t('map.search.search')
            })
            .append('<i class="fa fa-search"></i>')
            .click(function(e) {
                e.preventDefault();
                _obj.showSearchPopup();
            })
            .appendTo('#btngrp_3');
    },
    showSearchPopup: function() {
        var _obj = dbkjs.modules.search;
        if(_obj.searchPopup === null) {
            _obj.initSearchPopup();
        }
        _obj.searchPopup.show();
        $('#search_input').focus();
    },
    initSearchPopup: function() {
        var _obj = dbkjs.modules.search;
        _obj.searchPopup = dbkjs.util.createModalPopup({
            title: 'Zoeken'
        });
        _obj.searchPopup.getView().append(_obj.createSearchGroup());
        _obj.searchPopup.getView().append('<div class="row"><div class="col-lg-12 search_result"></div></div>');
        _obj.activateFullscreen();
    },
    createSearchGroup: function() {
        var search_group = $('<div></div>').addClass('input-group input-group-lg');
        var search_input = $('<input id="search_input" name="search_input" type="text" class="form-control" placeholder="' + i18n.t("search.dbkplaceholder") + '">');
        var search_btn_grp = $(
            '<span class="btn-group input-group-btn">' +
                '<a class="btn btn-default dropdown-toggle" data-toggle="dropdown"><i class="fa fa-building"></i> <span class="dropdown-text">' + i18n.t("search.dbk") + '</span> <span class="caret"></span></a>' +
                '<ul class="dropdown-menu pull-right" id="search_dropdown" role="menu">' +
                    '<li><a href="#" id="s_dbk"><i class="fa fa-building"></i> ' + i18n.t("search.dbk") + '</a></li>' +
                    '<li><a href="#" id="s_oms"><i class="fa fa-bell"></i> ' + i18n.t("search.oms") + '</a></li>' +
                    '<li><a href="#" id="s_adres"><i class="fa fa-home"></i> ' + i18n.t("search.address") + '</a></li>' +
                    '<li><a href="#" id="s_coord"><i class="fa fa-thumb-tack"></i> ' + i18n.t("search.coordinates") + '</a></li>' +
                '</ul>' +
            '</span>'
        );
        search_group.append(search_input);
        search_group.append(search_btn_grp);
        // If function is enabled, add ability to search infrastructure point objects
        $('#search_dropdown').append('<li id="li_s_infra"><a href="#" id="s_infra"><i class="fa fa-car"></i> ' + i18n.t("search.infrastructure") + '</a></li>');
        return $('<div class="row"></div>').append($('<div class="col-lg-12"></div>').append(search_group));
    },
    zoomAndPulse: function(lonlat){
        var _obj = dbkjs.modules.search;
        _obj.layer.removeAllFeatures();
        var point = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
        var circle = new OpenLayers.Feature.Vector(
            OpenLayers.Geometry.Polygon.createRegularPolygon(
                point,
                100,
                40,
                0
            ),
            {},
            _obj.style
        );
        _obj.layer.addFeatures([
            new OpenLayers.Feature.Vector(
                point,
                {},
                {
                    graphicName: 'circle',
                    fillColor: '#BE81F7',
                    strokeColor: '#BE81F7',
                    strokeWidth: 3,
                    fillOpacity: 0.9,
                    pointRadius: 10
                }
            ),
            circle
        ]);
        dbkjs.map.zoomToExtent(_obj.layer.getDataExtent());
        _obj.pulsate(circle);
        if(_obj.viewmode === 'fullscreen' && _obj.searchPopup) {
            _obj.searchPopup.hide();
        }
    },
    pulsate: function(feature) {
        var _obj = dbkjs.modules.search;
        var point = feature.geometry.getCentroid(),
            bounds = feature.geometry.getBounds(),
            radius = Math.abs((bounds.right - bounds.left)/2),
            count = 0,
            grow = 'up';

        var resize = function(){
            if (count>16) {
                clearInterval(window.resizeInterval);
                _obj.layer.removeFeatures(feature,{silent: true});
                _obj.layer.destroyFeatures();
            } else {
                var interval = radius * 0.03;
                var ratio = interval/radius;
                switch(count) {
                    case 4:
                    case 12:
                        grow = 'down'; break;
                    case 8:
                        grow = 'up'; break;
                }
                if (grow!=='up') {
                    ratio = - Math.abs(ratio);
                }
                if(count>16){
                    _obj.layer.removeFeatures(feature,{silent: true});
                    _obj.layer.destroyFeatures();
                } else {
                    feature.geometry.resize(1+ratio, point);
                    _obj.layer.drawFeature(feature);
                    count++;
                }
            }
        };
        window.resizeInterval = window.setInterval(resize, 50, point, radius);
    },
    activateFullscreen: function() {
        var _obj = dbkjs.modules.search,
            searchField = $('#search_input'),
            currentSearch = 'dbk',
            dropdownConfig = {
                's_adres': { 'icon': 'fa fa-home', 'text': i18n.t("search.address"), 'placeholder': i18n.t("search.addressplaceholder"), 'search': 'address' },
                's_coord': { 'icon': 'fa fa-thumb-tack', 'text': i18n.t("search.coordinates"), 'placeholder': i18n.t("search.coordplaceholder"), 'search': 'coordinates' },
                's_dbk': { 'icon': 'fa fa-building', 'text': i18n.t("search.dbk"), 'placeholder': i18n.t("search.dbkplaceholder"), 'search': 'dbk' },
                's_oms': { 'icon': 'fa fa-bell', 'text': i18n.t("search.oms"), 'placeholder': i18n.t("search.omsplaceholder"), 'search': 'oms' }
            };

        searchField.on('keyup', function(e) {
            var searchText = searchField.val();
            if(searchText.length === 0) {
                $('.search_result').html('');
                return;
            }
            if(currentSearch === 'dbk') {
                _obj.searchDbkOms(dbkjs.modules.feature.getDbkSearchValues(), searchText);
            }
            if(currentSearch === 'oms') {
                _obj.searchDbkOms(dbkjs.modules.feature.getOmsSearchValues(), searchText);
            }
            if(currentSearch === 'coordinates') {
                var loc = _obj.handleCoordinatesSearch();
                if(loc && e.keyCode === 13) {
                    dbkjs.modules.updateFilter(0);
                    _obj.zoomAndPulse(loc);
                }
            }
            if(currentSearch === 'address') {
                _obj.handleAddressSearch(searchText);
            }
        });
        $('#search_dropdown a').click(function(e) {
            var searchType = $(this).attr('id'),
                dropdownText = $('.dropdown-text'),
                dropdownIcon = dropdownText.prev();
            e.preventDefault();
            if (dropdownConfig.hasOwnProperty(searchType)) {
                dropdownIcon.attr( "class", dropdownConfig[searchType].icon );
                dropdownText.text(dropdownConfig[searchType].text);
                searchField.attr("placeholder", dropdownConfig[searchType].placeholder);
                currentSearch = dropdownConfig[searchType].search;
                if(currentSearch === 'coordinates' || currentSearch === 'oms') {
                    searchField.attr("type", 'number');
                } else {
                    searchField.attr("type", 'text');
                }
            }
        });
    },
    searchDbkOms: function(searchValues, searchText) {
        var _obj = dbkjs.modules.search,
            regExp = new RegExp(searchText, 'ig');
        _obj.showSearchResult(searchValues.filter(function(elem, pos) {
            return regExp.test(elem.value);
        }), function(value) {
            dbkjs.modules.feature.handleDbkOmsSearch(value);
        });
    },
    showSearchResult: function(searchResult, clickCallback) {
        var _obj = dbkjs.modules.search,
            searchResultContainer = $('.search_result'),
            item_ul = $('<ul class="nav nav-pills nav-stacked"></ul>');
        searchResultContainer.html('');
        searchResult.forEach(function(value) {
            item_ul.append($('<li><a href="#">' + value.value + '</a></li>').on('click', function(e) {
                e.preventDefault();
                if(clickCallback) {
                    clickCallback(value);
                }
                _obj.searchPopup.hide();
            }));
        });
        searchResultContainer.append(item_ul);
    },
    handleCoordinatesSearch: function() {
        var _obj = dbkjs.modules.search;
        var ruwe_input = $('#search_input').val();
        var loc;
        var coords = ruwe_input.split(/[\s,]+/);
        coords[0] = parseFloat(coords[0]);
        coords[1] = parseFloat(coords[1]);
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
            if (coords[0] > 50.0 && coords[0] < 54.0 && coords[1] > 2.0 && coords[1] < 8.0) { //wgs84
                loc = new OpenLayers.LonLat(coords[1], coords[0]).transform(new OpenLayers.Projection("EPSG:4326"),dbkjs.map.getProjectionObject());
                $('#search_input').removeClass('has-error');
                return loc;
            } else if (coords[0] > -14000.0 && coords[0] < 293100.0 && coords[1] > 293100.0 && coords[1] < 650000.0) { //rd
                loc = new OpenLayers.LonLat(coords[0], coords[1]).transform(new OpenLayers.Projection("EPSG:28992"), dbkjs.map.getProjectionObject());
                $('#search_input').removeClass('has-error');
                return loc;
            } else {
                // @todo build function to handle map fault
                //maak het vakje rood, geen geldige coordinaten
                $('#search_input').addClass('has-error');
            }
        } else {
            $('#search_input').addClass('has-error');
        }
        return null;
    },
    handleAddressSearch: function(searchText) {
        var _obj = dbkjs.modules.search,
            url = (dbkjs.options.urls && dbkjs.options.urls.autocomplete ? dbkjs.options.urls.autocomplete : dbkjs.basePath + 'api/autocomplete/') + encodeURI(searchText);
        $.ajax(url, {
            dataType: 'json',
            success: function(parsedResponse) {
                _obj.showSearchResult(_obj.parseAddressResponse(parsedResponse), function(value) {
                    dbkjs.modules.updateFilter(value.id);
                    _obj.zoomAndPulse(value.geometry.getBounds().getCenterLonLat());
                });
            }
        });
    },
    parseAddressResponse: function(parsedResponse) {
        var dataset = [];
        for (i = 0; i < parsedResponse.length; i++) {
            var pnt = new OpenLayers.Geometry.Point(
                parsedResponse[i].lon,
                parsedResponse[i].lat).transform(
                    new OpenLayers.Projection("EPSG:4326"),
                    dbkjs.map.getProjectionObject()
                );
            dataset.push({
                value: parsedResponse[i].display_name,
                id: parsedResponse[i].osm_id,
                geometry: pnt
            });
        }
        return dataset;
    },
    activate: function() {
        var _obj = dbkjs.modules.search;
        $('#search_input').typeahead({
            name: 'address',
            remote: {
                //url: 'nominatim?format=json&countrycodes=nl&addressdetails=1&q=%QUERY',
                url: 'api/autocomplete/%QUERY',
                filter: function(parsedResponse) {
                    return _obj.parseAddressResponse(parsedResponse);
                }
            }
        });
        $('#search_input').bind('typeahead:selected', function(obj, datum) {
            dbkjs.modules.updateFilter(datum.id);
            _obj.zoomAndPulse(datum.geometry.getBounds().getCenterLonLat());
        });
        $('#search_dropdown a').click(function(e) {
            $('#search_input').typeahead('destroy');
            $('#search_input').val('');
            var mdiv = $(this).parent().parent().parent();
            var mbtn = $('#search-add-on');
            var minp = mdiv.parent().find('input');
            var searchtype = $(this).text().trim();
            if (searchtype === i18n.t("search.address")) {
                mbtn.html('<i class="fa fa-home"></i>');
                minp.attr("placeholder", i18n.t("search.addressplaceholder"));
                if (dbkjs.modules.search) {
                    dbkjs.modules.search.activate();
                }
            } else if (searchtype === i18n.t("search.coordinates")) {
                mbtn.html('<i class="fa fa-thumb-tack"></i>');
                minp.attr("placeholder", i18n.t("search.coordplaceholder"));
                $('#search_input').change(function() {
                    var loc = _obj.handleCoordinatesSearch();
                    if(loc) {
                        dbkjs.modules.updateFilter(0);
                        _obj.zoomAndPulse(loc);
                    }
                    return false;
                });
            } else if (searchtype === i18n.t("search.dbk")) {
                mbtn.html('<i class="fa fa-building"></i>');
                minp.attr("placeholder", i18n.t("search.dbkplaceholder"));
                dbkjs.modules.feature.search_dbk();
            } else if (searchtype === i18n.t("search.oms")) {
                mbtn.html('<i class="fa fa-bell"></i>');
                minp.attr("placeholder", i18n.t("search.omsplaceholder"));
                dbkjs.modules.feature.search_oms();
            } else if (searchtype === i18n.t("search.infrastructure")) {
                mbtn.html('<i class="fa fa-car"></i>');
                minp.attr("placeholder", i18n.t("search.infraplaceholder"));
                 if (dbkjs.modules.search) {
                    dbkjs.modules.search.activateinfra();
                }
            }
            mdiv.removeClass('open');
            mdiv.removeClass('active');
            return false;
        });
    },
    activateinfra: function() {
        var _obj = dbkjs.modules.search;
        $('#search_input').typeahead({
            name: 'infra',
            remote: {
                url: 'api/autocomplete/autoweg/%QUERY',
                filter: function(parsedResponse) {
                    return _obj.parseAddressResponse(parsedResponse);
                }
            }
        });
        $('#search_input').bind('typeahead:selected', function(obj, datum) {
            for (var i = 0, len = dbkjs.map.layers.length; i < len; i++) {
                //get the layer with the pl that is right for infra: ih

                if(dbkjs.map.layers[i].metadata.pl === "ih"){
                    //make sure it is visible and that the overlay bar is set to activated
                    dbkjs.map.layers[i].metadata.div.children('.panel-heading').addClass('active layActive');
                    dbkjs.map.layers[i].setVisibility(true);
                }
            }
            dbkjs.modules.updateFilter(datum.id);
            _obj.zoomAndPulse(datum.geometry.getBounds().getCenterLonLat());
        });
        $('#search_dropdown a').click(function(e) {
            $('#search_input').typeahead('destroy');
            $('#search_input').val('');
            var mdiv = $(this).parent().parent().parent();
            var mbtn = $('#search-add-on');
            var minp = mdiv.parent().find('input');
            var searchtype = $(this).text().trim();
            if (searchtype === i18n.t("search.i")) {
                mbtn.html('<i class="fa fa-home"></i>');
                minp.attr("placeholder", i18n.t("search.addressplaceholder"));
                if (dbkjs.modules.search) {
                    dbkjs.modules.search.activate();
                }
            } else if (searchtype === i18n.t("search.coordinates")) {
                mbtn.html('<i class="fa fa-thumb-tack"></i>');
                minp.attr("placeholder", i18n.t("search.coordplaceholder"));
                $('#search_input').change(function() {
                    var loc = _obj.handleCoordinatesSearch();
                    if(loc) {
                        dbkjs.modules.updateFilter(0);
                        _obj.zoomAndPulse(loc);
                    }
                    return false;
                });
            } else if (searchtype === i18n.t("search.dbk")) {
                mbtn.html('<i class="fa fa-building"></i>');
                minp.attr("placeholder", i18n.t("search.dbkplaceholder"));
                dbkjs.modules.feature.search_dbk();
            } else if (searchtype === i18n.t("search.oms")) {
                mbtn.html('<i class="fa fa-bell"></i>');
                minp.attr("placeholder", i18n.t("search.omsplaceholder"));
                dbkjs.modules.feature.search_oms();
            } else if (searchtype === i18n.t("search.infrastructure")) {
                mbtn.html('<i class="fa fa-car"></i>');
                minp.attr("placeholder", i18n.t("search.infraplaceholder"));
                 if (dbkjs.modules.search) {
                    dbkjs.modules.search.activateinfra();
                }
            }
            mdiv.removeClass('open');
            mdiv.removeClass('active');
            return false;
        });
    }
};
