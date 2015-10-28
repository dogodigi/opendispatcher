/*!
 * Building model
 */
(function () {
  'use strict';
  module.exports = function(sequelize, DataTypes) {
    var Building = sequelize.define("Building", {
      name: DataTypes.STRING,
      source: DataTypes.ENUM('openstreetmap', 'bag', 'brk', 'brt', 'bgt', 'user', 'import'),
      sourceId: DataTypes.STRING,
      geometry: DataTypes.GEOMETRY('MULTIPOLYGON', 4326),
      construction: DataTypes.STRING, //@TODO: LUT? Information about construction, e.g. steel, wood, stone
      usage: DataTypes.STRING, //@TODO: LUT? Primary usage of the building, e.g. industrial, office, educational
      procedure: DataTypes.STRING, //@TODO: LUT? Procedure to enter or fight fire.
      riskCategory: DataTypes.STRING, //@TODO: LUT? Risk category.
    }, {
      schema: "opendispatcher",
      paranoid: true,
      classMethods: {
        associate: function(models) {
          Building.hasMany(models.Address);
          Building.belongsTo(models.Level, {
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
    return Building;
  };
}());
