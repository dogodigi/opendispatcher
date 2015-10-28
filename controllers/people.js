var models = require('../models');
var express = require('express');
var router = express.Router();
router.route('/new/api/people')
  .get(function(req,res){
    var srid = req.query.srid || 4326;
    models.Person.findAll({

    }).then(function(people) {
      res.json(people);
    });
  });

router.route('/new/api/people/:id')
  .put(function(req,res){
    models.Person.findOrCreate({
      where: {id:req.params.id}},function(err, person){
      if(err)
        res.send(err);
      for(var prop in req.body){
        person[prop]=req.body[prop];
      }
      // save the Site
      person.save(function(err) {
        if (err)
          res.send(err);
        res.json({ message: 'Updated' });
      });
    });
  })
  .get(function(req,res){
    models.Person.findOne({
      where: {id: req.params.id}
    }).then(function(person) {
        res.json(person);
      });
  })
  .delete(function(req,res){
    models.Person.destroy({
      where: {
        id: req.params.id
      }
    }).then(function() {
      res.json({ message: 'Deleted' });
    });
  });

module.exports = router;
