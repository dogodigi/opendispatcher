/*
 *
 */
var querystring = require('querystring'),
    http = require('http');

exports.eughs = function(req, res) {
    res.render('eughs', {title: 'eughs', source_url: "http://stoffen-info.nl/onderwerpen/eu-ghs/kort/"});
};
exports.nen1414 = function(req, res) {
    res.render('nen1414', {title: 'nen1414'});
};
exports.index = function(req, res) {
    if(req.headers['x-safetymaps-dn']){
        var arr1 = req.headers['x-safetymaps-dn'].split('/');
        var user = {};
        for (index = 0; index < arr1.length; ++index) {
            var arr2 = arr1[index].split('=');
            user[arr2[0]] = arr2[1];
        }
        console.log(user);
    }
    res.render('index', {title: 'index pagina'});
};
exports.regio = function(req, res) {
    res.send(global.conf.get("regio"));
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