/*!
 * Safety model
 */
(function () {
  'use strict';
  module.exports = function(sequelize, DataTypes) {
    var Protection = sequelize.define("Protection", {
      rotation: DataTypes.DOUBLE,
      description: DataTypes.TEXT, //Optional description
      geometry: DataTypes.GEOMETRY()
    }, {
      schema: "opendispatcher",
      paranoid: true,
      classMethods: {
        associate: function(models) {
          Protection.belongsToMany(models.Media, {
            as: 'Protection',
            through: 'ProtectionMedia',
            foreignKey: 'ProtectionId'
          });
          Protection.belongsTo(models.Level, {
            onDelete: "CASCADE",
            foreignKey: {
              allowNull: false
            }
          });
          Protection.belongsTo(models.ProtectionType);
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
    return Protection;
  };
}());
