const { Client, Collection, Intents } = require('discord.js');
const dotenv = require('dotenv');
const utils = require('./utils.js');

dotenv.config();

const client = new Client({
    intents: [Intents.FLAGS.GUILDS]
});
client.commands = new Collection();

utils.registerCommands(client, './commands');
utils.registerEvents(client, './events');

client.login(process.env.TOKEN);