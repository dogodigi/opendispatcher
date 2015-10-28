(function () {
'use strict';
/*
CREATE TABLE "Areas"
(
  id serial NOT NULL,
  geometry geometry,
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL,
  "OrganizationId" integer NOT NULL,
  CONSTRAINT "Areas_pkey" PRIMARY KEY (id)
)
*/
module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.createTable("Areas", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        description: Sequelize.STRING,
        name_en: Sequelize.STRING,
        name_nl: Sequelize.STRING,
        name_es: Sequelize.STRING,
        procedure: Sequelize.STRING, //@TODO: LUT? Procedure to enter or fight fire.
        riskCategory: Sequelize.STRING, //@TODO: LUT? Risk category.
        geometry: Sequelize.GEOMETRY('POLYGON', 4326),
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
      queryInterface.dropTable('Areas',{schema: 'opendispatcher'})
    ]);
  }
};
}());
