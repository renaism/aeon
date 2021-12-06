const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vcmention')
        .setDescription('Mention everyone in the same voice channel as you.'),
    async execute(interaction) {
        if (!interaction.inGuild()) return;

        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ content: 'You are not in a voice channel!', ephemeral: true });
        }

        if (voiceChannel.members.size === 1) {
            return interaction.reply({ content: 'You are alone in the voice channel! :(', ephemeral: true });
        }

        let mentions = '';
        voiceChannel.members.forEach(member => {
            if (member === interaction.member) return;
            mentions += `${member}`;
        });
        await interaction.reply(`**${interaction.member.nickname}**: ${mentions}`);
    },
};