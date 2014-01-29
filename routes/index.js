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
    res.render('index', {title: 'index pagina'});
};
exports.regio = function(req, res) {
    res.send(global.conf.get("regio"));
};
exports.bag_service = function(req,res){
    var queryparams = req.query;
    var options = {
        host: "view.safetymaps.nl",
        method: 'GET',
        port: 80,
        path: '/bag/' 
                + req.params.service + '?' 
                + querystring.stringify(queryparams)
    };
    var request = http.request(options,function(response){
      response.pipe(res);
    });
    request.end();
};

exports.gs_service = function(req, res) {
    var queryparams = req.query;
    var options = {
        host: "view.safetymaps.nl",
        method: 'GET',
        port: 80,
        path: '/geoserver/' 
                + req.params.service + '?' 
                + querystring.stringify(queryparams)
    };
    var request = http.request(options, function(response) {
        console.log(response.headers);
        res.writeHead(200, response.headers);
        response.pipe(res);
    });
    request.end();
};

exports.gs_workspace = function(req, res) {
    var queryparams = req.query;
    var options = {
        host: "view.safetymaps.nl",
        method: 'GET',
        port: 80,
        path: '/geoserver/' + req.params.workspace + '/' + req.params.service + '?' + querystring.stringify(queryparams)
    };
    var request = http.request(options, function(response) {
        console.log(response);
        response.pipe(res);
        request.end();
    });
    
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