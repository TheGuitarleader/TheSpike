const Discord = require('discord.js');
const config = require('../config.json');
const request = require('request');
const logger = require('kailogs');

module.exports = function(client) {
    const maps = [ "Ascent", "Split", "Fracture" , "Bind", "Breeze", "Icebox", "Haven"];
    const types = [ "attackers", "defenders"];

    var map = maps[Math.floor(Math.random() * maps.length)];
    var type = types[Math.floor(Math.random() * types.length)];

    client.user.setPresence({ activities: [{ name: `${type} on ${map}` }], status: 'online' });
    logger.log(`Updated map to '${map}'`);
}