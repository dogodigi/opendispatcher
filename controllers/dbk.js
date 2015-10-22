/*!
 *  Copyright (c) 2014 Milo van der Linden (milo@dogodigi.net)
 *
 *  This file is part of opendispatcher/safetymapsDBK
 *
 *  opendispatcher is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  opendispatcher is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with opendispatcher. If not, see <http://www.gnu.org/licenses/>.
 *
 */

/* global exports, global */
var express = require('express');
var router = express.Router();
var util = require('../helpers/util.js');

/**
 * Get the settings for the organisation from the database based on
 * the database connection defined in config.json or config.default.json
 *
 * **Routes:**
 * * [/api/organisation.json](/api/organisation.json)
 * @return {json} [Express res.json()]{@link http://expressjs.com/api.html#res.json}
 * @param {integer} [srid=4326] - The EPSG projection for geometry
 * @param req {Request} [Express request object]{@link http://expressjs.com/api.html#req}
 * @param res {Response} [Express response object]{@link http://expressjs.com/api.html#res}
 */
var getOrganisation = function(req, res) {
  if (req.query) {
    var srid = req.query.srid;
    if (!srid) {
      srid = 4326;
    }
    var query_str = 'select "organisation" from organisation.organisation_json($1)';
    global.pool.query(query_str, [srid],
      function(err, result) {
        if (err) {
          res.status(400).json(err);
        } else {
          res.json(util.removeNulls(result.rows[0]));
        }
        return;
      }
    );
  }
};

/**
 * Select a Site
 *
 * **Routes:**
 * * [/api/object/:id](/api/object/:id)
 * * [/api/object/:id.json](/api/object/:id.json)
 * * [/api/site/:id](/api/site/:id)
 * * [/api/site/:id.json](/api/site/:id.json)
 * @return {json} [Express res.json()]{@link http://expressjs.com/api.html#res.json}
 * @param {integer} id - id for the Site
 * @param {integer} [srid=4326] - The EPSG projection for geometry
 * @param req {Request} [Express request object]{@link http://expressjs.com/api.html#req}
 * @param res {Response} [Express response object]{@link http://expressjs.com/api.html#res}
 */
var getSite = function(req, res) {
  if (req.query) {
    var id = req.params.id;
    var srid = req.query.srid;
    if (!srid) {
      srid = 4326;
    }
    var query_str = 'select "DBKObject" from dbk.dbkobject_json($1,$2) limit 1';
    global.pool.query(query_str, [id, srid],
      function(err, result) {
        if (err) {
          res.status(400).json(err);
        } else {
          if (result.rows.length === 1) {
            res.json(util.removeNulls(result.rows[0]));
          } else {
            res.json({});
          }
        }
        return;
      }
    );
  }
};

/**
 * Get an array containing all Sites with limited properties
 *
 * **Routes:**
 * * [/api/object/:id](/api/object/:id)
 * * [/api/object/:id.json](/api/object/:id.json)
 * * [/api/site/:id](/api/site/:id)
 * * [/api/site/:id.json](/api/site/:id.json)
 * @return {json} [Express res.json()]{@link http://expressjs.com/api.html#res.json}
 * @param {integer} [srid=4326] - The EPSG projection for geometry
 * @param req {Request} [Express request object]{@link http://expressjs.com/api.html#req}
 * @param res {Response} [Express response object]{@link http://expressjs.com/api.html#res}
 */
var getSites = function(req, res) {
  if (req.query) {
    var srid = req.query.srid;
    if (!srid) {
      srid = 4326;
    }
    var query_str = 'select "feature" from dbk.dbkfeatures_json($1)';
    global.pool.query(query_str, [srid],
      function(err, result) {
        if (err) {
          res.status(400).json(err);
        } else {
          var resultset = {
            "type": "FeatureCollection",
            "features": []
          };

          for (var i = 0; i < result.rows.length; ++i) {
            var item = {
              type: 'Feature',
              id: 'DBKFeature.gid--' + result.rows[i].feature.gid
            };
            item.geometry = result.rows[i].feature.geometry;
            item.properties = result.rows[i].feature;
            delete item.properties.geometry;
            resultset.features.push(item);
          }
          res.json(util.removeNulls(resultset));
        }
        return;
      }
    );
  }
};
/**
 * Select a Terrain
 *
 * **Routes:**
 * * [/api/gebied/:id](/api/gebied/:id)
 * * [/api/gebied/:id.json](/api/gebied/:id.json)
 * * [/api/terrain/:id](/api/terrain/:id)
 * * [/api/terrain/:id.json](/api/terrain/:id.json)
 * @return {json} [Express res.json()]{@link http://expressjs.com/api.html#res.json}
 * @param {integer} id - id for the Terrain
 * @param {integer} [srid=4326] - The EPSG projection for geometry
 * @param req {Request} [Express request object]{@link http://expressjs.com/api.html#req}
 * @param res {Response} [Express response object]{@link http://expressjs.com/api.html#res}
 */
var getTerrain = function(req, res) {
  if (req.query) {
    var id = req.params.id;
    var srid = req.query.srid;
    if (!srid) {
      srid = 4326;
    }
    var query_str = 'select "DBKGebied" from dbk.dbkgebied_json($1,$2) limit 1';
    global.pool.query(query_str, [id, srid],
      function(err, result) {
        if (err) {
          res.status(400).json(err);
        } else {
          if (result.rows.length === 1) {
            res.json(util.removeNulls(result.rows[0]));
          } else {
            res.json({});
          }
        }
        return;
      }
    );
  }
};

router.route('/api/site/:id').get(getSite);
router.route('/api/site/:id.json').get(getSite);
router.route('/api/object/:id').get(getSite);
router.route('/api/object/:id.json').get(getSite);
router.route('/api/gebied/:id').get(getTerrain);
router.route('/api/gebied/:id.json').get(getTerrain);
router.route('/api/terrain/:id').get(getTerrain);
router.route('/api/terrain/:id.json').get(getTerrain);
router.route('/api/organisation.json').get(getOrganisation);
router.route('/api/features.json').get(getSites);

module.exports = router;
