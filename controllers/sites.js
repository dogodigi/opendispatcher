var models = require('../models');
var express = require('express');
var router = express.Router();
router.route('/new/api/features.json')
  .get(function(req,res){
    var srid = req.query.srid || 4326;
    models.Site.findAll({
      group: [
        'Site.id', 'Site.name', 'Site.title', 'Site.checked', 'Site.assistance',// 'Levels.id'
      ],
      attributes:[
        'id',
        'name',
        'title',
        'checked',
        'assistance',
        [models.sequelize.literal('(SELECT COUNT(*) FROM opendispatcher."Levels" lvl where lvl."SiteId" = "Site"."id")'), 'levels'],
        [models.sequelize.literal('(SELECT ST_ASGEOJSON(ST_CENTROID(ST_UNION(ST_TRANSFORM("geometry", 4326))), 15, 2) ' +
          'from opendispatcher."Levels" lvl, "opendispatcher"."Buildings" bdg where lvl."id" = bdg."LevelId" ' +
          'AND bdg."deletedAt" IS NULL AND lvl."SiteId" = "Site"."id")'), 'the_geom']
        //[models.sequelize.fn('COUNT', models.sequelize.col('Levels.id')), 'levels'],
        //[models.sequelize.fn('ST_AsGeoJSON',
        //models.sequelize.fn('ST_CENTROID',
        //  models.sequelize.fn('ST_UNION',
        //  models.sequelize.fn('ST_TRANSFORM', models.sequelize.col('"Levels.Buildings.geometry"'),srid))), 15, 2
        //),
        //'the_geom']
      ],
      //include: [{
      //  model: models.Level,
      //  include: {model: models.Building, attributes: []},
      //  attributes: []
      //}]
    }).then(function(sites) {
      var features = [];
      for (var x in sites) {
        y = sites[x];
        var feat = {};
        console.log(y);
        feat.geometry = sites[x].the_geom;
        features.push(feat);
      }
      res.json({"type": "FeatureCollection", "features": features});
    });
  });

router.route('/new/api/sites')
  .get(function(req,res){
    var srid = req.query.srid || 4326;
    models.Site.findAll({
      group: [
        'Site.id', 'Site.name', 'Site.title', 'Site.checked', 'Site.assistance',// 'Levels.id'
      ],
      attributes:[
        'id',
        'name',
        'title',
        'checked',
        'assistance',
        [models.sequelize.literal('(SELECT COUNT(*) FROM opendispatcher."Levels" lvl where lvl."SiteId" = "Site"."id")'), 'levels'],
        [models.sequelize.literal('(SELECT ST_ASGEOJSON(ST_CENTROID(ST_UNION(ST_TRANSFORM("geometry", 4326))), 15, 2) ' +
          'from opendispatcher."Levels" lvl, "opendispatcher"."Buildings" bdg where lvl."id" = bdg."LevelId" ' +
          'AND bdg."deletedAt" IS NULL AND lvl."SiteId" = "Site"."id")'), 'the_geom']
        //[models.sequelize.fn('COUNT', models.sequelize.col('Levels.id')), 'levels'],
        //[models.sequelize.fn('ST_AsGeoJSON',
        //models.sequelize.fn('ST_CENTROID',
        //  models.sequelize.fn('ST_UNION',
        //  models.sequelize.fn('ST_TRANSFORM', models.sequelize.col('"Levels.Buildings.geometry"'),srid))), 15, 2
        //),
        //'the_geom']
      ],
      //include: [{
      //  model: models.Level,
      //  include: {model: models.Building, attributes: []},
      //  attributes: []
      //}]
    }).then(function(sites) {
      res.json(sites);
    });
  })
  .post(function(req,res){
    var site = {};
    for (var prop in req.body) {
      site[prop]=req.body[prop];
    }
    models.Site.create(site).then(function() {
      res.json({ message: 'Site created' });
    });
  });

router.route('/new/api/site/:id')
  .put(function(req,res){
    models.Site.findOrCreate({
      where: {id:req.params.id}},function(err,site){
      if(err)
        res.send(err);
      for(var prop in req.body){
        site[prop]=req.body[prop];
      }
      // save the Site
      site.save(function(err) {
        if (err)
          res.send(err);
        res.json({ message: 'Site updated!' });
      });
    });
  })
  .get(function(req,res){
    var srid = req.query.srid || 4326;
    models.Site.findOne({
      attributes: [
        'id',
        'name',
        'title'
        //['id', 'identificatie'],
        //['name', 'formeleNaam'],
        //['title', 'informeleNaam']
      ],
      include: [
        {
          model: models.Terrain,
          attributes: [
            [
              models.sequelize.fn('ST_AsGeoJSON',
                models.sequelize.fn('ST_TRANSFORM', models.sequelize.col('"Terrains.geometry"'),srid), 15, 2),
              'the_geom'
            ]
          ]
        },
        {
          model: models.Building,
          include:[
            {model: models.Floor,
              include: [{
                model: models.Hazard,
                attributes: [
                  'name',
                  'hin',
                  'un',
                  'quantity',
                  [
                    models.sequelize.fn('ST_AsGeoJSON',
                      models.sequelize.fn('ST_TRANSFORM', models.sequelize.col('"Buildings.Floors.Hazards.geometry"'),srid), 15, 2),
                    'the_geom'
                  ]
                ]
              }]
            }, {
              model: models.Address,
              attributes: [
                ['id', 'bagId'],
                ['street', 'openbareRuimteNaam'],
                ['housenumber', 'huisnummer'],
                ['place', 'woonplaatsNaam'],
                ['city', 'gemeenteNaam'],
                'postcode',
                [
                  models.sequelize.fn('ST_AsGeoJSON',
                    models.sequelize.fn('ST_TRANSFORM', models.sequelize.col('"Buildings.geometry"'),srid), 15, 2),
                  'the_geom'
                ]
              ]
            }
          ],
          attributes: [
            'id',
            [
              models.sequelize.fn('ST_AsGeoJSON',
                models.sequelize.fn('ST_TRANSFORM', models.sequelize.col('"Buildings.geometry"'),srid), 15, 2),
              'the_geom'
            ]
          ]
        }
      ],
      where: {id: req.params.id}
      }).then(function(site) {
        res.json(site);
      });
  })
  .delete(function(req,res){
    models.Site.destroy({
      where: {
        id: req.params.id
      }
    }).then(function() {
      res.json({ message: 'Successfully deleted' });
    });
  });

module.exports = router;
