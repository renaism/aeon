const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription(`Check if ${config.name} is online.`),
    async execute(interaction) {
        await interaction.reply('Hello!');
    },
};