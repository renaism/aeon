const { DataTypes, Model } = require('sequelize');

class TwitterAccount extends Model {}

module.exports = (sequelize) => {
    return TwitterAccount.init({
        username: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        last_tweet_id: {
            type: DataTypes.INTEGER,
        },
    }, {
        sequelize,
        modelName: 'TwitterAccount',
    });
};