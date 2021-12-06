const fs = require('fs');
const { Collection } = require('discord.js');

module.exports = {
    /**
     * Get modules from a folder
     * 
     * @param {String} folder The folder where module files (*.js) are located.
     * @return {Collection} Collection of modules.
     */
    getModules(folder) {
        const modules = new Collection();
        const moduleFiles = fs.readdirSync(folder, options={ withFileTypes: true })
            .filter(file => file.isFile() && file.name.endsWith('.js'));

        for (const file of moduleFiles) {
            const mod = require(`${folder}/${file.name}`);
            modules.set(file.name.slice(0, -3), mod);
        }

        return modules;
    },
};