cat public/js/libs/jquery-1.10.2.min.js \
    public/js/libs/jquery.pagination.js \
    public/js/libs/jquery.drags.js \
    public/js/libs/jquery.sortable.js \
    public/js/libs/jquery.xml2json.js \
    public/js/libs/jquery.ui.touch-punch.js \
    public/js/libs/proj4js-compressed.js \
    public/js/libs/OpenLayers-2.12.min.js \
    public/submodules/bootstrap/dist/js/bootstrap.js \
    public/js/libs/typeahead.min.js \
    public/js/libs/moment.min.js \
    public/js/libs/lang/nl.js \
    public/js/libs/daterangepicker.js \
    public/js/dbkjs/util.js \
    public/js/dbkjs/prototype/Class.js \
    public/js/dbkjs/prototype/Layer.js \
    public/js/dbkjs/prototype/Capabilities.js \
    public/js/dbkjs/layout.js \
    public/js/dbkjs/ui/gui.js \
    public/js/dbkjs/modules/geolocate.js \
    public/js/dbkjs/protocol/imdbk21.js \
    public/js/dbkjs/modules/search.js \
    public/js/dbkjs/modules/help.js \
    public/js/dbkjs/modules/print.js \
    public/js/dbkjs/modules/object.js \
    public/js/dbkjs/modules/regio.js \
    public/js/dbkjs/modules/district.js \
    public/js/dbkjs/modules/gemeente.js \
    public/js/dbkjs/modules/preventie.js \
    public/js/dbkjs/modules/preparatie.js \
    public/js/dbkjs/modules/gevaren.js \
    public/js/dbkjs/modules/care.js \
    public/js/dbkjs/modules/filter.js \
    public/js/dbkjs/modules/bag.js \
    public/js/dbkjs/modules/feature.js \
    public/js/dbkjs/modules/measure.js \
    public/js/dbkjs/dbkjs.js | node_modules/uglify-js/bin/uglifyjs -o public/js/dbk.min.js
cat css/dbk.css \
    public/css/bootstrap.min.css \
    public/css/font-awesome.min.css \
    public/css/daterangepicker-bs3.css \
    public/css/typeahead.js-bootstrap.css | node node_modules/clean-css/bin/cleancss -o public/css/dbk.min.css
