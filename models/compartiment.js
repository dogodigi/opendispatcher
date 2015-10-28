/*!
 * Safety model
 */
(function () {
  'use strict';
  module.exports = function(sequelize, DataTypes) {
    var Compartiment = sequelize.define("Compartiment", {
      label: DataTypes.STRING,
      description: DataTypes.STRING, //Optional description
      geometry: DataTypes.GEOMETRY('MULTILINESTRING', 4326)
    }, {
      schema: "opendispatcher",
      paranoid: true,
      classMethods: {
        associate: function(models) {
          Compartiment.belongsTo(models.CompartimentType);
          Compartiment.belongsTo(models.Level, {
            onDelete: "CASCADE",
            foreignKey: {
              allowNull: false
            }
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
    return Compartiment;
  };
}());
