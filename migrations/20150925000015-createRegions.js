(function () {
  'use strict';
  module.exports = {
    up: function (queryInterface, Sequelize) {
      return Promise.all([
        queryInterface.createTable({
          table: 'Regions',
          tableName: 'Regions',
          name: 'Region',
          schema: 'opendispatcher',
          delimiter: '.',
        }, {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          source: Sequelize.ENUM('openstreetmap', 'brk', 'brt', 'bgt', 'user', 'import'),
          sourceId: Sequelize.STRING,
          geometry: Sequelize.GEOMETRY('MULTIPOLYGON', 4326),
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
    },
    down: function (queryInterface) {
      return Promise.all([
        queryInterface.dropTable('Regions',{schema: 'opendispatcher'})
      ]);
    }
  };
}());
