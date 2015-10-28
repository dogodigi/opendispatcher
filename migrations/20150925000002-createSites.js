(function () {
'use strict';
/*
CREATE TABLE "Sites"
(
  id serial NOT NULL,
  name character varying(255),
  title character varying(255),
  checked timestamp with time zone,
  assistance boolean,
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL,
  "deletedAt" timestamp with time zone,
  "OrganizationId" integer,
  CONSTRAINT "Sites_pkey" PRIMARY KEY (id),
  CONSTRAINT "Sites_OrganizationId_fkey" FOREIGN KEY ("OrganizationId")
      REFERENCES "Organizations" (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE SET NULL
)
*/
module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.createTable("Sites", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: Sequelize.STRING,
        title: Sequelize.STRING,
        checked: Sequelize.DATE,
        assistance: Sequelize.BOOLEAN,
        "createdAt": {type: Sequelize.DATE, allowNull: false},
        "updatedAt": {type: Sequelize.DATE, allowNull: false},
        "deletedAt": Sequelize.DATE,
        "OrganizationId": {
          type: Sequelize.INTEGER,
          references: {
            model: {
              schema: 'opendispatcher',
              tableName: 'Organizations'
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
      queryInterface.dropTable('Sites',{schema: 'opendispatcher'})
    ]);
  }
};
}());
