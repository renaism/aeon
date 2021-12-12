const sequelize = require('./connection.js');

// Load models
const TwitterAccount = require('../models/twitter-account.js')(sequelize);

module.exports = { TwitterAccount };