var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
dbkjs.modules.support = {
    id: "dbk.modules.support",
    register: function() {
        if (dbkjs.options.organisation.support) {
            $('body').append('<div id="foutknop" class="btn-group">' +
                    '<a class="btn btn-default navbar-btn">' +
                    '<span><i class="icon-envelope-alt"></i> ' + dbkjs.options.organisation.support.button +'</span>' +
                    '</a>' +
                    '</div>');
            var supportpanel = dbkjs.util.createDialog('supportpanel', '<i class="icon-envelope-alt"></i> ' + dbkjs.options.organisation.support.button, 'bottom:0;left:0;');
            $('body').append(supportpanel);
            $('.dialog').drags({handle: '.panel-heading'});
            $('.btn-group').drags({handle: '.drag-handle'});
            // Foutknop //
//            var reciever = 'mailto:' + dbkjs.options.organisation.support.mail;
//            var subject = 'subject=' + dbkjs.options.APPLICATION + ' Melding' + dbkjs.options.VERSION + ' (' + dbkjs.options.RELEASEDATE + ')';
//            var body = 'body=' + location.href + ' (deze link wordt door de beheerder gecontroleerd)';
//            var sMailTo = dbkjs.util.htmlEncode(reciever + '?' + subject);
//            sMailTo += '&' + dbkjs.util.htmlEncode(body);
//            $('#foutknop').find('a').attr('href', sMailTo);

            $('#foutknop').click(function(){
                $('#supportpanel_b').html('');
                //Selectie voor kaartlagen
                var layerarray = ['--Algemene melding--'];
                $.each(dbkjs.map.layers, function(l_index, layer) {
                    if ($.inArray(layer.name, ['hulplijn1', 'hulplijn2', 'Feature']) === -1) {
                        //layername mag niet beginnen met OpenLayers_
                        if(layer.name.substring(0,11) !== "OpenLayers_"){
                            layerarray.push(layer.name); 
                        }
                    }
                });
                layerarray.sort();
                var p = $('<form role="form"></form>');
                p.append('<p class="bg-info">Klik eventueel op de kaart om <br>aan te geven waar de fout is geconstateerd<br> of waar de melding over gaat.</p>');
                var laag_input = $('<div class="form-group"><label for="kaartlaag">Onderwerp</label></div>');
                var select = $('<select name="kaartlaag" class="form-control" MULTIPLE></select>');
                
                $.each(layerarray, function(l_index, name) {
                    select.append('<option>' + name + '</option>');
                });
                laag_input.append(select);
                p.append(laag_input);
                var adres_input = $('<div class="form-group"><label for="address">Adres</label><input id="address" name="address" type="text" class="form-control" placeholder="Adres"></div>');
                p.append(adres_input);
                var gemeente_input = $('<div class="form-group"><label for="municipality">Gemeente</label><input id="municipality" name="municipality" type="text" class="form-control" placeholder="Gemeente"></div>');
                p.append(gemeente_input);
                var user_input = $('<div class="form-group"><label for="name">Naam melder</label><input id="name" name="name" type="text" class="form-control" placeholder="Naam melder"></div>');
                p.append(user_input);
                var mail_input = $('<div class="form-group"><label for="email">E-mail</label><input id="email" name="email" type="email" class="form-control" placeholder="E-mail"></div>');
                p.append(mail_input);
                var tel_input = $('<div class="form-group"><label for="phone">Telefoon</label><input id="phone" name="phone" type="tel" class="form-control" placeholder="Telefoon"></div>');
                p.append(tel_input);
                var remarks_input = $('<div class="form-group"><label for="remarks">Melding</label><textarea id="remarks" name="remarks" class="form-control" placeholder="Melding"></textarea></div>');
                p.append(remarks_input);
                p.append('<button type="submit" class="btn btn-default">Verstuur</button>');
                $('#supportpanel_b').append(p);
                $('#supportpanel').show();
                $('#foutknop').hide();
            });
            supportpanel.find('.close').click(function(){
                $('#supportpanel').hide();
                $('#foutknop').show();
            });
        }
    }
};

