const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { TwitterAccount, TwitterFollow } = require('../db/models.js');

async function follow(interaction) {
    const username = interaction.options.getString('username', true);
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;

    // Check if the twitter account is already followed in the server
    const twitterFollow = await TwitterFollow.findOne({
        where: {
            twitterAccountUsername: username,
            guildId: interaction.guildId,
        },
    });

    if (twitterFollow) {
        const embed = new MessageEmbed()
            .setColor('YELLOW')
            .setDescription(`[@${username}](https://twitter.com/${username}/) is already followed in this server! See **\`/twlist\`**`);

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Create twitter account entry if not exist yet
    await TwitterAccount.findOrCreate({
        where: {
            username: username,
        },
    });

    // Create twitter follow entry for the server
    await TwitterFollow.create({
        twitterAccountUsername: username,
        guildId: interaction.guildId,
        channelId: channel.id,
    });

    const embed = new MessageEmbed()
        .setColor('BLUE')
        .setDescription(`Followed [@${username}](https://twitter.com/${username}/) in ${channel}.`);

    return interaction.reply({ embeds: [embed] });
}

async function unfollow(interaction) {
    const username = interaction.options.getString('username', true);

    // Check if the twitter account is already followed in the server
    const twitterFollow = await TwitterFollow.findOne({
        where: {
            twitterAccountUsername: username,
            guildId: interaction.guildId,
        },
    });

    if (!twitterFollow) {
        const embed = new MessageEmbed()
            .setColor('YELLOW')
            .setDescription(`[@${username}](https://twitter.com/${username}/) isn't followed in this server!`);

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Delete the twitter follow entry for this server
    await TwitterFollow.destroy({
        where: {
            twitterAccountUsername: username,
            guildId: interaction.guildId,
        },
    });

    // If no other server follows the twitter account, delete the twitter account entry
    const twitterFollowsCount = await TwitterFollow.count({
        where: {
            twitterAccountUsername: username,
        },
    });

    if (twitterFollowsCount === 0) {
        await TwitterAccount.destroy({
            where: {
                username: username,
            },
        });
    }

    const embed = new MessageEmbed()
        .setColor('RED')
        .setDescription(`Unfollowed [@${username}](https://twitter.com/${username}/).`);

    return interaction.reply({ embeds: [embed] });
}

async function list(interaction) {
    // Get all twitter accounts followed by the server
    const twitterFollows = await TwitterFollow.findAll({
        where: {
            guildId: interaction.guildId,
        },
    });

    if (twitterFollows.length === 0) {
        const embed = new MessageEmbed()
            .setDescription('This server has not followed any Twitter account yet. Use **`/twitter follow`** to follow a Twitter account.');

        return interaction.reply({ embeds: [embed] });
    }

    let followList = '';
    twitterFollows.forEach((twitterFollow, i) => {
        const username = twitterFollow.twitterAccountUsername;
        const channel = interaction.guild.channels.cache.get(twitterFollow.channelId);
        followList += `${i + 1}. [@${username}](https://twitter.com/${username}/) in ${channel}\n`;
    });

    const embed = new MessageEmbed()
        .setColor('BLUE')
        .setTitle('Followed Twitter Accounts')
        .setDescription(followList)
        .setFooter(`Total: ${twitterFollows.length}`);

    return interaction.reply({ embeds: [embed] });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('twitter')
        .setDescription('Manage followed Twitter account on this server.')
        .addSubcommand(subcommand =>
            subcommand.setName('follow')
                .setDescription('Follow a Twitter account on this server.')
                .addStringOption(option =>
                    option.setName('username')
                        .setDescription('The Twitter username to follow (without \'@\').')
                        .setRequired(true))
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel where new tweets are posted.')))
        .addSubcommand(subcommand =>
            subcommand.setName('unfollow')
                .setDescription('Unfollow a Twitter account on this server.')
                .addStringOption(option =>
                    option.setName('username')
                        .setDescription('The Twitter username to unfollow. See **`/twitter list`**`')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('list')
                .setDescription('List all followed Twitter accounts on this server.')),
    async execute(interaction) {
        switch (interaction.options.getSubcommand()) {
            case 'follow':
                await follow(interaction);
                break;
            case 'unfollow':
                await unfollow(interaction);
                break;
            default:
                await list(interaction);
                break;
        }
    },
};