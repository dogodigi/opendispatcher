/*!
 * Region model
 */
(function () {
  'use strict';
  module.exports = function(sequelize, DataTypes) {
    var Region = sequelize.define("Region", {
      source: DataTypes.ENUM('openstreetmap', 'brk', 'brt', 'bgt', 'user', 'import'),
      sourceId: DataTypes.STRING,
      geometry: DataTypes.GEOMETRY()
    }, {
      schema: "opendispatcher",
      paranoid: true,
      classMethods: {
        associate: function(models) {
          Region.belongsTo(models.Organization, {
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
            if(x === 'OrganizationId'){
              delete data[x];
            } else if (x === 'the_geom'){

                //geojson from postgis is returned as a string. Parse it into real JSON.
                data = {
                  style: {
                      weight: 2,
                      opacity: 1,
                      color: 'black',
                      fillOpacity: 0
                    },
                  data: {
                    type: "Feature",
                    properties: {id: data.id},
                    "geometry": JSON.parse(data[x])
                  }
                };
                //get the boundingbox
                var envelope = require('turf-envelope');
                var enveloped = envelope(data.data);
                data.BoundingBox = enveloped;
                //delete data.id;
                //delete data.the_geom;
            } else {
              //remove nulls. I rather handle undefined in the client app.
              y = data[x];
              if (y==="null" || y===null || y==="" || typeof y === "undefined" || (y instanceof Object && Object.keys(y).length === 0)) {
                delete data[x];
              }
            }
          }
          return data;
        }
      }
    });
    return Region;
  };
}());
