/*!
 * Barrier model
 */
(function () {
  'use strict';
  module.exports = function(sequelize, DataTypes) {
    var Barrier = sequelize.define("Barrier", {
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      geometry: DataTypes.GEOMETRY('MULTILINESTRING', 4326)
    }, {
      schema: "opendispatcher",
      paranoid: true,
      classMethods: {
        associate: function(models) {
          Barrier.belongsTo(models.BarrierType);
          Barrier.belongsTo(models.Level);
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
    return Barrier;
  };
}());
