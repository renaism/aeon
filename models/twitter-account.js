const { DataTypes, Model } = require('sequelize');

class TwitterAccount extends Model {}

module.exports = (sequelize) => {
    return TwitterAccount.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        username: DataTypes.STRING,
        name: DataTypes.STRING,
        lastTweetId: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'twitterAccount',
        underscored: true,
    });
};