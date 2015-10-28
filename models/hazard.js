/*!
 * Hazard model
 */
(function () {
  'use strict';
  module.exports = function(sequelize, DataTypes) {
    var Hazard = sequelize.define("Hazard", {
      name: DataTypes.STRING, //Name of the fluid or liquid
      hin: DataTypes.STRING, //Hazard Identification Number, Kemler Code, Gevi
      un: DataTypes.STRING, //UN recommendations on the Transport of Dangerour Goods
      quantity: DataTypes.DOUBLE, // Textual description of the quantity, lookup UOM.
      quantityString: DataTypes.STRING,
      estimate: DataTypes.BOOLEAN,
      description: DataTypes.STRING, //Description of the Hazard
      radius: DataTypes.INTEGER,
      geometry: DataTypes.GEOMETRY()
    }, {
      schema: "opendispatcher",
      paranoid: true,
      classMethods: {
        associate: function(models) {
          Hazard.belongsTo(models.HazardType);
          Hazard.belongsTo(models.UnitType);
          Hazard.belongsTo(models.Level, {
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
    return Hazard;
  };
}());
