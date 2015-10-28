(function () {
'use strict';
/*
CREATE TABLE "ProtectionTypes"
(
  id serial NOT NULL,
  description character varying(255),
  name_en character varying(255),
  name_nl character varying(255),
  name_es character varying(255),
  symbol character varying(255),
  namespace character varying(255),
  category character varying(255),
  radius integer,
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL,
  "deletedAt" timestamp with time zone,
  CONSTRAINT "ProtectionTypes_pkey" PRIMARY KEY (id)
)
*/
module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.createTable("ProtectionTypes", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name_en: Sequelize.STRING,
        name_nl: Sequelize.STRING,
        name_es: Sequelize.STRING,
        symbol: Sequelize.STRING,
        namespace: Sequelize.STRING,
        radius: Sequelize.INTEGER,
        "createdAt": {type: Sequelize.DATE, allowNull: false},
        "updatedAt": {type: Sequelize.DATE, allowNull: false},
        "deletedAt": Sequelize.DATE,
        "ProtectionTypeCategoryId": {
          type: Sequelize.INTEGER,
          references: {
            model: {
              schema: 'opendispatcher',
              tableName: 'ProtectionTypeCategories'
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
      queryInterface.dropTable('ProtectionTypes',{schema: 'opendispatcher'})
    ]);
  }
};
}());
