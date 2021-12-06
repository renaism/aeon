const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check if the bot is online.'),
    async execute(interaction) {
        await interaction.reply('Hello!');
    },
};