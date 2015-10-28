var models = require('../models');
var express = require('express');
var router = express.Router();
router.route('/new/api/annotations')
  .get(function(req,res){
    var srid = req.query.srid || 4326;
    models.Annotation.findAll({

    }).then(function(annotation) {
      res.json(annotation);
    });
  });

router.route('/new/api/annotations/:id')
  .put(function(req,res){
    models.Annotation.findOrCreate({
      where: {id:req.params.id}},function(err, annotation){
      if(err)
        res.send(err);
      for(var prop in req.body){
        annotation[prop]=req.body[prop];
      }
      annotation.save(function(err) {
        if (err)
          res.send(err);
        res.json({ message: 'Updated' });
      });
    });
  })
  .get(function(req,res){
    models.Annotation.findOne({
      where: {id: req.params.id}
    }).then(function(annotation) {
        res.json(annotation);
      });
  })
  .delete(function(req,res){
    models.Annotation.destroy({
      where: {
        id: req.params.id
      }
    }).then(function() {
      res.json({ message: 'Deleted' });
    });
  });

module.exports = router;
