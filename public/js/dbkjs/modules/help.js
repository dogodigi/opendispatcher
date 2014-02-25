var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
dbkjs.modules.help = {
    id: "dbk.modules.help",
    register: function() {
        if (dbkjs.options.organisation.support) {
            $('body').append('<div id="foutknop" class="btn-group">' +
                    '<a class="btn btn-default navbar-btn">' +
                    '<span><i class="icon-envelope-alt"></i> ' + dbkjs.options.organisation.support.button +'</span>' +
                    '</a>' +
                    '</div>');
            // Foutknop //
            var reciever = 'mailto:' + dbkjs.options.organisation.support.mail;
            var subject = 'subject=' + dbkjs.options.APPLICATION + ' Melding' + dbkjs.options.VERSION + ' (' + dbkjs.options.RELEASEDATE + ')';
            var body = 'body=' + location.href + ' (deze link wordt door de beheerder gecontroleerd)';
            var sMailTo = dbkjs.util.htmlEncode(reciever + '?' + subject);
            sMailTo += '&' + dbkjs.util.htmlEncode(body);
            $('#foutknop').find('a').attr('href', sMailTo);
        }
    }
};

