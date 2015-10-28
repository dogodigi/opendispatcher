(function () {
'use strict';
/*
CREATE TABLE "Levels"
(
  id serial NOT NULL,
  name character varying(255),
  level INTEGER,
  ground boolean,
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL,
  "deletedAt" timestamp with time zone,
  "BuildingId" integer NOT NULL,
  CONSTRAINT "Levels_pkey" PRIMARY KEY (id),
  CONSTRAINT "Levels_BuildingId_fkey" FOREIGN KEY ("BuildingId")
      REFERENCES "Buildings" (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE SET NULL
)
*/
module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.createTable("Levels", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: Sequelize.STRING,
        level: Sequelize.INTEGER,
        ground: Sequelize.BOOLEAN,
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
        }
      }, {
        schema: "opendispatcher"
      })
    ]);
  },down: function (queryInterface) {
    return Promise.all([
      queryInterface.dropTable('Levels',{schema: 'opendispatcher'})
    ]);
  }
};
}());
