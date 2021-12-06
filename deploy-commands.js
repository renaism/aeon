const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const dotenv = require('dotenv');
const utils = require('./utils.js');

dotenv.config();

const commands = [];

utils.getModules('./commands')
    .forEach(command => commands.push(command.data.toJSON()));

if (process.env.DEBUG === 'true') {
    utils.getModules('./dev-commands')
        .forEach(command => commands.push(command.data.toJSON()));
}

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEV_GUILD_ID), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
