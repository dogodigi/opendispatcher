/*!
 * SafetyClass model
 */
(function () {
  'use strict';
  module.exports = function(sequelize, DataTypes) {
    var ProtectionType = sequelize.define("ProtectionType", {
      name_en: DataTypes.STRING,
      name_nl: DataTypes.STRING,
      name_es: DataTypes.STRING,
      symbol: DataTypes.STRING,
      namespace: DataTypes.STRING,
      category: DataTypes.STRING,
      radius: DataTypes.INTEGER
    }, {
      schema: "opendispatcher",
      paranoid: true,
      classMethods: {
        associate: function(models) {
          ProtectionType.hasMany(models.Protection);
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
    return ProtectionType;
  };
}());
