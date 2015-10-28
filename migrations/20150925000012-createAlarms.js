(function () {
'use strict';
/*
CREATE TABLE opendispatcher."Alarms"
(
  id serial NOT NULL,
  description character varying(255),
  "providerId" character varying(255),
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL,
  "deletedAt" timestamp with time zone,
  "AlarmTypeId" integer,
  "SiteId" integer,
  CONSTRAINT "Alarms_pkey" PRIMARY KEY (id),
  CONSTRAINT "Alarms_AlarmTypeId_fkey" FOREIGN KEY ("AlarmTypeId")
      REFERENCES opendispatcher."AlarmTypes" (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT "Alarms_SiteId_fkey" FOREIGN KEY ("SiteId")
      REFERENCES opendispatcher."Sites" (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE SET NULL
)
*/
module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.createTable("Alarms", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        description: Sequelize.TEXT,
        providerId: Sequelize.STRING,
        geometry: Sequelize.GEOMETRY('POINT', 4326),
        "createdAt": {type: Sequelize.DATE, allowNull: false},
        "updatedAt": {type: Sequelize.DATE, allowNull: false},
        "deletedAt": Sequelize.DATE,
        "AlarmTypeId": {
          type: Sequelize.INTEGER,
          references: {
            model: {
              schema: 'opendispatcher',
              tableName: 'AlarmTypes'
            },
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        },
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
        }
      }, {
        schema: "opendispatcher"
      })
    ]);
  },down: function (queryInterface) {
    return Promise.all([
      queryInterface.dropTable('Alarms',{schema: 'opendispatcher'})
    ]);
  }
};
}());
