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

var fs = require('fs');
var xml = require('xml');

/**
 * Exports symbols data to XML.
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

var dbk = require('./controllers/dbk.js');
var anyDB = require('any-db');
global.pool = anyDB.createPool(dbURL, {min: 2, max: 20});

function rowsToXml(rows, element, groupElement) {
    var xo = { };
    xo[groupElement] = [];
    for(var i in rows) {
        var r = rows[i];
        var ro = { };
        ro[element] = [];
        for(var k in r) {
            if(r[k]) {
                var o = {};
                o[k] = r[k];
                ro[element].push(o);
            }
        }
        xo[groupElement].push(ro);
    }
    return xml(xo, true) + "\n";
}

function getQueryXml(query, element, groupElement, cb) {
    global.pool.query(query,
        function(err, result){
            if(err) {
                console.log(err);
                process.exit(1);
            } else {
                cb(rowsToXml(result.rows, element, groupElement));
            }
        }
    );
}

var myxml = "<?xml-stylesheet type='text/xsl' href='symbols.xsl'?>\n<data>\n";

var query1 = 'select gid,brandweervoorziening_symbool as type, naam, namespace, categorie, omschrijving from dbk.type_brandweervoorziening order by namespace,  brandweervoorziening_symbool';
var query2 = 'select gid,gevaarlijkestof_symbool as type, naam, namespace, \'repressief\' as categorie from dbk.type_gevaarlijkestof order by namespace, gevaarlijkestof_symbool';

getQueryXml(query1, 'symbol', 'symbols', function(s1) {
    myxml += s1;
    
    getQueryXml(query2, 'stof', 'stoffen', function(s2) {
        myxml += s2;
        
        myxml += "</data>\n";
        fs.writeFileSync('symbols.xml', myxml);
        process.exit(0);
    });
});

