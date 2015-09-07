/**
 *  Copyright (c) 2014 B3Partners B.V. (info@b3partners.nl)
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
var startDir = process.argv.length > 2 ? process.argv[2] : "public";

var imagesDir = path.resolve(__dirname, startDir + "/images");

var ignore = ["brandweer-nederland_alpha_shaded.png", "brandweer-nederland_alpha_shaded-s.png", "doiv_logo_def.png", "missing.gif",
    "MNarrow.png", "overview_replacement.gif"];

function convertRecursive(dir, id) {
	var files = fs.readdirSync(dir);

	for(var f in files) {
		var fn = files[f];
		var stats = fs.statSync(dir + '/' + fn);
		if(stats.isFile()) {
		    if(ignore.indexOf(fn) == -1) {
                console.log(id + fn);
    		    imagesBase64[id + fn] = "data:image/png;base64," + new Buffer(fs.readFileSync(dir + '/' + fn)).toString('base64');
    		}
		} else if(stats.isDirectory()) {
			convertRecursive(dir + '/' + fn , id + fn + '/');
		}
	}
}

convertRecursive(imagesDir, "images/");

fs.writeFileSync(path.resolve(__dirname, startDir + '/js/dbkjs/images_base64.js'), "var imagesBase64 = " + JSON.stringify(imagesBase64));



