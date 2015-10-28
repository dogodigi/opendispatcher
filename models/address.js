/*!
 * Address model
 */
(function () {
  'use strict';
  module.exports = function(sequelize, DataTypes) {
    var Address = sequelize.define("Address", {
      street: DataTypes.STRING,
      housenumber: DataTypes.STRING,
      housename: DataTypes.STRING,
      place: DataTypes.STRING,
      city: DataTypes.STRING,
      postcode: DataTypes.STRING,
      source: DataTypes.ENUM('openstreetmap','bag', 'user', 'import'),
      sourceId: DataTypes.STRING,
      geometry: DataTypes.GEOMETRY()
    }, {
      schema: "opendispatcher",
      paranoid: true,
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
    return Address;
  };
}());
