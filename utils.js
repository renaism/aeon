const fs = require('fs');

module.exports = {
    /**
     * Register commands from command files in a folder
     * 
     * @param {Client} client
     * @param {String} folder 
     */
    registerCommands(client, folder) {
        const commandFiles = fs.readdirSync(folder).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(`${folder}/${file}`);
            client.commands.set(command.data.name, command);
        }
    },

    /**
     * Register events from event files in a folder
     * 
     * @param {Client} client
     * @param {String} folder
     */
     registerEvents(client, folder) {
        const eventFiles = fs.readdirSync(folder).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const event = require(`${folder}/${file}`);
        
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, async (...args) => await event.execute(...args));
            }
        }
    },
};