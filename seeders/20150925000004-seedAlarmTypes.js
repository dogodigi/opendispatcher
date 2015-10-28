(function () {
'use strict';
/*
CREATE TABLE opendispatcher."AlarmTypes"
(
  id serial NOT NULL,
  description character varying(255),
  name_en character varying(255),
  name_nl character varying(255),
  name_es character varying(255),
  provider character varying(255),
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL,
  "deletedAt" timestamp with time zone,
  CONSTRAINT "AlarmTypes_pkey" PRIMARY KEY (id)
)
*/
module.exports = {
  up: function (queryInterface, Sequelize) {
      var fs = require("fs");
      var baseSQL = fs.readFile('assets/seeds/20150925000004-seedAlarmTypesUp.sql', 'utf8', function(err, data){
          if (err){
            console.log(err.message);
            return err;
          } else {
            queryInterface.sequelize.query(data).then(function(result){
              return {result: "OK", msg: "Seed processed"};
            }).catch(function(err) {
               // Ooops, do some error-handling
               console.log(err.message);
               return err;
            });
          }
      }); // I recommend loading a file
  },down: function (queryInterface) {
    return Promise.all([
      //Bas practice! Better delete via SQL by ID's or some other key.
      models.AlarmType.destroy({truncate: true})
    ]);
  }
};
}());
