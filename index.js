const { Client, Intents } = require('discord.js');
const config = require('./config.js');
const utils = require('./utils.js');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_VOICE_STATES,
    ],
});

// Load command modules
client.commands = utils.getModules('./commands');

if (config.env === 'dev') {
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

client.login(config.token);