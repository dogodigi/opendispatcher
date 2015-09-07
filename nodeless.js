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

console.log("Copy overrides...");
fs.mkdirSync(outDir + '/js/overrides');
fsutil.copyRecursiveSync('./nodeless/overrides/public', outDir + '/js/overrides', copyOptions);

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
{
    status: function() { return this; },
    json: function(json) {
        var legendsToBeDownloaded = null;
        if(json.organisation) {

            // cache legends locally
            if(json.organisation.wms) {
                legendsToBeDownloaded = 0;
                for(var i in json.organisation.wms) {
                    var wms = json.organisation.wms[i];

                    if(typeof wms.legend === "string") {
                        try {
	                       fs.mkdirSync(outDir + "/legend");
	            		} catch(e) {
                            if(e.code !== 'EEXIST') {
                                throw e;
                            }
                        }
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
            console.log('An error occured, could not get organisation.json', json);
        }
        (function checkLegends(fn) {
            if(legendsToBeDownloaded !== null) {
                if(legendsToBeDownloaded !== 0) {
                    setTimeout(function() { checkLegends(fn); }, 50);
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

var totalVerdiepingen = 0;

var skipObjects = false;

process.argv.slice(2).forEach(function(val, index, array) {
    if(val === "--skip-objects") {
        skipObjects = true;
    }
});

if(!skipObjects) {
    console.log("Create api/features.json...");
    fs.mkdirSync(outDir + '/api/object');
    fs.mkdirSync(outDir + '/api/gebied');
    dbk.getFeatures(
        { query: { srid: 28992 } },
        {
            status: function() { return this; },
            json: function(json) {
                if(!json.features) {
                    console.log("Error getting DBK features", json);
                    featuresDone = true;
                    objectsToBeWritten = 0;
                    return;
                }
                var features = json;
                fs.writeFileSync(outDir + '/api/features.json', JSON.stringify(features));

                // write all /api/object/:id.json files

                objectsToBeWritten = features.features.length;
                console.log("DBK objects: " + objectsToBeWritten);

                for(var i in features.features) {
                    var feature = features.features[i];

                    if(feature.properties.identificatie) {

                        var writeDbkObject = function(identificatie) {
                            function req(identif) {
                                return {
                                    query: { srid: 28992 },
                                    params: { id: identif }
                                };
                            }

                            var writeDbkJson = function(json, id) {
                                if(!json) {
                                    console.log("Geen JSON voor id  " + id);
                                    objectsToBeWritten--;
                                    return;
                                }
                                var filename;
                                if(json.DBKObject) {
                                    filename = outDir + '/api/object/' + json.DBKObject.identificatie + '.json';
                                } else {
                                    filename = outDir + '/api/gebied/' + json.DBKGebied.identificatie + '.json';
                                }
                                fs.writeFile(filename, JSON.stringify(json), function(err) {
                                    objectsToBeWritten--;
                                    if(err) throw err;
                                });
                            };

                            var getFunction;
                            if(feature.properties.typeFeature === "Object") {
                                getFunction = dbk.getObject;
                            } else {
                                getFunction = dbk.getGebied;
                            }

                            getFunction(req(identificatie), {
                                status: function() { return this; },
                                json: function(json) {

                                    if(!json) {
                                        console.log("Geen JSON voor id  " + id);
                                        objectsToBeWritten--;
                                        return;
                                    }

                                    // XXX can't detect error...
                                    writeDbkJson(json);

                                    // export verdiepingen
                                    if(json.hasOwnProperty("DBKObject") && json.DBKObject.verdiepingen) {
                                        for(var i in json.DBKObject.verdiepingen) {
                                            var verdieping = json.DBKObject.verdiepingen[i];
                                            if(verdieping.identificatie !== json.DBKObject.identificatie) {
                                                objectsToBeWritten++;
                                                totalVerdiepingen++;

                                                dbk.getObject(req(verdieping.identificatie), { json:
                                                    function(json) {
                                                        writeDbkJson(json);
                                                    }
                                                });
                                            }
                                        }
                                    }
                                }
                            });
                        };
                        writeDbkObject(feature.properties.identificatie);
                    } else {
                        console.log("Error: feature has no identificatie property", feature);
                        objectstoBeWritten--;
                    }
                }
                featuresDone = true;
            }
        }
    );
} else {
    featuresDone = true;
    objectsToBeWritten = 0;
}

// Ignore /api/gebied/ for now

function copyDeploy() {
    var deploy = global.conf.get("nodeless:deploy");
    if(deploy) {
        console.log("Copying files from deploy dir %s...", deploy);

        fsutil.copyRecursiveSync(deploy, outDir, copyOptions);
    }
}
function check() {
    if (organisationsDone && featuresDone && (objectsToBeWritten !== null && objectsToBeWritten === 0)) {
        if(totalVerdiepingen !== 0) {
            console.log("Verdiepingen: " + totalVerdiepingen);
        }
        copyDeploy();
        console.log("Done");
        process.exit(0);
    } else {
        setTimeout(check, 30);
    }
}

process.nextTick(check);
