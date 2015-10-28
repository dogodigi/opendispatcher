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

/* global global, __dirname, exports, process */

// Error handlers
function logErrors(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

function clientErrorHandler(err, req, res, next) {
    console.log('handling error');
    var errobj = {};
    errobj.url = req.protocol + "://" + req.get('host') + req.url;
    errobj.body = req.body;
    errobj.query = req.query;
    errobj.params = req.params;
    res.status(500);
    res.render('shared/error', {title: 'error', request: JSON.stringify(errobj), error: err});
}

function errorHandler(err, req, res, next) {
  res.status(500);
  res.render('error', { error: err });
}

// To run in production: NODE_ENV=production

var express = require('express'),
        errorhandler = require('errorhandler'),
        //favicon = require('serve-favicon'),
        bodyParser = require('body-parser'),
        http = require('http'),
        path = require('path'),
        i18n = require('i18next'),
        anyDB = require('any-db'),
        fs = require('fs'),
        compress = require('compression');
var env = process.env.NODE_ENV || 'development';

global.conf = require('nconf');
// First consider commandline arguments and environment variables, respectively.
global.conf.argv().env();
// Then load configuration from a designated file.
//check to see if config file exists, if not, default to config.default.json
if (!fs.existsSync('config.json')) {
    console.log('Warning, no config.json present. Falling back to config.default.json');
    //check to see if config file exists, if not, default to config.default.json
    global.conf.file({file: 'config.default.json'});
} else {
    global.conf.file({file: 'config.json'});
}
// Provide default values for settings not provided above.
global.conf.defaults({
    'http': {
        'port': 9999
    }
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
if (global.conf.get('infrastructure:user')) {
    var infraURL = 'postgres://' +
            global.conf.get('infrastructure:user') + ':' +
            global.conf.get('infrastructure:password') + '@' +
            global.conf.get('infrastructure:host') + ':' +
            global.conf.get('infrastructure:port') + '/' +
            global.conf.get('infrastructure:dbname');
    global.infra = anyDB.createPool(infraURL, {min: 2, max: 20});
}
global.pool = anyDB.createPool(dbURL, {min: 2, max: 20});
global.bag = anyDB.createPool(bagURL, {min: 2, max: 20});
global.defaultLanguage = global.conf.get('default:language') || 'en';

i18n.init({
    lngWhitelist: ['nl', 'en', 'dev'],
    detectLngQS: 'l',
    saveMissing: true,
    useCookie: false,
    debug: false,
    fallbackLng: global.defaultLanguage
});

var app = express(
//    {
//        requestCert: true,
//        // If specified as "true", no unauthenticated traffic
//        // will make it to the route specified.
//        rejectUnauthorized: true
//    }
);

// Configuration
app.set('port', process.env.PORT || global.conf.get('http:port'));
app.use(compress());
app.enable('trust proxy');
app.use(i18n.handle);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use('/locales', express.static(__dirname + '/locales'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/media', express.static(global.conf.get('media:path')));
app.use('/symbols', express.static(global.conf.get('media:symbols')));
app.use('/web', express.static(__dirname + '/web'));

i18n.registerAppHelper(app);
i18n.serveClientScript(app)
        .serveDynamicResources(app)
        .serveMissingKeyRoute(app);
app.use(require('./controllers'));
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);
if ('development' == env) {
    //app.use(errorhandler({dumpExceptions: true, showStack: true}));
    app.use('/build', express.static(__dirname + '/build'));
    app.locals.pretty = true;
}

if ('production' == env) {
    //app.use(errorhandler());
    app.locals.pretty = false;
}

app.use(function(req, res, next) {
  var errobj = {};
  errobj.url = req.protocol + "://" + req.get('host') + req.url;
  errobj.body = req.body;
  errobj.query = req.query;
  errobj.params = req.params;
  res.status(404);
  res.render('shared/404', {title: '404 - Page Not found', mode: req.app.get('env'), request: JSON.stringify(errobj)});
});
function start() {
    app.listen(app.get('port'), function () {
        console.log("Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
    });

}
exports.start = start;
exports.app = app;
exports.pool = global.pool;
exports.bag = global.bag;
