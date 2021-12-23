const { TwitterAccount, TwitterFollow } = require('../db/models.js');
const twitterClient = require('../clients/twitter-api.js');

module.exports = {
    autoStart: false,
    data: {
        description: 'Fetch tweets from all Twitter accounts followed in servers.',
        cron: '*/15 * * * *',
    },
    async execute(client) {
        const twitterAccounts = await TwitterAccount.findAll();

        for (const twitterAccount of twitterAccounts) {
            // Get the latest tweets from the twitter account
            const newTweets = await twitterClient.v2.userTimeline(twitterAccount.id, {
                since_id: twitterAccount.lastTweetId,
                exclude: ['retweets', 'replies'],
                expansions: ['author_id'],
                'tweet.fields': ['id', 'created_at'],
                'user.fields': ['username'],
            });

            // Generate list of messages to send in each channel that followed the twitter account
            const tweetUser = newTweets.includes.users[0];
            const messages = [];

            newTweets.tweets.forEach(tweet => {
                console.log(tweet.text);
                const message = `New tweet from **${tweetUser.name}**:\nhttps://twitter.com/i/status/${tweet.id}`;
                messages.unshift(message);
            });

            // Send the messages to each channel
            const twitterFollows = await TwitterFollow.findAll({
                where: {
                    twitterAccountId: twitterAccount.id,
                },
            });

            for (const twitterFollow of twitterFollows) {
                const channel = client.channels.cache.get(twitterFollow.channelId);

                for (const message of messages) {
                    await channel.send(message);
                }
            }
        }
    },
};