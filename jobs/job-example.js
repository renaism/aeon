module.exports = {
    autoStart: false,
    data: {
        description: 'Example job.',
        cron: undefined,
    },
    async execute(client) {
        console.log(`${client.user.tag}: Beep!`);
    },
};