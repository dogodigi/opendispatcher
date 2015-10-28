(function () {
'use strict';
/*
CREATE TABLE "Addresses"
(
  id serial NOT NULL,
  street character varying(255),
  housenumber character varying(255),
  housename character varying(255),
  place character varying(255),
  city character varying(255),
  postcode character varying(255),
  geometry geometry,
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL,
  "deletedAt" timestamp with time zone,
  "BuildingId" integer,
  "SiteId" integer,
  CONSTRAINT "Addresses_pkey" PRIMARY KEY (id),
  CONSTRAINT "Addresses_BuildingId_fkey" FOREIGN KEY ("BuildingId")
      REFERENCES "Buildings" (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT "Addresses_SiteId_fkey" FOREIGN KEY ("SiteId")
      REFERENCES "Sites" (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE SET NULL
)
*/
module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.createTable({
        table: 'Addresses',
        tableName: 'Addresses',
        name: 'Address',
        schema: 'opendispatcher',
        delimiter: '.',
      }, {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        street: Sequelize.STRING,
        housenumber: Sequelize.STRING,
        housename: Sequelize.STRING,
        place: Sequelize.STRING,
        city: Sequelize.STRING,
        postcode: Sequelize.STRING,
        source: Sequelize.ENUM('openstreetmap','bag', 'user', 'import'),
        sourceId: Sequelize.STRING,
        geometry: Sequelize.GEOMETRY('POINT', 4326),
        "createdAt": {type: Sequelize.DATE, allowNull: false},
        "updatedAt": {type: Sequelize.DATE, allowNull: false},
        "deletedAt": Sequelize.DATE,
        "SiteId": {
          type: Sequelize.INTEGER,
          references: {
            model: {
              schema: 'opendispatcher',
              tableName: 'Sites'
            },
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        },
        "BuildingId": {
          type: Sequelize.INTEGER,
          references: {
            model: {
              schema: 'opendispatcher',
              tableName: 'Buildings'
            },
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        }
      }, {
        schema: "opendispatcher"
      })
    ]);
  },down: function (queryInterface) {
    return Promise.all([
      queryInterface.dropTable('Addresses',{schema: 'opendispatcher'})
    ]);
  }
};
}());
