const { Client, Intents } = require('discord.js');
const schedule = require('node-schedule');
const config = require('./config.js');
const utils = require('./utils.js');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MESSAGES,
    ],
});

// Load command modules
client.commands = utils.getModules('./commands');

if (config.env === 'dev') {
    const devCommands = utils.getModules('./dev-commands');
    client.commands = client.commands.concat(devCommands);
}

// Register event modules
client.events = utils.getModules('./events');
client.events.forEach((event, name) => {
    if (event.once) {
        client.once(name, (...args) => event.execute(...args));
    } else {
        client.on(name, async (...args) => await event.execute(...args));
    }
});

// Set job schedules
client.jobs = utils.getModules('./jobs');
client.jobs.forEach((job, name) => {
    if (job.autoStart) {
        if (job.data && job.data.cron) {
            const scheduledJob = schedule.scheduleJob(job.data.cron, () => job.execute(client));
            console.log(`Scheduled job "${name}": ${job.data.cron}`);
            scheduledJob.on('scheduled', () => {
                console.log(`[${new Date()}] Starting job "${name}"`);
            });
            scheduledJob.on('success', () => {
                console.log(`[${new Date()}] Finished job "${name}"`);
            });
            scheduledJob.on('error', (err) => {
                console.log(`[${new Date()}] Error on job "${name}": ${err}`);
            });
        } else {
            job.execute(client);
        }
    }
});

client.login(config.token);