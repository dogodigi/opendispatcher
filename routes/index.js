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

var querystring = require('querystring'),
    http = require('http');

exports.eughs = function(req, res) {
    res.render('eughs', {title: 'eughs', source_url: "http://stoffen-info.nl/onderwerpen/eu-ghs/kort/"});
};
exports.nen1414 = function(req, res) {
    //db query uitvoeren.
    var query_str = 'select naam, omschrijving, brandweervoorziening_symbool,lower(namespace) as namespace  from dbk.type_brandweervoorziening';
        global.pool.query(query_str,
            function(err, result){
                if(err) {
                    res.render('error', {title: 'Fout opgetreden', error: 'De NEN1414 bibliotheek kan niet worden getoond'});
                } else {
                    console.log(result.rows);
                    res.render('nen1414', {title: 'nen1414', items: result.rows});
                }
                return;
            }
        );
    
};

exports.index = function(req, res) {
    if(req.headers['x-safetymaps-dn']){
        var arr1 = req.headers['x-safetymaps-dn'].split('/');
        var user = {};
        for (index = 0; index < arr1.length; ++index) {
            var arr2 = arr1[index].split('=');
            user[arr2[0]] = arr2[1];
        }
    }
    res.render('index',{mylang: req.i18n.language(), mode: req.app.get('env')});
};

exports.login = function(req,res){
    if(req.query){
        var id = req.query.id;
        if(id === 'milo'){
            res.json({"login":"ok"});
        } else {
            res.send(401, 'Unauthorized');
        }
    }
};

exports.validate_GET = function(req, res) {
    var token = req.params.token;
    checkToken(token, res);
};

exports.validate_POST = function(req, res) {
    var token = req.body.token;
    checkToken(token, res);
};

checkToken = function(token, res) {
    if (token === "be8c631496af73e302c0effec301dfda7ffd11fa1c2e08ae") {

        res.render('error', {title: 'Welkom!', error: 'Hallo Milo!'});
    } else {
        require('crypto').randomBytes(24, function(ex, buf) {
            var newtoken = buf.toString('hex');
            if (newtoken === token) {
                res.render('error', {title: 'Yeah!', error: 'Goed zo!'});
            } else {
                res.status(500);
                res.render('error', {title: 'Fout', error: token + ' is niet gelijk aan ' + newtoken});
            }
        });
    }
};
