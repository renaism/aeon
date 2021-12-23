const { SlashCommandBuilder } = require('@discordjs/builders');
const { TwitterAccount, TwitterFollow } = require('../db/models.js');
const twitterClient = require('../clients/twitter-api.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tweetfetch')
        .setDescription('[DEV] Manually fetch new tweets.'),
    dev: true,
    async execute(interaction) {
        const twitterAccounts = await TwitterAccount.findAll();

        for (const twitterAccount of twitterAccounts) {
            // Get the latest tweets from the twitter account
            const newTweets = await twitterClient.v2.userTimeline(twitterAccount.id, {
                exclude: ['retweets', 'replies'],
                expansions: ['author_id'],
                'tweet.fields': ['id', 'created_at'],
                'user.fields': ['username'],
            });

            // Generate list of messages to send in each channel that followed the twitter account
            const tweetUser = newTweets.includes.users[0];
            const messages = [];

            newTweets.tweets.forEach(tweet => {
                const message = `New tweet from **${tweetUser.name}**:\nhttps://twitter.com/i/status/${tweet.id}`;
                messages.push(message);
            });

            // Send the messages to each channel
            const twitterFollows = await TwitterFollow.findAll({
                where: {
                    twitterAccountId: twitterAccount.id,
                },
            });

            for (const twitterFollow of twitterFollows) {
                const channel = interaction.client.channels.cache.get(twitterFollow.channelId);

                for (const message of messages) {
                    await channel.send(message);
                }
            }
        }

        return interaction.reply('All tweets fetched in their respective channel!');
    },
};