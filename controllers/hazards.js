var models = require('../models');
var express = require('express');
var router = express.Router();


// Get all Hazards
router.route('/new/api/hazards')
  .get(function(req,res){
    var srid = req.query.srid || 4326;
    //include floor and building. Lookup by SiteID via
    // Site
    // |-- Buildings
    //     \-- Floors
    // And use the array of floorId's to get all hazards for this site.
    models.Hazard.findAll({

    }).then(function(hazards) {
      if(hazards) {
        res.json(hazards);
      } else {
        res.status(400).json({error: 'notFound'});
      }
    });
  });

  router.route('/new/api/hazards/:id')
    .put(function(req,res){
      models.Hazard.findOrCreate({
        where: {id:req.params.id}},function(err,hazard){
        if(err)
          res.send(err);
        for(var prop in req.body){
          hazard[prop]=req.body[prop];
        }
        // save the Site
        Hazard.save(function(err) {
          if (err)
            res.send(err);
          res.json({ message: 'Updated' });
        });
      });
    })
    .get(function(req,res){
      models.Hazard.findOne({
        where: {id: req.params.id}
      }).then(function(hazard) {
          res.json(hazard);
        });
    })
    .delete(function(req,res){
      models.Hazard.destroy({
        where: {
          id: req.params.id
        }
      }).then(function() {
        res.json({ message: 'Deleted' });
      });
    });

  // Get all Hazards per Site
  router.route('/new/api/site/:id/hazards')
    .get(function(req,res){
      var srid = req.query.srid || 4326;
      //include floor and building. Lookup by SiteID via
      // Site
      // |-- Buildings
      //     \-- Floors
      // And use the array of floorId's to get all hazards for this site.
      models.Hazard.findAll({
        include: [
          models.HazardType,
          models.Unit,
          {
            model: models.Floor,
            include: [{
              model: models.Building,
              where: {SiteId: req.params.id},
              include: [{
                model: models.Site
              }]
            }]
          }
        ]
      }).then(function(hazards) {
        if(hazards) {
          res.json(hazards);
        } else {
          res.status(400).json({error: 'notFound'});
        }
      });
    });
    // Get all Hazards per Site per Building
    router.route('/new/api/site/:id/building/:id2/hazards')
      .get(function(req,res){
        var srid = req.query.srid || 4326;
        //include floor and building. Lookup by SiteID via
        // Site
        // |-- Buildings
        //     \-- Floors
        // And use the array of floorId's to get all hazards for this site.
        models.Hazard.findAll({
          include: [
            models.HazardType,
            models.Unit,
            {
              model: models.Floor,
              include: [{
                model: models.Building,
                where: {id: req.params.id2, SiteId: req.params.id},
                include: [{
                  model: models.Site
                }]
              }]
            }
          ]
        }).then(function(hazards) {
          if(hazards) {
            res.json(hazards);
          } else {
            res.status(400).json({error: 'notFound'});
          }
        });
      });
      // Get all Hazards per Site per Building
      router.route('/new/api/site/:id/building/:id2/floor/:id3/hazards')
        .get(function(req,res){
          var srid = req.query.srid || 4326;
          //include floor and building. Lookup by SiteID via
          // Site
          // |-- Buildings
          //     \-- Floors
          // And use the array of floorId's to get all hazards for this site.
          models.Hazard.findAll({
            include: [
              models.HazardType,
              models.Unit,
              {
                model: models.Floor,
                where: {id: req.params.id3},
                include: [{
                  model: models.Building,
                  where: {id: req.params.id2, SiteId: req.params.id},
                  include: [{
                    model: models.Site
                  }]
                }]
              }
            ]
          }).then(function(hazards) {
            if(hazards) {
              res.json(hazards);
            } else {
              res.status(400).json({error: 'notFound'});
            }
          });
        });
module.exports = router;
