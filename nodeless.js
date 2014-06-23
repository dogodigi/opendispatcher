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
var http = require('http');
var fsutil = require('./nodeless/nodejs/fsutil.js');

/**
 * Exports data for plain-html offline viewer.
 */

global.conf = require('nconf');

// First consider commandline arguments and environment variables, respectively.
global.conf.argv().env();

// Then load configuration from a designated file.
global.conf.file({ file: 'config.json' });

var dbURL = 'postgres://' +
        global.conf.get('database:user') + ':' +
        global.conf.get('database:password') + '@' +
        global.conf.get('database:host') + ':' +
        global.conf.get('database:port') + '/' +
        global.conf.get('database:dbname');

console.log("Removing output dir...");

var outDir = path.resolve(__dirname, "nodeless_output");

try {
    fsutil.rmdirRecursiveSync(outDir);
} catch(e) {
	if(e.code !== 'ENOENT') {
        throw e;
    }
}
fs.mkdirSync(outDir);

var mediaPath = global.conf.get('media:path');
var symbolPath = global.conf.get('media:symbols');

console.log("Copying media from %s...", mediaPath);
var copyOptions = {}; //{ onFileCopy: function(from, to) { console.log("  " + to); } };
fsutil.copyRecursiveSync(mediaPath, outDir + '/media', copyOptions);
console.log("Copying symbols from %s...", symbolPath);
fsutil.copyRecursiveSync(symbolPath, outDir + '/symbols', copyOptions);

console.log("Copy public...");
fsutil.copyRecursiveSync('./public', outDir, copyOptions);

// TODO: do what compressjs.sh does (in JS code?)
fs.unlink(outDir + '/compressjs.sh');

console.log("Copy i18next...");
fs.mkdirSync(outDir + '/i18next');
fs.writeFileSync(outDir + '/i18next/i18next.js', fs.readFileSync('./node_modules/i18next/lib/dep/i18next.js'));

console.log("Copy locales...");
fs.mkdirSync(outDir + '/locales');
fsutil.copyRecursiveSync('./locales', outDir + '/locales', copyOptions);

console.log("Copy html...");
fsutil.copyRecursiveSync('./nodeless/html', outDir , copyOptions);

console.log("Create api/organisation.json...");
fs.mkdirSync(outDir + '/api');
var dbk = require('./controllers/dbk.js');
var anyDB = require('any-db');
global.pool = anyDB.createPool(dbURL, {min: 2, max: 20});

var organisationsDone = false, featuresDone = false, objectsToBeWritten = null;

dbk.getOrganisation(
        {params: {id: 0}, query: {srid: 28992}},
{json: function(json) {
        if (json.organisation) {

            var legendsToBeDownloaded = null;

            // cache legends locally
	        if(json.organisation.wms) {
                legendsToBeDownloaded = 0;
	            for(var i in json.organisation.wms) {
                    var wms = json.organisation.wms[i];

	                if(typeof wms.legend === "string") {
                        fs.mkdirSync(outDir + "/legend");
                        legendsToBeDownloaded++;

                        (function downloadLegend(wms) {
                            var ext = wms.legend.split(".").pop();
                            var filename = outDir + "/legend/" + wms.gid + "." + ext;
                            var file = fs.createWriteStream(filename);
                            console.log("Caching legend for WMS %s from URL %s to %s...", wms.name, wms.legend, "legend/" + wms.gid + "." + ext);

                            function downloadError(msg) {
                                file.close(function() {
                                    fs.unlink(filename);
                                });
                                console.log("Error loading legend from %s: %s", wms.legend, msg);
                                legendsToBeDownloaded--;
                            }

                            http.get(wms.legend, function(response) {
                                if(response.statusCode === 200) {
                                    response.pipe(file);
                                    file.on('finish', function() {
                                        file.close(function() {
                                            legendsToBeDownloaded--;
                                            // assume relative URL works in offline viewer
                                            wms.legend = "legend/" + wms.gid + "." + ext;
                                        });
                                    });
                                } else {
                                    downloadError("HTTP status: " + response.statusCode);
                                }
                            }).on('error', function(err) {
                                downloadError(err.message);
                            });
                        })(wms);
                    }
                }
            }
        } else {
            console.log('An error occured, could not get organisation.json');
        }
        (function checkLegends(fn) {
	            if(legendsToBeDownloaded !== null) {
	                if(legendsToBeDownloaded !== 0) {
	                    setTimeout(function() { checkLegends(fn) }, 50);
                } else {
                    fn();
                }
            } else {
                fn();
            }
        })(function() {
            fs.writeFileSync(outDir + '/api/organisation.json', JSON.stringify(json));
            organisationsDone = true;
        });
    }
}
);

var features;

console.log("Create api/features.json...");
fs.mkdirSync(outDir + '/api/object');
dbk.getFeatures(
	{ query: { srid: 28992 } }, 
	{ json: function(json) {
        features = json;
        fs.writeFileSync(outDir + '/api/features.json', JSON.stringify(features));

        // write all /api/object/:id.json files

        objectsToBeWritten = features.features.length;
        console.log("DBK objects: " + objectsToBeWritten);

			for(var i in features.features) {
            var feature = features.features[i];

				if(feature.properties.identificatie) {
					var filename = outDir + '/api/object/' + feature.properties.identificatie + '.json';

                var writeDbkObject = function(filename, identificatie) {
                    var req = {
							query: { srid: 28992 },
							params: { id: identificatie }
                    };

						dbk.getObject(req, { json: 
                        function(json) {
                            // XXX can't detect error...
								fs.writeFile(filename, JSON.stringify(json), function(err) {
									if(err) throw err;
                                    objectsToBeWritten--;
                                });
                        }
                    });
					}

                writeDbkObject(filename, feature.properties.identificatie);

            } else {
                console.log("Error: feature has no identificatie property", feature);
                objectstoBeWritten--;
            }
        }

        featuresDone = true;
    }
}
);

// Ignore /api/gebied/ for now

function copyDeploy() {
    var deploy = global.conf.get("nodeless:deploy");
	if(deploy) {
        console.log("Copying files from deploy dir %s...", deploy);

        fsutil.copyRecursiveSync(deploy, outDir, copyOptions);
    }
}
function check() {
    if (organisationsDone && featuresDone && (objectsToBeWritten && objectsToBeWritten === 0)) {
        copyDeploy();
        console.log("Done");
        process.exit(0);
    } else {
        setTimeout(check, 10);
    }
}

process.nextTick(check);


