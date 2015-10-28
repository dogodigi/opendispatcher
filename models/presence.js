/*!
 * Safety model
 */
(function () {
  'use strict';
  module.exports = function(sequelize, DataTypes) {
    var Presence = sequelize.define("Presence", {
      autonomes: DataTypes.INTEGER, //zelfredzaam
      notautonomes: DataTypes.INTEGER, //niet zelfredzaam
      mon: DataTypes.BOOLEAN,
      tue: DataTypes.BOOLEAN,
      wed: DataTypes.BOOLEAN,
      thu: DataTypes.BOOLEAN,
      fri: DataTypes.BOOLEAN,
      sat: DataTypes.BOOLEAN,
      sun: DataTypes.BOOLEAN,
      start: DataTypes.TIME,
      end: DataTypes.TIME
    }, {
      schema: "opendispatcher",
      paranoid: true,
      classMethods: {
        associate: function(models) {
          Presence.belongsTo(models.Level, {
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
    return Presence;
  };
}());
