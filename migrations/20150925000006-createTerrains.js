(function () {
'use strict';
module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.createTable("Terrains", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        geometry: Sequelize.GEOMETRY('MULTIPOLYGON', 4326),
        "createdAt": {type: Sequelize.DATE, allowNull: false},
        "updatedAt": {type: Sequelize.DATE, allowNull: false},
        "deletedAt": Sequelize.DATE,
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
      queryInterface.dropTable('Terrains',{schema: 'opendispatcher'})
    ]);
  }
};
}());
