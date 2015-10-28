/*!
 * AlarmType model
 */
(function () {
  'use strict';
  module.exports = function(sequelize, DataTypes) {
    var Annotation = sequelize.define("Annotation", {
      text: DataTypes.STRING,
      labelSize: DataTypes.INTEGER,
      font: DataTypes.STRING,
      scale: DataTypes.DOUBLE,
      rotation: DataTypes.DOUBLE,
      geometry: DataTypes.GEOMETRY('POINT', 4326)
    }, {
      schema: "opendispatcher",
      paranoid: true,
      classMethods: {
        associate: function(models) {
          Annotation.belongsTo(models.Level);
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
    return Annotation;
  };
}());
