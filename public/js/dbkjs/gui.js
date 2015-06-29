
var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.gui = {
    // dbkjs.js: successAuth
    setLogo: function() {
        if (dbkjs.options.organisation.logo) {
            $('#logo').css('background-image', 'url(' + dbkjs.options.organisation.logo + ')');
        }
    },
    // feature.js
    createRefreshButton: function(obj) {
        $('#btngrp_navigation').append(
            '<a id="btn_refresh" class="btn btn-default navbar-btn" href="#" title="'+
            i18n.t('app.refresh') + '"><i class="fa fa-refresh"></i></a>'
        );
        $('#btn_refresh').click(function() {
            if (dbkjs.viewmode !== 'fullscreen') {
               $('#btn_refresh > i').addClass('fa-spin');
            };
            obj.get();
        });
    },
    // feature.js
    updateSearchInput: function(obj,name, dbk_naam_array) {
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
    // jsonDBK.js
    infoPanelUpdateTitle: function(text) {
        dbkjs.util.changeDialogTitle(text);
    },
    // feature.js
    infoPanelUpdateHtml: function(html) {
        $('#infopanel_b').html(html);
    },
    // jsonDBK.js
    infoPanelUpdateFooterHtml: function(html) {
        $('#infopanel_f').html(html);
    },
    // feature.js
    infoPanelAddPagination: function() {
        $('#infopanel_f').append('<ul id="Pagination" class="pagination"></ul>');
    },
    // feature.js
    infoPanelShow: function() {
        $('#infopanel').show();
    },
    // feature.js
    infoPanelShowFooter: function() {
        $('#infopanel_f').show();
    },
    // feature.js
    infoPanelAddItems: function(html) {
        $('#infopanel_b').append(html);
    },
    // feature.js
    infoPanelAddItemClickEvent: function(_obj) {
    },
    // feature.js
    infoPanelHide: function() {
        $('#infopanel').hide();
    },
    showError: function(errMsg) {
        dbkjs.util.alert('Fout', ' ' + errMsg, 'alert-danger');
    },
    // jsonDBK.js
    detailsPanelUpdateTitle: function(text) {
        $('#vectorclickpanel_h').html('<span class="h4"><i class="fa fa-info-circle"></i>&nbsp;' + text + '</span>');
        //$('#vectorclickpanel_h').html(text);
    },
    // jsonDBK.js
    detailsPanelUpdateHtml: function(html) {
        $('#vectorclickpanel_b').html(html);
    },
    // jsonDBK.js
    detailsPanelShow: function() {
        $('#vectorclickpanel').show();
    },
    // jsonDBK.js
    detailsPanelHide: function() {
        $('#vectorclickpanel').hide();
    }
};
