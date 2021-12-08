const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription(`List all of ${config.name}'s commands.`),
    async execute(interaction) {
        const embed = new MessageEmbed()
            .setAuthor(config.name, interaction.client.user.avatarURL({ size: 16 }), config.homepage)
            .setTitle('Commands');

        let commandHelp = '';
        interaction.client.commands.forEach(command => {
            if (command.dev) return;
            commandHelp += `**\`/${command.data.name}\`** ${command.data.description}\n`;
        });
        embed.setDescription(commandHelp);

        await interaction.reply({ embeds: [embed] });
    },
};