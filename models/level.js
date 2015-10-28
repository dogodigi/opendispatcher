/*!
 * Floor model
 */
(function () {
  'use strict';
  module.exports = function(sequelize, DataTypes) {
    var Level = sequelize.define("Level", {
      name: DataTypes.STRING,
      level: DataTypes.INTEGER,
      ground: DataTypes.BOOLEAN
    }, {
      schema: "opendispatcher",
      paranoid: true,
      classMethods: {
        associate: function(models) {
          Level.hasOne(models.Alarm);
          Level.hasMany(models.Annotation);
          Level.hasMany(models.Barrier);
          Level.hasMany(models.Building);
          Level.hasMany(models.Compartiment);
          Level.hasMany(models.Hazard);
          Level.hasMany(models.Media);
          Level.hasMany(models.Protection);
          Level.hasMany(models.Route);
          Level.hasMany(models.Terrain);
          Level.hasMany(models.Zoom);
          Level.belongsTo(models.Site, {
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
    return Level;
  };
}());
