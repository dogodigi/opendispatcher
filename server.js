var express = require('express'),
        routes = require('./routes'),
        http = require('http'),
        path = require('path'),
        i18n = require('i18next'),
        dbk = require('./controllers/dbk.js');
var anyDB = require('any-db');

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
global.pool = anyDB.createPool(dbURL, {min: 2, max: 20});
var app = express();

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
    app.use(require('less-middleware')({
        src: __dirname + '/less',
        dest: __dirname + '/public',
        prefix: '/public',
        debug: true
    }));

    app.use(express.bodyParser());

    app.use(express.methodOverride());
    app.use(express.static(path.join(__dirname, 'public')));
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
app.get('/api/object/:id', dbk.getDBKObject);
app.get('/api/gebied/:id', dbk.getDBKGebied);
app.get('/data/regio.json', routes.regio);
//app.post('/v', routes.validate_POST);
//app.get('/v/:token', routes.validate_GET);
//app.all('/geoserver/:service',routes.gs_service);
//app.all('/geoserver/:workspace/:service',routes.gs_workspace);
//app.all('/bag/:service',routes.bag_service);
app.get('/eughs.html', routes.eughs);
app.get('/nen1414.html', routes.nen1414);
// Create an HTTP service.
http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});



