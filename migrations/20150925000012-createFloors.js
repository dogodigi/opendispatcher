(function () {
'use strict';
/*
CREATE TABLE "Floors"
(
  id serial NOT NULL,
  name character varying(255),
  ground boolean,
  geometry geometry,
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL,
  "deletedAt" timestamp with time zone,
  "BuildingId" integer NOT NULL,
  CONSTRAINT "Floors_pkey" PRIMARY KEY (id),
  CONSTRAINT "Floors_BuildingId_fkey" FOREIGN KEY ("BuildingId")
      REFERENCES "Buildings" (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE SET NULL
)
*/
module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.createTable("Floors", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: Sequelize.STRING,
        ground: Sequelize.BOOLEAN,
        geometry: Sequelize.GEOMETRY('MULTIPOLYGON', 4326),
        "createdAt": {type: Sequelize.DATE, allowNull: false},
        "updatedAt": {type: Sequelize.DATE, allowNull: false},
        "deletedAt": Sequelize.DATE,
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
      queryInterface.dropTable('Floors',{schema: 'opendispatcher'})
    ]);
  }
};
}());
