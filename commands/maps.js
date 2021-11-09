const Discord = require('discord.js');
const config = require('../config.json');
const package = require('../package.json');
const request = require('request');
const logger = require('kailogs');

module.exports = {
    name: "maps",
    description: "Displays all active maps",
    async execute(interaction, client) {
        var options = {
            url: `https://valorant-api.com/v1/maps`,
        };

        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);

                //console.log(data);

                const embed = new Discord.MessageEmbed()
                embed.setColor(config.discord.embedHex)
                embed.setTitle("Valorant Maps")

                data.data.forEach((map) => {
                    embed.addField(map.displayName, map.coordinates)
                })

                interaction.reply({
                    embeds: [ embed ]
                });
            }
        }
          
        request(options, callback);
    }
}