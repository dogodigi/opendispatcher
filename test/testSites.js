/*!
 *
 */
(function() {
  'use strict';
  var expect = require('expect');
  var models = require('../models');
  var tuple_organization;
  var tuple_region;
  var tuple_site;
  var tuple_level;
  var tuple_building;
  var tuples_hazard;
  describe('Test Models', function() {
    before(function(done) {
      done();
    });

    describe('models/Hazard', function() {
      it('returns the hazard model', function() {
        expect(models.Hazard).toExist();
      });
    });
    describe('models/Site', function() {
      it('returns the site model', function() {
        expect(models.Site).toExist();
      });
    });
    describe('create', function() {
      it('creates a Organization with a Region', function() {
        return models.Organization.create({
            name: 'Regio Brabant Noord',
            abbreviation: 'brabantnoord',
            title: 'DOIV',
            logo: 'images/test.png',
            workspace: 'dbk'
          })
          .bind(this).then(function(result) {
            tuple_organization = result;
            var region = {
              "type": "MultiPolygon",
              "crs": {
                "type": "name",
                "properties": {
                  "name": "EPSG:4326"
                }
              },
              "coordinates": [
                [
                  [
                    [5.145009422787624, 51.640523524912169],
                    [5.128329322417591, 51.637597728364838],
                    [5.115991797666571, 51.637599855890294],
                    [5.111486036653234, 51.635396960290748],
                    [5.106194178319324, 51.636109083200765],
                    [5.101848226802364, 51.660785136262],
                    [5.102953522122494, 51.66814608629474],
                    [5.101582698872703, 51.672454450792074],
                    [5.145009422787624, 51.640523524912169]
                  ]
                ]
              ]
            };
            return models.Region.create({
              OrganizationId: tuple_organization.id,
              geometry: region
            }).then(function(result) {
              tuple_region = result;
              expect(tuple_region.OrganizationId).toEqual(tuple_organization.id);
            });
          });
      });
      it('creates a Site', function() {
        var mySite = {
          name: 'Boseind 10 BT',
          title: 'Vion Boxtel B.V.',
          assistance: true,
          OrganizationId: tuple_organization.id,
          checked: new Date()
        };
        return models.Site.create(mySite).then(function(result) {
          tuple_site = result;
          expect(tuple_site.OrganizationId).toEqual(tuple_organization.id);
        });
      });

      it('creates a Level', function() {
        var myLevel = {
          name: 'Algemeen',
          level: 0,
          ground: true,
          SiteId: tuple_site.id,
          checked: new Date()
        };
        return models.Level.create(myLevel).then(function(result) {
          tuple_level = result;
          expect(tuple_level.SiteId).toEqual(tuple_site.id);
        });
      });
      it('creates a Building with an Address', function() {
        var building = {
          "type": "MultiPolygon",
          "crs": {
            "type": "name",
            "properties": {
              "name": "EPSG:4326"
            }
          },
          "coordinates": [
            [
              [
                [5.32393061048113, 51.5787440865183],
                [5.32398425241903, 51.5785544562699],
                [5.32467229727671, 51.5786285317553],
                [5.32461865812593, 51.5788181623187],
                [5.32393061048113, 51.5787440865183]
              ]
            ]
          ]
        };
        return models.Building.create({
          LevelId: tuple_level.id,
          geometry: building
        }).bind(this).then(function(result) {
          tuple_building = result;
          var point = {
            "type": "Point",
            "crs": {
              "type": "name",
              "properties": {
                "name": "EPSG:4326"
              }
            },
            "coordinates": [5.32321277901044, 51.5793333481387]
          };
          return models.Address.create({
            street: 'Boseind',
            housenumber: '10, BT',
            postcode: '1066XX',
            BuildingId: tuple_building.id,
            LevelId: tuple_level.id,
            geometry: point
          }).then(function(address) {
            expect(address.street).toEqual('Boseind');
          });
        });
      });
      //it('Hazard Types should have been created during migration', function() {
      //  try {
      //    models.HazardType.create({
      //      id: 2001,
      //      name_en: 'Explosive',
      //      name_nl: 'Explosief',
      //      namespace: 'eughs',
      //      symbol: 'EU-GHS01'
      //    });
      //  } catch (err) {
      //    expect(err.name).equal('SequelizeUniqueConstraintError');
      //  }
      //});

      it('creates Hazards on a Level', function() {
        var point = {
          "type": 'Point',
          "crs": {
            "type": "name",
            "properties": {
              "name": "EPSG:4326"
            }
          },
          "coordinates": [5.32321277901044, 51.5793333481387]
        };
        return models.Hazard.bulkCreate(
          [{
            name: 'Stikstof',
            hin: '20',
            un: '1066',
            quantity: 41000,
            description: '',
            LevelId: tuple_level.id,
            UnitId: 1,
            HazardTypeId: 2007,
            geometry: point
          }, {
            name: 'Ammoniak koelsysteem',
            hin: '268',
            un: '1005',
            quantity: 768,
            description: '',
            LevelId: tuple_level.id,
            UnitId: 2,
            HazardTypeId: 2006,
            geometry: point
          }], {
            returning: true
          }
        ).then(function(result) {
          tuples_hazard = result;
          expect(tuples_hazard.length).toEqual(2);
        });
      });

      //Roll up, delete all created records
      it('removes the Hazards', function() {
        return models.Hazard.destroy({
          where: {
            id: [tuples_hazard[0].id, tuples_hazard[1].id]
          }
        }).then(function(affectedRows) {
          expect(affectedRows).toEqual(2);
        });
      });
      it('removes the Building', function() {
        return models.Building.destroy({
          where: {
            id: tuple_building.id
          }
        }).then(function(affectedRows) {
          expect(affectedRows).toEqual(1);
        });
      });
      it('removes the Level', function() {
        return models.Level.destroy({
          where: {
            id: tuple_level.id
          }
        }).then(function(affectedRows) {
          expect(affectedRows).toEqual(1);
        });
      });
      it('removes the Site', function() {
        return models.Site.destroy({
          where: {
            id: tuple_site.id
          }
        }).then(function(affectedRows) {
          expect(affectedRows).toEqual(1);
        });
      });
      it('removes the region', function() {
        return models.Region.destroy({
          where: {
            id: tuple_region.id
          }
        }).then(function(affectedRows) {
          expect(affectedRows).toEqual(1);
        });
      });
      it('removes the Organization', function() {
        return models.Organization.destroy({
          where: {
            id: tuple_organization.id
          }
        }).then(function(affectedRows) {
          expect(affectedRows).toEqual(1);
        });
      });
    });
  });
}());
