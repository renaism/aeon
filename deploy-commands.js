const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const config = require('./config.js');
const utils = require('./utils.js');

const commands = [];

utils.getModules('./commands')
    .forEach(command => commands.push(command.data.toJSON()));

if (config.env === 'dev') {
    utils.getModules('./dev-commands')
        .forEach(command => commands.push(command.data.toJSON()));
}

const rest = new REST({ version: '9' }).setToken(config.token);

rest.put(Routes.applicationGuildCommands(config.clientID, config.devGuildID), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
