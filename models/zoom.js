/*!
 * Zoom model
 */
(function () {
  'use strict';
  module.exports = function(sequelize, DataTypes) {
    var Zoom = sequelize.define("Zoom", {
      type: DataTypes.ENUM('Route','Building', 'Terrain', 'Other'),
      zoom: DataTypes.DOUBLE,
      geometry: DataTypes.GEOMETRY('POINT', 4326)
    }, {
      schema: "opendispatcher",
      paranoid: true,
      classMethods: {
        associate: function(models) {
          Zoom.belongsTo(models.Level);
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
    return Zoom;
  };
}());
