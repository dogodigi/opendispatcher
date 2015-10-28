(function () {
'use strict';
/*
CREATE TABLE opendispatcher."CompartimentTypes"
(
  id serial NOT NULL,
  name_en character varying(255),
  name_nl character varying(255),
  name_es character varying(255),
  symbol character varying(255),
  namespace character varying(255),
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL,
  "deletedAt" timestamp with time zone,
  CONSTRAINT "CompartimentTypes_pkey" PRIMARY KEY (id)
)
*/
module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.createTable("UnitTypes", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        abbreviation: Sequelize.STRING,
        name_en: Sequelize.STRING,
        name_nl: Sequelize.STRING,
        name_es: Sequelize.STRING,
        namespace: Sequelize.STRING,
        "createdAt": {type: Sequelize.DATE, allowNull: false},
        "updatedAt": {type: Sequelize.DATE, allowNull: false},
        "deletedAt": Sequelize.DATE,
      }, {
        schema: "opendispatcher"
      })
    ]);
  },down: function (queryInterface) {
    return Promise.all([
      queryInterface.dropTable('UnitTypes',{schema: 'opendispatcher'})
    ]);
  }
};
}());
