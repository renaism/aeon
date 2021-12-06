const { Client, Intents } = require('discord.js');
const dotenv = require('dotenv');
const utils = require('./utils.js');

dotenv.config();

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_VOICE_STATES,
    ],
});
client.isDebug = process.env.DEBUG === 'true';

// Load command modules
client.commands = utils.getModules('./commands');

if (client.isDebug) {
    const devCommands = utils.getModules('./dev-commands');
    client.commands = client.commands.concat(devCommands);
}

// Register event modules
client.events = utils.getModules('./events');
client.events.forEach((event, name) => {
    if (event.once) {
        client.once(name, (...args) => event.execute(...args));
    } else {
        client.on(name, async (...args) => await event.execute(...args));
    }
});

client.login(process.env.TOKEN);