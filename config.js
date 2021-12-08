const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    name: process.env.NAME,
    homepage: process.env.HOMEPAGE,
    env: process.env.ENV,
    token: process.env.TOKEN,
    clientID: process.env.CLIENT_ID,
    devGuildID: process.env.DEV_GUILD_ID,
};