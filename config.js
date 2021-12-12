const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    // Bot info
    name: process.env.NAME,
    homepage: process.env.HOMEPAGE,
    env: process.env.ENV,

    // Bot credentials
    token: process.env.TOKEN,
    clientID: process.env.CLIENT_ID,
    devGuildID: process.env.DEV_GUILD_ID,

    // DB credentials
    db: {
        name: process.env.DB_NAME,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT,
    },
};