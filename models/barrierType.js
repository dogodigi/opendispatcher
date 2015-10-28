/*!
 * BarrierType model
 */
(function () {
  'use strict';
  module.exports = function(sequelize, DataTypes) {
    var BarrierType = sequelize.define("BarrierType", {
      name_en: DataTypes.STRING,
      name_nl: DataTypes.STRING,
      name_es: DataTypes.STRING,
      symbol: DataTypes.STRING,
      namespace: DataTypes.STRING
    }, {
      schema: "opendispatcher",
      paranoid: true,
      classMethods: {
        associate: function(models) {
          BarrierType.hasMany(models.Barrier);
        }
      },
      instanceMethods: {
        toJSON: function () {
          var data = this.get();
          var y;
          for (var x in data) {
            y = data[x];
            if (y==="null" || y===null || y==="" || typeof y === "undefined" || (y instanceof Object && Object.keys(y).length === 0)) {
              delete data[x];
            }
          }
          return data;
        }
      }
    });
    return BarrierType;
  };
}());
