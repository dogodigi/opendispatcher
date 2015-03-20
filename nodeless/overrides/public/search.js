dbkjs.modules.search.inlineLayout = function() {
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
            //'<li><a href="#" id="s_coord"><i class="fa fa-thumb-tack"></i> ' + i18n.t("search.coordinates") + '</a></li>' +
            '</ul>' +
            '</div>'
    );
    search_group.append(search_pre);
    search_group.append(search_input);
    search_group.append(search_btn_grp);
    search_div.append(search_group);
    search_div.show();
    this.activate();
};
