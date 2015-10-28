/*!
 * AlarmType model
 */
(function () {
  'use strict';
  module.exports = function(sequelize, DataTypes) {
    var Alarm = sequelize.define("Alarm", {
      description: DataTypes.STRING, //Optional description
      providerId: DataTypes.STRING, // External key for the Provider
    }, {
      schema: "opendispatcher",
      paranoid: true,
      classMethods: {
        associate: function(models) {
          Alarm.belongsTo(models.AlarmType);
          Alarm.belongsTo(models.Level);
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
    return Alarm;
  };
}());
