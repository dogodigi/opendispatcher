/*!
 * Organization model
 */
(function () {
  'use strict';
  module.exports = function(sequelize, DataTypes) {
    var Organization = sequelize.define("Organization", {
      name: DataTypes.STRING, //Name of the Organization
      abbreviation: DataTypes.STRING,
      title: DataTypes.STRING, //Application title
      logo: DataTypes.STRING, //Application logo, leave blank for default
      workspace: DataTypes.STRING //Currently set to dbk
    }, {
      schema: "opendispatcher",
      paranoid: true,
      classMethods: {
        associate: function(models) {
          Organization.hasMany(models.Layer);
          Organization.hasMany(models.Site);
          Organization.hasOne(models.Region);
        }
      },
      instanceMethods: {
        toJSON: function () {
          var data = this.get();
          if (x === 'the_geom'){
              //geojson from postgis is returned as a string. Parse it into real JSON.
              data[x] = JSON.parse(data[x]);
          }
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
    return Organization;
  };
}());
