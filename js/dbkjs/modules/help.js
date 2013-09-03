var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
dbkjs.modules.help = {
    id: "dbkhelp",
    register: function() {
        if (dbkjs.options.regio.support) {
            $('body').append('<div id="foutknop" class="btn-group">' +
                    '<a class="btn btn-default navbar-btn">' +
                    '<span><i class="icon-envelope-alt"></i> ' + dbkjs.options.regio.support.button +'</span>' +
                    '</a>' +
                    '</div>');
            // Foutknop //
            var reciever = 'mailto:' + dbkjs.options.regio.support.mail;
            var subject = 'subject=' + dbkjs.options.APPLICATION + ' Melding' + dbkjs.options.VERSION + ' (' + dbkjs.options.RELEASEDATE + ')';
            var body = 'body=' + location.href + ' (deze link wordt door de beheerder gecontroleerd)';
            var sMailTo = dbkjs.util.htmlEncode(reciever + '?' + subject);
            sMailTo += '&' + dbkjs.util.htmlEncode(body);
            $('#foutknop').find('a').attr('href', sMailTo);
        }
    }
};

