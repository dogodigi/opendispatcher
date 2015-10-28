/*!
 * Safety model
 */
(function () {
  'use strict';
  module.exports = function(sequelize, DataTypes) {
    var Person = sequelize.define("Person", {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING
    }, {
      schema: "opendispatcher",
      paranoid: true,
      classMethods: {
        associate: function(models) {
          Person.belongsToMany(models.Site, {
            as: 'Person',
            through: 'Contacts',
            foreignKey: 'PersonId'
          });
        }
      },
      instanceMethods: {
        toJSON: function () {
          var data = this.get();
          var y;
          for (var x in data) {
            if (x === 'the_geom'){
                //geojson from postgis is returned as a string. Parse it into real JSON.
                data[x] = JSON.parse(data[x]);
            }
            y = data[x];
            if (y==="null" || y===null || y==="" || typeof y === "undefined" || (y instanceof Object && Object.keys(y).length === 0)) {
              delete data[x];
            }
          }
          return data;
        }
      }
    });
    return Person;
  };
}());
