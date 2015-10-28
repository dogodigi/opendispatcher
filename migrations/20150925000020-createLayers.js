(function () {
  /*
  -- DROP TABLE opendispatcher."Layers";

CREATE TABLE opendispatcher."Layers"
(
  id serial NOT NULL,
  name character varying(255),
  url character varying(255),
  proxy boolean,
  enabled boolean,
  baselayer boolean,
  params json,
  options json,
  getcapabilities boolean NOT NULL DEFAULT false,
  parent character varying(255),
  index integer,
  pl character(2),
  layertype opendispatcher."enum_Layers_layertype",
  abstract character varying(255),
  legend character varying(255),
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL,
  "deletedAt" timestamp with time zone,
  "OrganizationId" integer,
  CONSTRAINT "Layers_pkey" PRIMARY KEY (id),
  CONSTRAINT "Layers_OrganizationId_fkey" FOREIGN KEY ("OrganizationId")
      REFERENCES opendispatcher."Organizations" (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT "Layers_pl_key" UNIQUE (pl)
)
  */
'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.createTable({
        table: 'Layers',
        tableName: 'Layers',
        name: 'Layer',
        schema: 'opendispatcher',
        delimiter: '.',
      }, {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: Sequelize.STRING,
        url: Sequelize.TEXT,
        proxy: Sequelize.BOOLEAN,
        enabled: Sequelize.BOOLEAN,
        baselayer: Sequelize.BOOLEAN,
        params: Sequelize.JSON,
        options: Sequelize.JSON,
        getcapabilities: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        parent: Sequelize.STRING,
        index: Sequelize.INTEGER,
        pl: Sequelize.STRING(2),
        layertype: {type: Sequelize.ENUM('WMS','TMS', 'WMTS', 'WFS'), defaultValue: 'WMS', allowNull: false},
        abstract: Sequelize.TEXT,
        legend: Sequelize.TEXT,
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
      queryInterface.dropTable('Layers',{schema: 'opendispatcher'})
    ]);
  }
};
}());
