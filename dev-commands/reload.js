const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../utils.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('[DEV] Reload all commands.'),
    async execute(interaction) {
        await interaction.deferReply();
        const oldCommands = interaction.client.commands.clone();

        try {
            interaction.client.commands.clear();
            interaction.client.commands = utils.getModules('./commands');

            if (interaction.client.isDebug) {
                const devCommands = utils.getModules('./dev-commands');
                interaction.client.commands = interaction.client.commands.concat(devCommands);
            }

            await interaction.editReply('Successfully reloaded all commands.');
        } catch (error) {
            interaction.client.commands = oldCommands;
            console.error(error);
            await interaction.editReply('There was an error while reloading all commands, check log on console.');
        }
    },
};