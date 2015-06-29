/**
 *  Copyright (c) 2014 Milo van der Linden (milo@dogodigi.net)
 * 
 *  This file is part of opendispatcher
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

/* global exports, global */

/**
 * 
 * @param {type} req
 * @param {type} res
 * @returns success or error message
 */
exports.postAnnotation = function (req, res) {
    var t = res.locals.t;
    var nodemailer = require("nodemailer");
    var smtp = nodemailer.createTransport("SMTP", global.conf.get('support:smtp'));
    // @todo get email from request, it can be changed in the database.
    email = global.conf.get('support:sendto');
    var htmltemplate = t("email.annotationtitle") + ',<br/><br/>' +
            '<table>' +
            '<tr><th>' + t("email.title") + '</th><td>' + t("email.new") + '</td></tr>' +
            '<tr><th>' + t("email.address") + '</th><td>' + req.body.address + '</td></tr>' +
            '<tr><th>' + t("email.subject") + '</th><td>' + req.body.subject + '</td></tr>' +
            '<tr><th>' + t("email.remarks") + '</th><td>' + req.body.remarks + '</td></tr>' +
            '<tr><td colspan="2"><hr /><td></tr>' +
            '<tr><th>' + t("email.sender") + '</th><td>' + req.body.name + '</td></tr>' +
            '<tr><th>' + t("email.email") + '</th><td>' + req.body.email + '</td></tr>' +
            '<tr><th>' + t("email.phone") + '</th><td>' + req.body.phone + '</td></tr>' +
            '<tr><td colspan="2"><hr /><td></tr>' +
            '<tr><td colspan="2">' + t("email.link") + '</td></tr>' +
            '<tr><td colspan="2"><a href="' + req.body.permalink + '">' + req.body.permalink + '</td></tr><br/><br/>' +
            t("email.kindregards") + ',<br/><br/>' +
            t("email.team");
    var plaintemplate = t("email.annotationtitle") + ',\r\n\r\n' +
            t("email.title") + ': ' + t("email.new") + '\r\n' +
            t("email.address") + ': ' + req.body.address + '\r\n' +
            t("email.subject") + ': ' + req.body.subject + '\r\n' +
            t("email.remarks") + ':\r\n\r\n' + req.body.remarks + '\r\n' +
            '-----------------------------------------------------' + '\r\n' +
            t("email.sender") + ': ' + req.body.name + '\r\n' +
            t("email.email") + ': ' + req.body.email + '\r\n' +
            t("email.phone") + ': ' + req.body.phone + '\r\n' +
            '-----------------------------------------------------' + '\r\n' +
            t("email.link") + ': ' + +'\r\n' +
            req.body.permalink + '\r\n\r\n' +
            t("email.kindregards") + ',\r\n\r\n' +
            t("email.team");
    smtp.sendMail({
        from: global.conf.get('support:from'),
        to: global.conf.get('support:sendto') + ',' + req.body.email,
        subject: t("email.annotation"),
        text: plaintemplate,
        html: htmltemplate,
        forceEmbeddedImages: true
    }, function (error, response) {
        if (error) {
            res.status(400).json({"status": "error", "message": error.message});
            return;
        } else {
            res.status(200).json({"status": "ok", "message": "sent"});
            return;
        }
    });
};