/* global global, module */
global.conf = require('nconf');
global.conf.argv().env();
global.conf.file({
  file: 'config.json'
});
var mediaPath = global.conf.get('media:path') + '/**';
var symbolPath = global.conf.get('media:symbols' + '/**');
var dbURL = 'postgres://' +
  global.conf.get('database:user') + ':' +
  global.conf.get('database:password') + '@' +
  global.conf.get('database:host') + ':' +
  global.conf.get('database:port') + '/' +
  global.conf.get('database:dbname');
var dbkcontroller = require('./controllers/dbk.js');
var anyDB = require('any-db');
global.pool = anyDB.createPool(dbURL, {
  min: 2,
  max: 20
});

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sync: {
      desktop: {
        files: [
          {
            src: [mediaPath],
            dest: 'build/desktop/media/'
          },
          {
            src: [symbolPath],
            dest: 'build/desktop/symbols/'
          }
        ]
      },
      mobile: {
        files: [
          {
            src: [mediaPath],
            dest: 'build/mobile/media/'
          },
          {
            src: [symbolPath],
            dest: 'build/mobile/symbols/'
          }
        ]
      }
    },
    copy: {
      desktop: {
        files: [{
          cwd: 'public/images',
          src: ['**'],
          dest: 'build/desktop/images',
          expand: true
        }, {
          cwd: 'public/data',
          src: ['organisation.sample.json'],
          dest: 'build/desktop/data',
          expand: true
        }, {
          cwd: 'public/js',
          src: [
            'dbk.min.js',
            'dbkjs/config/options-nl.js'
          ],
          dest: 'build/desktop/js',
          expand: true
        }, {
          cwd: 'public/js/libs',
          src: [
            'jquery-1.11.0/jquery-1.11.0.min.js',
            'bootstrap-3.2.0-dist/js/bootstrap.min.js',
            'bootstrap-slider.js',
            'proj4js-compressed.js',
            'OpenLayers-2.13.1/OpenLayers.js',
            'moment/moment.min.js',
            'moment/lang/nl.js'
          ],
          dest: 'build/desktop/js/libs',
          expand: true
        }, {
          cwd: 'public/font-awesome-4.1.0/css',
          src: ['font-awesome.min.css'],
          dest: 'build/desktop/font-awesome-4.1.0/css',
          expand: true
        }, {
          cwd: 'public/font-awesome-4.1.0/fonts',
          src: ['*'],
          dest: 'build/desktop/font-awesome-4.1.0/fonts',
          expand: true
        }, {
          cwd: 'public/css',
          src: ['dbk.min.css'],
          dest: 'build/desktop/css',
          expand: true
        }, {
          cwd: 'locales',
          src: ['**'],
          dest: 'build/desktop/locales',
          expand: true
        }, {
          cwd: 'node_modules/i18next-client',
          src: ['i18next.js'],
          dest: 'build/mobile/i18next',
          expand: true
        }]
      },
      mobile: {
        files: [{
          cwd: 'public/images',
          src: ['**'],
          dest: 'build/mobile/images',
          expand: true
        }, {
          cwd: 'public/data',
          src: ['organisation.sample.json'],
          dest: 'build/mobile/data',
          expand: true
        }, {
          cwd: 'public/js',
          src: [
            'dbk.mobile.min.js'
          ],
          rename: function(dest, src) {
            return dest + '/dbk.min.js';
          },
          dest: 'build/mobile/js',
          expand: true
        }, {
          cwd: 'public/js',
          src: [
            'dbkjs/config/options_mobile.js'
          ],
          dest: 'build/mobile/js',
          expand: true
        }, {
          cwd: 'public/js/libs',
          src: [
            'jquery-1.11.0/jquery-1.11.0.min.js',
            'bootstrap-3.2.0-dist/js/bootstrap.min.js',
            'bootstrap-slider.js',
            'proj4js-compressed.js',
            'OpenLayers-2.13.1/OpenLayers.js',
            'moment/moment.min.js',
            'moment/lang/nl.js',
            'modernizr.custom.12819.js',
            'fastclick.min.js'
          ],
          dest: 'build/mobile/js/libs',
          expand: true
        }, {
          cwd: 'public/font-awesome-4.1.0/css',
          src: ['font-awesome.min.css'],
          dest: 'build/mobile/font-awesome-4.1.0/css',
          expand: true
        }, {
          cwd: 'public/font-awesome-4.1.0/fonts',
          src: ['*'],
          dest: 'build/mobile/font-awesome-4.1.0/fonts',
          expand: true
        }, {
          cwd: 'public/css',
          src: ['dbk.mobile.min.css'],
          dest: 'build/mobile/css',
          rename: function(dest, src) {
            return dest + '/dbk.min.css';
          },
          expand: true
        }, {
          cwd: 'locales',
          src: ['**'],
          dest: 'build/mobile/locales',
          expand: true
        }, {
          cwd: 'node_modules/i18next-client',
          src: ['i18next.js'],
          dest: 'build/mobile/i18next',
          expand: true
        }]
      }
    },
    uglify: {
      desktop: {
        options: {
          banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %> */ \n' +
            'var dbkjsbuildinfo = {};\n' +
            'dbkjsbuildinfo.VERSION = "<%= pkg.version %>";\n' +
            'dbkjsbuildinfo.RELEASEDATE = "<%= grunt.template.today("yyyy-mm-dd") %>";\n' +
            'dbkjsbuildinfo.APPLICATION = "<%= pkg.name %>";\n' +
            'dbkjsbuildinfo.REMARKS = "<%= pkg.description %>";\n'
        },
        files: {
          'public/js/dbk.min.js': [
            'public/js/libs/jquery.pagination.js',
            'public/js/libs/jquery.drags.js',
            'public/js/libs/jquery.sortable.js',
            'public/js/libs/jquery.typeahead.js',
            'public/js/libs/jquery.daterangepicker.js',
            'public/js/dbkjs/util.js',
            'public/js/dbkjs/config/styles.js',
            'public/js/dbkjs/prototype/Class.js',
            'public/js/dbkjs/prototype/Layer.js',
            'public/js/dbkjs/prototype/Capabilities.js',
            'public/js/dbkjs/layout.js',
            'public/js/dbkjs/modules/geolocate.js',
            'public/js/dbkjs/protocol/jsonDBK.js',
            'public/js/dbkjs/modules/search.js',
            'public/js/dbkjs/modules/support.js',
            'public/js/dbkjs/modules/print.js',
            'public/js/dbkjs/modules/care.js',
            'public/js/dbkjs/modules/filter.js',
            'public/js/dbkjs/modules/bag.js',
            'public/js/dbkjs/modules/feature.js',
            'public/js/dbkjs/modules/measure.js',
            'public/js/dbkjs/modules/layertoggle.js',
            'public/js/dbkjs/modules/gms.js',
            'public/js/dbkjs/gui.js',
            'public/js/dbkjs/layers.js',
            'public/js/dbkjs/mapcontrols.js',
            'public/js/dbkjs/dbkjs.js',
            'public/js/dbkjs/docready.js'
          ]
        }
      },
      mobile: {
        options: {
          banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %> */ \n' +
            'var dbkjsbuildinfo = {};\n' +
            'dbkjsbuildinfo.VERSION = "<%= pkg.version %>";\n' +
            'dbkjsbuildinfo.RELEASEDATE = "<%= grunt.template.today("yyyy-mm-dd") %>";\n' +
            'dbkjsbuildinfo.APPLICATION = "<%= pkg.name %>";\n' +
            'dbkjsbuildinfo.REMARKS = "<%= pkg.description %>";\n'
        },
        files: {
          'public/js/dbk.mobile.min.js': [
            'public/js/libs/jquery.pagination.js',
            'public/js/libs/jquery.drags.js',
            'public/js/libs/jquery.sortable.js',
            'public/js/libs/jquery.typeahead.js',
            'public/js/libs/jquery.daterangepicker.js',
            'public/js/dbkjs/util.js',
            'public/js/dbkjs/config/styles.js',
            'public/js/dbkjs/prototype/Class.js',
            'public/js/dbkjs/prototype/Layer.js',
            'public/js/dbkjs/prototype/Capabilities.js',
            'public/js/dbkjs/layout.js',
            'public/js/dbkjs/modules/geolocate.js',
            'public/js/dbkjs/protocol/jsonDBK.js',
            'public/js/dbkjs/modules/search.js',
            'public/js/dbkjs/modules/support.js',
            'public/js/dbkjs/modules/feature.js',
            'public/js/dbkjs/modules/measure.js',
            'public/js/dbkjs/modules/layertoggle.js',
            'public/js/dbkjs/modules/gms.js',
            'public/js/dbkjs/modules/ealgps.js',
            'public/js/dbkjs/modules/connectionmonitor.js',
            'public/js/dbkjs/modules/livep2000.js',
            'public/js/dbkjs/modules/connectionmonitor.js',
            'public/js/dbkjs/modules/onscreenkeyboard.js',
            'public/js/dbkjs/modules/vrhincidenten.js',
            'public/js/dbkjs/gui.js',
            'public/js/dbkjs/layers.js',
            'public/js/dbkjs/mapcontrols.js',
            'public/js/dbkjs/dbkjs.js',
            'public/js/overrides/dbkjs.js',
            'public/js/overrides/feature.js',
            'public/js/overrides/gui.js',
            'public/js/overrides/jsonDBK.js',
            'public/js/overrides/layout.js',
            'public/js/overrides/mapcontrols.js',
            'public/js/overrides/search.js',
            'public/js/dbkjs/docready.js'
          ]
        }
      }
    },
    cssmin: {
      desktop: {
        files: {
          'public/css/dbk.min.css': [
            'public/css/dbk.css',
            'public/js/libs/bootstrap-3.2.0-dist/css/bootstrap.css',
            'public/css/daterangepicker-bs3.css',
            'public/css/typeahead.js-bootstrap.css',
            'public/css/slider.css'
          ]
        }
      },
      mobile: {
        files: {
          'public/css/dbk.mobile.min.css': [
            'public/css/dbkm.css',
            'public/js/libs/bootstrap-3.2.0-dist/css/bootstrap.css',
            'public/css/daterangepicker-bs3.css',
            'public/css/typeahead.js-bootstrap.css',
            'public/css/slider.css'
          ]
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-sync');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.registerTask('organisation:mobile', 'Export organisation settings to organisation.json in build', function() {
    var cb = this.async();

    dbkcontroller.getOrganisation({
      params: {
        id: 0
      },
      query: {
        srid: 28992
      }
    }, {
      json: function(json) {
        if (json.organisation) {
          //skip wms
          delete json.organisation.wms;
          json.organisation.wms = [];
          //skip care
          delete json.organisation.care;
          delete json.organisation.modules.care;
          grunt.file.write('build/mobile/api/organisation.json', JSON.stringify(json));
          cb();
        } else {
          cb('Could not create organisation.json');
        }

      }
    });
  });
  grunt.registerTask('features:mobile', 'Export features.json in build', function() {
    var cb = this.async();
    var srid = 28992;
    dbkcontroller.getFeatures({
      params: {
        id: 0
      },
      query: {
        srid: srid
      }
    }, {
      json: function(result) {
        grunt.file.write('build/mobile/api/features.json', JSON.stringify(result));
        // @todo loop through the features to grab single files and store them offline
        var featuresLength = Object.keys(result.features).length;
        console.log('features.json written. Parsing ' + featuresLength + ' features...');
        var i = 0;
        pace = require('pace')(featuresLength);
        result.features.forEach(function(f) {
          if (f.properties.typeFeature == 'Object') {
            controller = dbkcontroller.getObject;
          } else {
            controller = dbkcontroller.getGebied;
          }
          controller({
            params: {
              id: f.properties.identificatie
            },
            query: {
              srid: srid
            }
          }, {
            json: function(result2) {
              //console.log('result recieved - ' + f.properties.identificatie)
              grunt.file.write('build/mobile/api/' +
                f.properties.typeFeature.toLowerCase() + '/' +
                f.properties.identificatie +
                '.json', JSON.stringify(result2));
              //console.log(f.properties.identificatie);
              pace.op();
              ++i;
              if (i === (featuresLength)) {
                cb();
              }
            }
          });
        });
        // @todo loop through media and pull offline

      }
    });
  });
  grunt.registerTask('index:mobile', 'Export index page to index.html in build', function() {
    var cb = this.async();
    var request = require('supertest');
    var server = require('./server.js');
    server.app.set('env', 'production');
    request(server.app).get('/?mobile')
      .end(function(err, res) {
        if (err) {
          console.log("Could not create index.html");
          cb();
        } else {
          console.log('build/mobile/index.html created');
          grunt.file.write('build/mobile/index.html', res.text);
          cb();
        }
      });
  });
  grunt.registerTask('index:desktop', 'Export index page to index.html in build', function() {
    var cb = this.async();
    var request = require('supertest');
    var server = require('./server.js');
    server.app.set('env', 'production');
    request(server.app).get('/')
      .end(function(err, res) {
        if (err) {
          console.log("Could not create index.html");
          cb();
        } else {
          console.log('build/desktop/index.html created');
          grunt.file.write('build/desktop/index.html', res.text);
          cb();
        }
      });
  });
  grunt.registerTask('images2base64', 'Convert images to a javascript file with an array of base64 encoded images', function() {
    var path = require('path');
    var fs = require('fs');
    /**
     * Writes public/js/dbkjs/images_base64.js
     *
     * Include the above file to enable inline images, otherwise the regular files will be used.
     */

    var imagesBase64 = {};

    /* directory to process can be specified on command line, use "nodeless_output" to allow
     * images to be overridden in nodeless:config directory from config.json used by nodeless.js
     */
    var startDir = process.argv.length > 3 ? process.argv[3] : "public";
    var imagesDir = path.resolve(__dirname, startDir + "/images");
    var ignore = ["brandweer-nederland_alpha_shaded.png", "brandweer-nederland_alpha_shaded-s.png", "doiv_logo_def.png", "missing.gif",
      "MNarrow.png", "overview_replacement.gif"
    ];

    function convertRecursive(dir, id) {
      var files = fs.readdirSync(dir);
      for (var f in files) {
        var fn = files[f];
        var stats = fs.statSync(dir + '/' + fn);
        if (stats.isFile()) {
          if (ignore.indexOf(fn) == -1) {
            imagesBase64[id + fn] = "data:image/png;base64," + new Buffer(fs.readFileSync(dir + '/' + fn)).toString('base64');
          }
        } else if (stats.isDirectory()) {
          convertRecursive(dir + '/' + fn, id + fn + '/');
        }
      }
    }
    convertRecursive(imagesDir, "images/");
    fs.writeFileSync(path.resolve(__dirname, startDir + '/js/dbkjs/images_base64.js'), "var imagesBase64 = " + JSON.stringify(imagesBase64));
  });

  grunt.registerTask('desktop', ['cssmin:desktop', 'uglify:desktop', 'copy:desktop', 'index:desktop']);
  grunt.registerTask('mobile', ['cssmin:mobile', 'uglify:mobile', 'organisation:mobile', 'features:mobile', 'copy:mobile', 'index:mobile']);
};
