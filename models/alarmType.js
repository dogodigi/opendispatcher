/*!
 * AlarmType model
 */
(function () {
  'use strict';
  module.exports = function(sequelize, DataTypes) {
    var AlarmType = sequelize.define("AlarmType", {
      name_en: DataTypes.STRING,
      name_nl: DataTypes.STRING,
      name_es: DataTypes.STRING,
      provider: DataTypes.STRING // f.i. Siemens
    }, {
      schema: "opendispatcher",
      paranoid: true,
      classMethods: {
        associate: function(models) {
          AlarmType.hasMany(models.Alarm);
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
    return AlarmType;
  };
}());
