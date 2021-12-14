const { DataTypes, Model } = require('sequelize');

class TwitterAccount extends Model {}

module.exports = (sequelize) => {
    return TwitterAccount.init({
        username: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        lastTweetId: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'TwitterAccount',
    });
};