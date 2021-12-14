const { DataTypes, Model } = require('sequelize');

class TwitterFollow extends Model {}

module.exports = (sequelize) => {
    return TwitterFollow.init({
        twitterAccountUsername: DataTypes.STRING,
        guildId: DataTypes.STRING,
        channelId: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'TwitterFollow',
    });
};