/*!
 * Layer model
 */
(function () {
  'use strict';
  module.exports = function(sequelize, DataTypes) {
    var Layer = sequelize.define("Layer", {
      name: DataTypes.STRING,
      url: DataTypes.TEXT,
      proxy: DataTypes.BOOLEAN,
      enabled: DataTypes.BOOLEAN,
      baselayer: DataTypes.BOOLEAN,
      params: DataTypes.JSON,
      options: DataTypes.JSON,
      getcapabilities: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      parent: DataTypes.STRING,
      index: DataTypes.INTEGER,
      pl: {
        type: DataTypes.CHAR(2),
        unique: true
      },
      layertype: DataTypes.ENUM('WMS','TMS', 'WMTS'),
      abstract: DataTypes.TEXT,
      legend: DataTypes.TEXT
    },{
      schema: "opendispatcher",
      paranoid: true,
      classMethods: {
        associate: function(models) {
          Layer.belongsTo(models.Organization);
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
    return Layer;
  };
}());
