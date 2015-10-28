var express = require('express');
var router = express.Router();

/**
 * Render the Application from jade templates based upon parameters and configuration
 *
 * **Routes:**
 * * [/](/)
 * * [/index.html](/index.html)
 * @return {text/html}
 * @param {string} [mobile] - render as default or mobile enhanced
 * @param {string} [l] - language to render the application in. default can be configured in
 * config.json
 */
var getIndex = function index(req, res) {
  var activelang = req.i18n.language();
  var useFullscreen = false;
  var page = 'legacy/index';
  if (req.headers['x-opendispatcher-dn']) {
    var arr1 = req.headers['x-opendispatcher-dn'].split('/');
    var user = {};
    for (var i = 0; i < arr1.length; ++i) {
      var arr2 = arr1[i].split('=');
      user[arr2[0]] = arr2[1];
    }
  }
  if (req.query && (req.query.version === '4')) {
    page = 'viewer/index';
  }
  if (req.query && (req.query.mobile || req.query.mobile === '')) {
    useFullscreen = true;
  }
  useFullscreen = global.conf.get('default:fullscreen') || useFullscreen;
  var useBase64 = global.conf.get('default:base64') || false;
  res.render(page, {
    mylang: activelang,
    mode: req.app.get('env'),
    fullscreen: useFullscreen,
    "base64": useBase64
  });
};

/**
 * Proxy cross domain requests
 * **Routes:**
 * * [/proxy/](/proxy/)
 * @return {content}
 * @param {string} q - encoded url with optional parameters
 */
var allProxy = function(req, res) {
  if (req.query) {
    var options = {
      url: req.query.q,
      headers: {
        'User-Agent': 'opendispatcher'
      },
      timeout: 6000 //6 seconds
    };
    var request = require('request');
    var x = request(options);
    req.pipe(x);
    x.pipe(res);
    x.on('error', function(err) {
      res.status(400).json({
        "error": "Timeout on proxy"
      });
    });
  } else {
    res.status(400).json({
      "error": "wrong use of proxy"
    });
  }
};

var manager = function(req, res) {
    var activelang;
    activelang = req.i18n.language();
    if (req.headers['x-opendispatcher-dn']) {
        var arr1 = req.headers['x-opendispatcher-dn'].split('/');
        var user = {};
        for (var i = 0; i < arr1.length; ++i) {
            var arr2 = arr1[i].split('=');
            user[arr2[0]] = arr2[1];
        }
    }
    res.render('manager/index', {mylang: activelang, mode: req.app.get('env')});
};

var template = function(req,res){
    var activelang;
    activelang = req.i18n.language();
    if (req.headers['x-opendispatcher-dn']) {
        var arr1 = req.headers['x-opendispatcher-dn'].split('/');
        var user = {};
        for (var i = 0; i < arr1.length; ++i) {
            var arr2 = arr1[i].split('=');
            user[arr2[0]] = arr2[1];
        }
    }
    res.render(req.params.environment + '/templates/' + req.params.name, {mylang: activelang, mode: req.app.get('env')});
  };

var templateFunction = function(req,res){
    var activelang;
    activelang = req.i18n.language();
    if (req.headers['x-opendispatcher-dn']) {
        var arr1 = req.headers['x-opendispatcher-dn'].split('/');
        var user = {};
        for (var i = 0; i < arr1.length; ++i) {
            var arr2 = arr1[i].split('=');
            user[arr2[0]] = arr2[1];
        }
    }
    res.render(req.params.environment + '/templates/' + req.params.name, {functiontype: req.params.function, mylang: activelang, mode: req.app.get('env')});
  };

router.route('/').get(getIndex);
router.route('/index.html').get(getIndex);
router.route('/proxy/').all(allProxy);
router.route('/manager').get(manager);
router.route('/templates/:environment/:name').get(template);
router.route('/templates/:environment/:name/:function').get(templateFunction);
module.exports = router;
