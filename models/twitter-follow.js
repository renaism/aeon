const { DataTypes, Model } = require('sequelize');

class TwitterFollow extends Model {}

module.exports = (sequelize) => {
    return TwitterFollow.init({
        guildId: DataTypes.STRING,
        channelId: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'twitterFollow',
        underscored: true,
    });
};