const Discord = require('discord.js');
const config = require('../config.json');
const package = require('../package.json');
const request = require('request');
const logger = require('kailogs');

module.exports = {
    name: "map",
    description: "Displays info on a map",
    options: [
        {
          name: 'map',
          type: 3, // 'STRING' Type
          description: 'The amp you want info about',
          required: true,
          choices: [
            {
                name: 'Ascent',
                value: '7eaecc1b-4337-bbf6-6ab9-04b8f06b3319'
            },
            {
                name: 'Split',
                value: 'd960549e-485c-e861-8d71-aa9d1aed12a2'
            },
            {
                name: 'Fracture',
                value: 'b529448b-4d60-346e-e89e-00a4c527a405'
            },
            {
                name: 'Bind',
                value: '2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba'
            },
            {
                name: 'Breeze',
                value: '2fb9a4fd-47b8-4e7d-a969-74b4046ebd53'
            },
            {
                name: 'Icebox',
                value: 'e2ad5c54-4114-a870-9641-8ea21279579a'
            },
            {
                name: 'Haven',
                value: '2bee0dc9-4ffe-519b-1cbd-7fbe763a6047'
            }
          ]
        }
      ],
    async execute(interaction, client) {
        var options = {
            url: `https://valorant-api.com/v1/maps/${interaction.options.get('map').value}`,
        };

        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);

                console.log(data);

                const embed = new Discord.MessageEmbed()
                embed.setColor(config.discord.embedHex)
                embed.setTitle(data.data.displayName)
                embed.setThumbnail(data.data.displayIcon)
                embed.setImage(data.data.listViewIcon)
                embed.setDescription(data.data.coordinates)

                // data.data.callouts.forEach((c) => {
                //     embed.addField(`${c.superRegionName} ${c.regionName}`, `X: ${c.location.x}, Y: ${c.location.y}`)
                // })

                interaction.reply({
                    embeds: [ embed ]
                });
            }
        }
          
        request(options, callback);
    }
}