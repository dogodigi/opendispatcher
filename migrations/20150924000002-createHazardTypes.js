(function () {
'use strict';
/*
CREATE TABLE "HazardTypes"
(
  id serial NOT NULL,
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
  CONSTRAINT "HazardTypes_pkey" PRIMARY KEY (id)
)
*/
module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.createTable("HazardTypes", {
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
        category: Sequelize.STRING,
        radius: Sequelize.INTEGER,
        "createdAt": {type: Sequelize.DATE, allowNull: false},
        "updatedAt": {type: Sequelize.DATE, allowNull: false},
        "deletedAt": Sequelize.DATE
      }, {
        schema: "opendispatcher"
      })
    ]);
  },down: function (queryInterface) {
    return Promise.all([
      queryInterface.dropTable('HazardTypes',{schema: 'opendispatcher'})
    ]);
  }
};
}());
