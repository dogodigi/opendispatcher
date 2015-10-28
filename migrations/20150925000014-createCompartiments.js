(function () {
'use strict';
/*
CREATE TABLE opendispatcher."Compartiments"
(
  id serial NOT NULL,
  label character varying(255),
  description character varying(255),
  geometry geometry,
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL,
  "deletedAt" timestamp with time zone,
  "FloorId" integer NOT NULL,
  "CompartimentTypeId" integer,
  CONSTRAINT "Compartiments_pkey" PRIMARY KEY (id),
  CONSTRAINT "Compartiments_CompartimentTypeId_fkey" FOREIGN KEY ("CompartimentTypeId")
      REFERENCES opendispatcher."CompartimentTypes" (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT "Compartiments_FloorId_fkey" FOREIGN KEY ("FloorId")
      REFERENCES opendispatcher."Levels" (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE CASCADE
)
*/
module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.createTable("Compartiments", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        label: Sequelize.STRING,
        description: Sequelize.STRING,
        geometry: Sequelize.GEOMETRY('MULTILINESTRING', 4326),
        "createdAt": {type: Sequelize.DATE, allowNull: false},
        "updatedAt": {type: Sequelize.DATE, allowNull: false},
        "deletedAt": Sequelize.DATE,
        "LevelId": {
          type: Sequelize.INTEGER,
          references: {
            model: {
              schema: 'opendispatcher',
              tableName: 'Levels'
            },
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        },
        "CompartimentTypeId": {
          type: Sequelize.INTEGER,
          references: {
            model: {
              schema: 'opendispatcher',
              tableName: 'CompartimentTypes'
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
      queryInterface.dropTable('Compartiments',{schema: 'opendispatcher'})
    ]);
  }
};
}());
