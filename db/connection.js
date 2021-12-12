const Sequelize = require('sequelize');
const config = require('../config.js');

module.exports = new Sequelize(
    config.db.name,
    config.db.username,
    config.db.password,
    {
        host: config.db.host,
        port: config.db.port,
        dialect: config.db.dialect,
    },
);