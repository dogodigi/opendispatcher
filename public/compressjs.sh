#
#  Copyright (c) 2014 Milo van der Linden (milo@dogodigi.net)
# 
#  This file is part of safetymapDBK
#  
#  safetymapDBK is free software: you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.
#
#  safetymapDBK is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with safetymapDBK. If not, see <http://www.gnu.org/licenses/>.
 
# Load jquery first! not included in the compressed file 
cat js/libs/jquery.pagination.js \
    js/libs/jquery.drags.js \
    js/libs/jquery.sortable.js \
    js/libs/jquery.typeahead.js \
    js/libs/jquery.daterangepicker.js \
    js/dbkjs/util.js \
    js/dbkjs/config/styles.js \
    js/dbkjs/prototype/Class.js \
    js/dbkjs/prototype/Layer.js \
    js/dbkjs/prototype/Capabilities.js \
    js/dbkjs/layout.js \
    js/dbkjs/modules/geolocate.js \
    js/dbkjs/protocol/jsonDBK.js \
    js/dbkjs/modules/search.js \
    js/dbkjs/modules/support.js \
    js/dbkjs/modules/print.js \
    js/dbkjs/modules/care.js \
    js/dbkjs/modules/filter.js \
    js/dbkjs/modules/bag.js \
    js/dbkjs/modules/feature.js \
    js/dbkjs/modules/measure.js \
    js/dbkjs/modules/layertoggle.js \
    js/dbkjs/modules/gms.js \
    js/dbkjs/dbkjs.js | node ../node_modules/uglify-js/bin/uglifyjs -o js/dbk.min.js

cat css/dbk.css \
    js/libs/bootstrap-3.1.0/css/bootstrap.min.css \
    css/font-awesome.min.css \
    css/daterangepicker-bs3.css \
    css/typeahead.js-bootstrap.css \
    css/slider.css | node ../node_modules/clean-css/bin/cleancss -o css/dbk.min.css
