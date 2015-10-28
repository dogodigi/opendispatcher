(function () {
'use strict';
module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.createTable({
        table: 'Buildings',
        tableName: 'Buildings',
        name: 'Building',
        schema: 'opendispatcher',
        delimiter: '.',
      }, {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: Sequelize.STRING,
        source: Sequelize.ENUM('openstreetmap', 'bag', 'brk', 'brt', 'bgt', 'user', 'import'),
        sourceId: Sequelize.STRING,
        geometry: Sequelize.GEOMETRY('MULTIPOLYGON', 4326),
        construction: Sequelize.STRING, //@TODO: LUT? Information about construction, e.g. steel, wood, stone
        usage: Sequelize.STRING, //@TODO: LUT? Primary usage of the building, e.g. industrial, office, educational
        procedure: Sequelize.STRING, //@TODO: LUT? Procedure to enter or fight fire.
        riskCategory: Sequelize.STRING, //@TODO: LUT? Risk category.
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
      queryInterface.dropTable('Buildings',{schema: 'opendispatcher'})
    ]);
  }
};
}());
