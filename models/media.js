/*!
 * Hazard model
 */
(function () {
  'use strict';
  module.exports = function(sequelize, DataTypes) {
    var Media = sequelize.define("Media", {
      hyperlink: {type: DataTypes.BOOLEAN, defaultValue: false},
      external: {type: DataTypes.BOOLEAN, defaultValue: false},
      name: DataTypes.STRING, //filename
      mimeType: DataTypes.STRING, //mimeType
      media: DataTypes.TEXT, //base64 for the image (optional, if you want it stored inside the DB)
      geometry: DataTypes.GEOMETRY('POINT', 4326)
    }, {
      schema: "opendispatcher",
      paranoid: true,
      classMethods: {
        associate: function(models) {
          Media.belongsToMany(models.Protection, {
            as: 'Media',
            through: 'ProtectionMedia',
            foreignKey: 'MediaId'
          });
          Media.belongsTo(models.Level, {
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
    return Media;
  };
}());
