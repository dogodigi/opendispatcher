var models = require('../models');
var express = require('express');
var router = express.Router();
router.route('/new/api/alarms')
  .get(function(req,res){
    var srid = req.query.srid || 4326;
    models.Alarm.findAll({

    }).then(function(alarm) {
      res.json(alarm);
    });
  });

router.route('/new/api/alarms/:id')
  .put(function(req,res){
    models.Alarm.findOrCreate({
      where: {id:req.params.id}},function(err, alarm){
      if(err)
        res.send(err);
      for(var prop in req.body){
        alarm[prop]=req.body[prop];
      }
      alarm.save(function(err) {
        if (err)
          res.send(err);
        res.json({ message: 'Updated' });
      });
    });
  })
  .get(function(req,res){
    models.Alarm.findOne({
      where: {id: req.params.id}
    }).then(function(alarm) {
        res.json(alarm);
      });
  })
  .delete(function(req,res){
    models.Alarm.destroy({
      where: {
        id: req.params.id
      }
    }).then(function() {
      res.json({ message: 'Deleted' });
    });
  });

module.exports = router;
