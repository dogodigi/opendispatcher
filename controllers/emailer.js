/**
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

var nodemailer = require("nodemailer");
var i18n = require('i18next');
var sender = "dogofind <no-reply@dogofind.net>";

var options = {
    //service: "Gmail",
    host: "mail.dogofind.net", // hostname
    secureConnection: true, // use SSL
    port: 465, // port for secure SMTP
    auth: {
        user: "milo@dogofind.net",
        pass: "qffxx9kaq4b9g9hq"
    }
};
//var options = {
//    service: "Gmail",
//    auth: {
//        user: "milovanderlinden@gmail.com",
//        pass: "Drie maal drie is negen"
//    }
//};
var smtp = nodemailer.createTransport("SMTP",options);

exports.annotationbulk = function(req, res) {
    email = global.conf.get('support:sendto');
    locale ='nl';
    console.log(email);
    console.log(locale);
    //TODO: Make sure the locale is always picked up from the right directory!
    i18n.init({
        lng: locale, 
        //debug: true,
        resGetPath: './locales/__lng__/__ns__.json'
    }, function(t) {
        //selecteer alle annotations waarvoor sent = false
        // Are there any spaces in the searchphrase? use to_tsquery!
            var query_str = "select * from organisation.annotation where sent = false";
            //( textsearchable_adres @@ to_tsquery('dutch','spinellihof $1 limit 1';
            console.log(query_str);
            global.pool.query(query_str,
                function(err, result) {
                    if (err) {
                        res.json(err);
                    } else {
                        // nu loopen!
                        var errors = [];
                        var success = [];
                        //console.log(result.rows);
                        for (index = 0; index < result.rows.length; ++index) {
                            
                            var htmltemplate = t("email.annotationtitle") + ',<br/><br/>' +
                                //bericht hier
                                '<table>' + 
                                        '<tr><th>Melding:</th><td>' + result.rows[index].gid + '</td></tr>' + 
                                        '<tr><th>Adres:</th><td>' + result.rows[index].address + '</td></tr>' + 
                                        '<tr><th>Korte omschrijving:</th><td>' + result.rows[index].subject + '</td></tr>' + 
                                        '<tr><th>Melding:</th><td>' + result.rows[index].remarks + '</td></tr>' + 
                                        '<tr><td colspan="2"><hr /><td></tr>' + 
                                        '<tr><th>Melder:</th><td>' + result.rows[index].name + '</td></tr>' + 
                                        '<tr><th>Email:</th><td>' + result.rows[index].email + '</td></tr>' + 
                                        '<tr><th>Telefoon:</th><td>' + result.rows[index].phone + '</td></tr>' + 
                                        '<tr><td colspan="2"><hr /><td></tr>' + 
                                        '<tr><td colspan="2">Klik op de link om de melding te openen:</td></tr>' + 
                                        '<tr><td colspan="2"><a href="' + result.rows[index].permalink + '">'  + result.rows[index].permalink + '</td></tr><br/><br/>' + 
                                t("email.kindregards") + ',<br/><br/>' +
                                t("email.team");
                            var plaintemplate = t("email.annotationtitle") + ',\r\n\r\n' +
                                //bericht hier
                                        'Melding: ' + result.rows[index].gid + '\r\n' + 
                                        'Adres: ' + result.rows[index].address + '\r\n' + 
                                        'Korte omschrijving:\r\n' + result.rows[index].subject + '\r\n' +  
                                        'Melding: ' + result.rows[index].remarks  + '\r\n' + 
                                        '-----------------------------------------------------'  + '\r\n' + 
                                        'Melder: ' + result.rows[index].name  + '\r\n' + 
                                        'Email: ' + result.rows[index].email  + '\r\n' +  
                                        'Telefoon: ' + result.rows[index].phone  + '\r\n' +
                                        '-----------------------------------------------------'  + '\r\n' + 
                                        'Klik op de link om de melding te openen:' +  '\r\n' +
                                        result.rows[index].permalink +  '\r\n\r\n' + 
                                t("email.kindregards") + ',\r\n\r\n' +
                                t("email.team");
                            smtp.sendMail({
                                from: sender,
                                to: email,
                                subject: t("email.annotation"),
                                text: plaintemplate,
                                html: htmltemplate,
                                forceEmbeddedImages: true
                            }, function(error, response) {
                                if (error) {
                                    errors.push({"error": error.message});
                                    return;
                                } else {
                                    success.push({"success": response.message});
                                    return;
                                }
                            });
                        }
                        smtp.close();
                        res.json({"processed": result.rows.length});
                    }
                return;
            });
    });

};