var models = require('../models');
var express = require('express');
var router = express.Router();

router.route('/new/api/organizations')
  .get(function(req,res){
    var srid = req.query.srid || 4326;
    models.Organization.findAll()
      .then(function(organizations) {
        if(organizations) {
          res.json(organizations);
        } else {
          res.status(400).json({error: 'Error occured'});
        }
      });
  });

router.route('/new/api/organization/:id')
  .get(function(req,res){
    var srid = req.query.srid || 4326;
    models.Organization.findById(req.params.id, {
      include: [
        {
          model: models.Region,
          attributes: [
            'id',
            [
              models.sequelize.fn('ST_AsGeoJSON',
                models.sequelize.fn('ST_TRANSFORM', models.sequelize.col('"Region.geometry"'),srid), 15, 2),
              'the_geom'
            ]
          ]
        },
        models.Layer
      ]
    }).then(function(organization) {
      if(organization) {
        res.json(organization);
      } else {
        res.status(400).json({error: 'notFound'});
      }
    });
  });

module.exports = router;
