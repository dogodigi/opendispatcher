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

/* fs utility functions */

var fs = require('fs');

exports.rmdirRecursiveSync = function(dir) {
	var files = fs.readdirSync(dir);

	for(var f in files) {
		var fn = files[f];
		var stats = fs.statSync(dir + '/' + fn);
		if(stats.isFile()) {
			fs.unlinkSync(dir + '/' + fn);
		} else if(stats.isDirectory()) {
			this.rmdirRecursiveSync(dir + '/' + fn);
		}
	}
	fs.rmdirSync(dir);
}

exports.copyRecursiveSync = function(from, to, options) {
	if(typeof options == 'undefined') {
		options = {};
	}
	if(typeof options.onFileCopy == 'undefined') {
		options.onFileCopy = function() {};
	}
	if(typeof options.onRecurseDirectory == 'undefined') {
		options.onRecurseDirectory = function() {};
	}
	
	if(!fs.existsSync(to)) {
		fs.mkdirSync(to);
	}
	var files = fs.readdirSync(from);

	for(var f in files) {
		var fn = files[f];
		var stats = fs.statSync(from + '/' + fn);
		if(stats.isFile()) {
			options.onFileCopy(from + '/' + fn, to + '/' + fn);
			fs.writeFileSync(to + '/' + fn, fs.readFileSync(from + '/' + fn));
		} else if(stats.isDirectory()) {
			options.onRecurseDirectory(from + '/' + fn);
			this.copyRecursiveSync(from + '/' + fn, to + '/' + fn, options);
		}
	}
}
