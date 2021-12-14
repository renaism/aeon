const sequelize = require('./connection.js');

// Load models
const TwitterAccount = require('../models/twitter-account.js')(sequelize);
const TwitterFollow = require('../models/twitter-follow.js')(sequelize);

module.exports = {
    TwitterAccount,
    TwitterFollow,
};