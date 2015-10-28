(function () {
'use strict';
/*
CREATE SCHEMA opendispatcher
drop schema "opendispatcher" cascade;
truncate table "SequelizeMeta";
*/
module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.createSchema('opendispatcher')
    ]);
  },down: function (queryInterface) {
    return Promise.all([
      queryInterface.dropSchema('opendispatcher')
    ]);
  }
};
}());
