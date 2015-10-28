(function () {
'use strict';
/*
CREATE TABLE opendispatcher."Organizations"
(
  id serial NOT NULL,
  name character varying(255),
  abbreviation character varying(255),
  title character varying(255),
  logo character varying(255),
  workspace character varying(255),
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL,
  "deletedAt" timestamp with time zone,
  CONSTRAINT "Organizations_pkey" PRIMARY KEY (id)
)
*/
module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.createTable("Organizations", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: Sequelize.STRING, //Name of the Organization
        abbreviation: Sequelize.STRING,
        title: Sequelize.STRING, //Application title
        logo: Sequelize.STRING, //Application logo, leave blank for default
        workspace: Sequelize.STRING, //Currently set to dbk
        "createdAt": {type: Sequelize.DATE, allowNull: false},
        "updatedAt": {type: Sequelize.DATE, allowNull: false},
        "deletedAt": Sequelize.DATE
      }, {
        schema: "opendispatcher"
      })
    ]);
  },down: function (queryInterface) {
    return Promise.all([
      queryInterface.dropTable('Organizations',{schema: 'opendispatcher'})
    ]);
  }
};
}());
