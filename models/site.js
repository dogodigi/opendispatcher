/*!
 * Site model
 */
(function () {
 'use strict';
  module.exports = function(sequelize, DataTypes) {
    var Site = sequelize.define("Site", {
      name: DataTypes.STRING,
      title: DataTypes.STRING,
      checked: DataTypes.DATE,
      assistance: DataTypes.BOOLEAN
    }, {
      schema: "opendispatcher",
      paranoid: true,
      classMethods: {
        associate: function(models) {
          Site.hasOne(models.Address);
          Site.belongsToMany(models.Person, {
            as: 'Site',
            through: 'Contacts',
            foreignKey: 'SiteId'
          });
          Site.hasMany(models.Level);
          Site.hasOne(models.Status);
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
            if (x === 'levels'){
              data[x] = parseInt(data[x]);
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
    return Site;
   };
}());
