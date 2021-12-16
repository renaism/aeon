const { TwitterApi } = require('twitter-api-v2');
const config = require('../config.js');

module.exports = new TwitterApi(config.twitter.bearerToken);