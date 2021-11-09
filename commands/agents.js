const Discord = require('discord.js');
const config = require('../config.json');
const package = require('../package.json');
const request = require('request');
const logger = require('kailogs');

module.exports = {
    name: "agents",
    description: "Displays all active agents",
    async execute(interaction, client) {
        var options = {
            url: `https://valorant-api.com/v1/agents`,
        };

        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);

                //console.log(data);

                const embed = new Discord.MessageEmbed()
                embed.setColor(config.discord.embedHex)
                embed.setTitle("Valorant Agents")

                data.data.forEach((agent) => {
                    embed.addField(agent.displayName, agent.description)
                })

                interaction.reply({
                    embeds: [ embed ]
                });
            }
        }
          
        request(options, callback);
    }
}