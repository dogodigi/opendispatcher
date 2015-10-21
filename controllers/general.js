var express = require('express');
var router = express.Router();

router.route('/')
  .get(function index(req, res) {
    var activelang = req.i18n.language();
    var useFullscreen = false;
    if (req.headers['x-opendispatcher-dn']) {
        var arr1 = req.headers['x-opendispatcher-dn'].split('/');
        var user = {};
        for (var i = 0; i < arr1.length; ++i) {
            var arr2 = arr1[i].split('=');
            user[arr2[0]] = arr2[1];
        }
    }
    if (req.query && (req.query.mobile || req.query.mobile === '')) {
        console.log('generating mobile index.html');
        useFullscreen = true;
    }
    useFullscreen = global.conf.get('default:fullscreen') || useFullscreen;
    var useBase64 = global.conf.get('default:base64') || false;
    res.render('index', {mylang: activelang, mode: req.app.get('env'), fullscreen: useFullscreen, "base64": useBase64 });
  });

router.route('/proxy/')
  .all( function (req, res) {
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
      x.on('error', function (err) {
        res.status(400).json({
          "error": "Timeout on proxy"
        });
      });
    } else {
      res.status(400).json({"error": "wrong use of proxy"});
    }
  });


function eughs (req, res) {
  res.render('eughs', {title: 'eughs', source_url: "http://stoffen-info.nl/onderwerpen/eu-ghs/kort/"});
}

function nen1414(req, res) {
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

router.route('eughs.html').get(eughs);
router.route('nen1414.html').get(nen1414);


module.exports = router;
