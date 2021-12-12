const sequelize = require('./connection.js');

// Initialize models
require('../models/twitter-account.js')(sequelize);

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(() => {
    console.log('All models were synchronized successfully.');
}).catch(console.error);
