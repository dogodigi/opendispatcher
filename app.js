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

// To run in production: NODE_ENV=production

var express = require('express'),
        routes = require('./routes'),
        http = require('http'),
        path = require('path'),
        i18n = require('i18next'),
        anyDB = require('any-db'),
        web = require('./controllers/web.js'),
        dbk = require('./controllers/dbk.js'),
        bag = require('./controllers/bag.js'),
        emailer = require('./controllers/emailer.js');


global.conf = require('nconf');

// First consider commandline arguments and environment variables, respectively.
global.conf.argv().env();

// Then load configuration from a designated file.
global.conf.file({ file: 'config.json' });

// Provide default values for settings not provided above.
global.conf.defaults({
    'http': {
        'port': 9999
    }
});
function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.send(500, {error: 'Ooops, something went wrong'});
    } else {
        next(err);
    }
}

i18n.init({
    lng: 'nl',
    detectLngQS: 'l',
    saveMissing: true,
    debug: false
});
var dbURL = 'postgres://' + 
        global.conf.get('database:user') + ':' + 
        global.conf.get('database:password') + '@' + 
        global.conf.get('database:host') + ':' + 
        global.conf.get('database:port') + '/' + 
        global.conf.get('database:dbname');
var bagURL = 'postgres://' + 
        global.conf.get('bag:user') + ':' + 
        global.conf.get('bag:password') + '@' + 
        global.conf.get('bag:host') + ':' + 
        global.conf.get('bag:port') + '/' + 
        global.conf.get('bag:dbname');

global.pool = anyDB.createPool(dbURL, {min: 2, max: 20});
global.bag = anyDB.createPool(bagURL, {min: 2, max: 20});
var app = express(
//    {
//        requestCert: true,
//        // If specified as "true", no unauthenticated traffic
//        // will make it to the route specified.
//        rejectUnauthorized: true
//    }
);

// all environments
app.configure(function() {
    app.set('port', process.env.PORT || global.conf.get('http:port'));
    app.use(function(err, req, res, next) {
        console.error(err.stack);
        res.send(500, 'Something broke!');
    });
    app.enable('trust proxy');
    app.use(i18n.handle);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.locals.pretty = true;
    app.use(express.favicon(__dirname + '/public/images/favicon.ico', {maxAge: 25920000000}));
    app.use(express.logger('dev'));
    app.use(require('less-middleware')(path.join(__dirname,  'less'), {
        dest: __dirname + '/public',
        prefix: '/public',
        debug: true
    }));
    app.use(express.bodyParser());

    app.use(express.methodOverride());
    app.use('/locales', express.static(__dirname + '/locales'));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use('/web', express.static(__dirname + '/web'));
    app.use('/media', express.static(global.conf.get('media:path')));
    app.use('/symbols', express.static(global.conf.get('media:symbols')));
    app.use(app.router);
    app.use(clientErrorHandler);
    app.use(function(err, req, res, next) {
        var errobj = {};
        errobj.url = req.protocol + "://" + req.get('host') + req.url;
        errobj.body = req.body;
        errobj.query = req.query;
        errobj.params = req.params;
        res.status(500);
        res.render('error', {title: 'error', request: JSON.stringify(errobj), error: err});
    });
});

i18n.registerAppHelper(app);
i18n.serveClientScript(app)
        .serveDynamicResources(app)
        .serveMissingKeyRoute(app);

app.get('/', routes.index);
app.get('/batch', emailer.annotationbulk);
app.get('/api/object/:id.json', dbk.getObject);
app.post('/api/annotation', dbk.postAnnotation);
app.get('/api/gebied/:id.json', dbk.getGebied);
app.get('/api/features.json', dbk.getFeatures);
app.get('/api/bag/adres/:id', bag.getAdres);
app.get('/api/bag/panden/:id', bag.getPanden);
app.get('/api/autocomplete/:searchphrase', bag.autoComplete);
app.all('/nominatim',function(req,res){
 if(req.query){
   var request = require('request');
   var x = request({url: 'http://nominatim.openstreetmap.org/search', qs: req.query});
    req.pipe(x);
    x.pipe(res);
 } else {
    res.json({"booh": "Nah, nah, nah! You didn't say the magic words!"});
 }
});
app.get('/api/organisation.json', dbk.getOrganisation);
app.all('/proxy/',function(req,res){
 if(req.query){
   //res.json({"origin": req.query.q});
   var request = require('request');
   var x = request(req.query.q);
    req.pipe(x);
    x.pipe(res);
 } else {
    res.json({"booh": "Nah, nah, nah! You didn't say the magic words!"});
 }
});
//app.get('/data/regio.json', routes.regio);
app.get('/webdata/:id', web.getData);
app.post('/validate', web.validate_POST);
app.get('/validate/:token', web.validate_GET);
app.get('/eughs.html', routes.eughs);
app.get('/nen1414.html', routes.nen1414);
// Create an HTTP service.
app.listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});

