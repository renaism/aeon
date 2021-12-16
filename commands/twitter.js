const { Sequelize } = require('sequelize');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { TwitterAccount, TwitterFollow } = require('../db/models.js');
const twitterClient = require('../clients/twitter-api.js');

async function follow(interaction) {
    const username = interaction.options.getString('username', true);
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;

    // Check if the twitter account is already followed in the server
    const twitterFollow = await TwitterFollow.findOne({
        where: {
            guildId: interaction.guildId,
        },
        include: {
            model: TwitterAccount,
            where: Sequelize.where(Sequelize.fn('lower', Sequelize.col('username')), username.toLowerCase()),
        },
    });

    if (twitterFollow) {
        const embed = new MessageEmbed()
            .setColor('YELLOW')
            .setDescription(`[@${username}](https://twitter.com/${username}/) is already followed in this server! See **\`/twitter list\`**`);

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Get twitter user
    const twitterUser = await twitterClient.v2.userByUsername(username);

    if (!twitterUser.data) {
        const embed = new MessageEmbed()
            .setColor('YELLOW')
            .setDescription(`Can't find twitter account with the handle **@${username}**!`);

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Create twitter account entry if not exist yet
    const [twitterAccount, twitterAccountCreated] = await TwitterAccount.findOrCreate({
        where: {
            id: twitterUser.data.id,
        },
        defaults: {
            username: twitterUser.data.username,
            name: twitterUser.data.name,
        },
    });

    if (twitterAccountCreated) {
        // Get the last tweet from the user for lastTweetId field
        const latestTweets = await twitterClient.v2.userTimeline(twitterUser.data.id, {
            exclude: ['retweets', 'replies'],
            max_results: 5,
        });

        if (latestTweets.tweets.length > 0) {
            twitterAccount.lastTweetId = latestTweets.tweets[0].id;
            await twitterAccount.save();
        }
    }

    // Create new twitter follow entry for the server
    const [newTwitterFollow, twitterFollowCreated] = await TwitterFollow.findOrCreate({
        where: {
            twitterAccountId: twitterAccount.id,
            guildId: interaction.guildId,
        },
        defaults: {
            channelId: channel.id,
        },
    });

    if (!twitterFollowCreated) {
        newTwitterFollow.channelId = channel.id;
        await newTwitterFollow.save();
    }

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
            guildId: interaction.guildId,
        },
        include: {
            model: TwitterAccount,
            where: Sequelize.where(Sequelize.fn('lower', Sequelize.col('username')), username.toLowerCase()),
        },
    });

    if (!twitterFollow) {
        const embed = new MessageEmbed()
            .setColor('YELLOW')
            .setDescription(`[@${username}](https://twitter.com/${username}/) isn't followed in this server!`);

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Delete the twitter follow entry for this server
    await twitterFollow.destroy();

    // If no other server follows the twitter account, delete the twitter account entry
    const twitterFollowsCount = await TwitterFollow.count({
        where: {
            twitterAccountId: twitterFollow.twitterAccountId,
        },
    });

    if (twitterFollowsCount === 0) {
        await TwitterAccount.destroy({
            where: {
                id: twitterFollow.twitterAccountId,
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
        include: TwitterAccount,
    });

    if (twitterFollows.length === 0) {
        const embed = new MessageEmbed()
            .setDescription('This server has not followed any Twitter account yet. Use **`/twitter follow`** to follow a Twitter account.');

        return interaction.reply({ embeds: [embed] });
    }

    let followList = '';
    twitterFollows.forEach((twitterFollow, i) => {
        const name = twitterFollow.twitterAccount.name;
        const username = twitterFollow.twitterAccount.username;
        const channel = interaction.guild.channels.cache.get(twitterFollow.channelId);
        followList += `${i + 1}. ${name} ([@${username}](https://twitter.com/${username}/)) in ${channel}\n`;
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