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

// To run in production: NODE_ENV=production

var express = require('express'),
        routes = require('./routes'),
        http = require('http'),
        path = require('path'),
        i18n = require('i18next'),
        anyDB = require('any-db'),
        fs = require('fs'),
        compress = require('compression');
;

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
var expressLogFile = fs.createWriteStream('./logs/express.log', {flags: 'a'});

i18n.init({
    lng: 'nl',
    detectLngQS: 'l',
    saveMissing: true,
    useCookie: false,
    debug: false,
    fallbackLng: 'nl'
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


var app = express(
//    {
//        requestCert: true,
//        // If specified as "true", no unauthenticated traffic
//        // will make it to the route specified.
//        rejectUnauthorized: true
//    }
        );
app.configure('development', function () {
    app.use(express.logger('dev'));
    app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});
app.configure('production', function () {
    app.use(express.logger({stream: expressLogFile}));
    app.use(express.errorHandler());
});
// Configuration
app.configure(function () {
    app.set('port', process.env.PORT || global.conf.get('http:port'));
    app.use(compress());
    app.enable('trust proxy');
    app.use(i18n.handle);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.locals.pretty = true;
    app.use(express.favicon(__dirname + '/public/images/favicon.ico', {maxAge: 25920000000}));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use('/locales', express.static(__dirname + '/locales'));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use('/media', express.static(global.conf.get('media:path')));
    app.use('/symbols', express.static(global.conf.get('media:symbols')));
    app.use('/web', express.static(__dirname + '/web'));
    app.use(app.router);
    app.use(function (err, req, res, next) {
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
routes.setup(app);
function start() {
    app.listen(app.get('port'), function () {
        console.log("Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
    });

}
exports.start = start;
exports.app = app;
exports.pool = global.pool;
exports.bag = global.bag;

