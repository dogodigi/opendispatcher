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

/* global exports, require, global */

var web = require('../controllers/web.js'),
        dbk = require('../controllers/dbk.js'),
        bag = require('../controllers/bag.js'),
        infra = require('../controllers/infrastructure.js'),
        incidents = require('../controllers/incidents.js'),
        emailer = require('../controllers/emailer.js'),
        querystring = require('querystring'),
        http = require('http');

function eughs (req, res) {
    res.render('eughs', {title: 'eughs', source_url: "http://stoffen-info.nl/onderwerpen/eu-ghs/kort/"});
}
function nen1414(req, res) {
    //db query uitvoeren.
    var query_str = 'select naam, omschrijving, brandweervoorziening_symbool,lower(namespace) as namespace  from dbk.type_brandweervoorziening';
    global.pool.query(query_str,
            function (err, result) {
                if (err) {
                    res.status(400).render('error', {title: 'Fout opgetreden', error: 'De NEN1414 bibliotheek kan niet worden getoond'});
                } else {
                    res.render('nen1414', {title: 'nen1414', items: result.rows});
                }
                return;
            }
    );

}

function index(req, res) {
    var activelang;
    if (req.i18n.language() !== 'nl' && req.i18n.language() !== 'dev' && req.i18n.language() !== 'en') {
        req.i18n.setLng('en');
        activelang = 'en';
    } else {
        activelang = req.i18n.language();
    }
    if (req.headers['x-opendispatcher-dn']) {
        var arr1 = req.headers['x-opendispatcher-dn'].split('/');
        var user = {};
        for (var i = 0; i < arr1.length; ++i) {
            var arr2 = arr1[i].split('=');
            user[arr2[0]] = arr2[1];
        }
    }
    res.render('index', {mylang: activelang, mode: req.app.get('env')});
}

function validate_GET(req, res) {
    var token = req.params.token;
    checkToken(token, res);
}

function validate_POST(req, res) {
    var token = req.body.token;
    checkToken(token, res);
}

function checkToken(token, res) {
    if (token === "be8c631496af73e302c0effec301dfda7ffd11fa1c2e08ae") {

        res.render('error', {title: 'Welkom!', error: 'Hallo Milo!'});
    } else {
        require('crypto').randomBytes(24, function (ex, buf) {
            var newtoken = buf.toString('hex');
            if (newtoken === token) {
                res.status(400).render('error', {title: 'Yeah!', error: 'Goed zo!'});
            } else {
                res.status(400).render('error', {title: 'Fout', error: token + ' is niet gelijk aan ' + newtoken});
            }
        });
    }
}

function setup(app) {
    app.get('/', index);
    app.get('/api/object/:id.json', dbk.getObject);
    app.post('/api/annotation', emailer.postAnnotation);
    app.get('/api/gebied/:id.json', dbk.getGebied);
    app.get('/api/features.json', dbk.getFeatures);
    app.get('/api/bag/info', bag.getVersion);
    app.get('/api/bag/adres/:id', bag.getAdres);
    app.get('/api/bag/panden/:id', bag.getPanden);
    app.get('/api/infra/info', infra.getVersion);
    app.get('/api/autocomplete/:searchphrase', bag.autoComplete);
    app.get('/api/autocomplete/:searchtype/:searchphrase', infra.autoComplete);
    app.get('/api/incidents/list/classifications', incidents.getGroupByClasses);
    app.get('/api/incidents/list/class/1', incidents.getGroupByClass1);
    app.get('/api/incidents/list/class/2', incidents.getGroupByClass2);
    app.get('/api/incidents/list/class/2/:c1', incidents.getGroupByClass2);
    app.get('/api/incidents/list/class/3', incidents.getGroupByClass2);
    app.get('/api/incidents/list/class/3/:c2', incidents.getGroupByClass3);
    app.get('/api/incidents/list/class/3/:c1/:c2', incidents.getGroupByClass3);
    app.get('/api/incidents/list/priorities', incidents.getGroupByPriority);
    app.get('/api/incidents/list/firestations', incidents.getGroupByFirestation);
    app.get('/web/api/:id', web.getData);
    app.get('/web/api/bag/panden/:id.json', bag.getPanden);
    app.post('/web/api/validate', web.validate_POST);
    app.get('/web/api/validate/:token', web.validate_GET);
    app.all('/nominatim', function (req, res) {
        if (req.query) {
            var request = require('request');
            var x = request({url: 'http://nominatim.openstreetmap.org/search', qs: req.query});
            req.pipe(x);
            x.pipe(res);
        } else {
            res.json({"booh": "Nah, nah, nah! You didn't say the magic words!"});
        }
    });
    app.get('/api/organisation.json', dbk.getOrganisation);
    app.all('/proxy/', function (req, res) {
        if (req.query) {
            var options = {
                url: req.query.q,
                headers: {
                    'User-Agent': 'opendispatcher'
                },
                timeout: 6000 //6 seconds
            };
            //res.json({"origin": req.query.q});
            var request = require('request');
            var x = request(options);
            req.pipe(x);
            x.pipe(res);
            x.on('error', function (err) {
                res.status(400).json({
                    "error": "Timeout on proxy"
                });
            });
        } else {
            res.status(400).json({"error": "wrong use of proxy"});
        }
    });
    app.get('/eughs.html', eughs);
    app.get('/nen1414.html', nen1414);
}

exports.setup = setup;
exports.index = index;
exports.checkToken = checkToken;
exports.eughs = eughs;
exports.nen1414 = nen1414;
exports.validate_GET = validate_GET;
exports.validate_POST = validate_POST;
