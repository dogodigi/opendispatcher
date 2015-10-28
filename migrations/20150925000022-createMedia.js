(function () {
'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.createTable('Media', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        hyperlink: {type: Sequelize.BOOLEAN, defaultValue: false},
        external: {type: Sequelize.BOOLEAN, defaultValue: false},
        name: Sequelize.STRING,
        mimeType: Sequelize.STRING,
        media: Sequelize.TEXT,
        geometry: Sequelize.GEOMETRY('POINT', 4326),
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
      queryInterface.dropTable('Media',{schema: 'opendispatcher'})
    ]);
  }
};
}());
