cat js/libs/jquery-1.10.2.min.js \
    js/libs/jquery.pagination.js \
    js/libs/jquery.drags.js \
    js/libs/jquery.sortable.js \
    js/libs/jquery.xml2json.js \
    js/libs/proj4js-compressed.js \
    js/libs/OpenLayers-2.12.min.js \
    submodules/bootstrap/dist/js/bootstrap.js \
    js/libs/typeahead.min.js \
    js/libs/moment.min.js \
    js/libs/lang/nl.js \
    js/libs/daterangepicker.js \
    js/dbkjs/util.js \
    js/dbkjs/prototype/Class.js \
    js/dbkjs/prototype/Layer.js \
    js/dbkjs/layout.js \
    js/dbkjs/ui/gui.js \
    js/dbkjs/modules/geolocate.js \
    js/dbkjs/protocol/imdbk21.js \
    js/dbkjs/protocol/getCapabilities.js \
    js/dbkjs/modules/search.js \
    js/dbkjs/modules/help.js \
    js/dbkjs/modules/print.js \
    js/dbkjs/modules/object.js \
    js/dbkjs/modules/regio.js \
    js/dbkjs/modules/district.js \
    js/dbkjs/modules/gemeente.js \
    js/dbkjs/modules/preventie.js \
    js/dbkjs/modules/preparatie.js \
    js/dbkjs/modules/gevaren.js \
    js/dbkjs/modules/care.js \
    js/dbkjs/modules/filter.js \
    js/dbkjs/modules/bag.js \
    js/dbkjs/modules/feature.js \
    js/dbkjs/modules/measure.js \
    js/dbkjs/dbkjs.js | node_modules/uglify-js/bin/uglifyjs -o js/dbk.min.js
cat css/dbk.css \
    submodules/bootstrap/dist/css/bootstrap.min.css \
    submodules/Font-Awesome/css/font-awesome.min.css \
    css/daterangepicker-bs3.css \
    css/typeahead.js-bootstrap.css | node node_modules/clean-css/bin/cleancss -o css/dbk.min.css
