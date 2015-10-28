var models = require('../models');
var express = require('express');
var router = express.Router();
router.route('/new/api/addresses')
  .get(function(req,res){
    var srid = req.query.srid || 4326;
    models.Address.findAll({

    }).then(function(address) {
      res.json(address);
    });
  });

router.route('/new/api/addresses/:id')
  .put(function(req,res){
    models.Address.findOrCreate({
      where: {id:req.params.id}},function(err, address){
      if(err)
        res.send(err);
      for(var prop in req.body){
        address[prop]=req.body[prop];
      }
      address.save(function(err) {
        if (err)
          res.send(err);
        res.json({ message: 'Updated' });
      });
    });
  })
  .get(function(req,res){
    models.Address.findOne({
      where: {id: req.params.id}
    }).then(function(address) {
        res.json(address);
      });
  })
  .delete(function(req,res){
    models.Address.destroy({
      where: {
        id: req.params.id
      }
    }).then(function() {
      res.json({ message: 'Deleted' });
    });
  });

module.exports = router;
