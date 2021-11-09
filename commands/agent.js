const Discord = require('discord.js');
const config = require('../config.json');
const package = require('../package.json');
const request = require('request');
const logger = require('kailogs');

module.exports = {
    name: "agent",
    description: "Displays info on a agent",
    options: [
        {
          name: 'agent',
          type: 3, // 'STRING' Type
          description: 'The agent you want info about',
          required: true,
          choices: [
            {
                name: 'Breach',
                value: '5f8d3a7f-467b-97f3-062c-13acf203c006'
            },
            {
                name: 'Raze',
                value: 'f94c3b30-42be-e959-889c-5aa313dba261'
            },
            {
                name: 'KAY/O',
                value: '601dbbe7-43ce-be57-2a40-4abd24953621'
            },
            {
                name: 'Skye',
                value: '6f2a04ca-43e0-be17-7f36-b3908627744d'
            },
            {
                name: 'Cypher',
                value: '117ed9e3-49f3-6512-3ccf-0cada7e3823b'
            },
            {
                name: 'Sova',
                value: '320b2a48-4d9b-a075-30f1-1f93a9b638fa'
            },
            {
                name: 'Killjoy',
                value: '1e58de9c-4950-5125-93e9-a0aee9f98746'
            },
            {
                name: 'Viper',
                value: '707eab51-4836-f488-046a-cda6bf494859'
            },
            {
                name: 'Phoenix',
                value: 'eb93336a-449b-9c1b-0a54-a891f7921d69'
            },
            {
                name: 'Astra',
                value: '41fb69c1-4189-7b37-f117-bcaf1e96f1bf'
            },
            {
                name: 'Brimstone',
                value: '9f0d8ba9-4140-b941-57d3-a7ad57c6b417'
            },
            {
                name: 'Yoru',
                value: '7f94d92c-4234-0a36-9646-3a87eb8b5c89'
            },
            {
                name: 'Sage',
                value: '569fdd95-4d10-43ab-ca70-79becc718b46'
            },
            {
                name: 'Reyna',
                value: 'a3bfb853-43b2-7238-a4f1-ad90e9e46bcc'
            },
            {
                name: 'Omen',
                value: '8e253930-4c05-31dd-1b6c-968525494517'
            },
            {
                name: 'Jett',
                value: 'add6443a-41bd-e414-f6ad-e58d267f4e95'
            }
          ]
        }
      ],
    async execute(interaction, client) {
        var options = {
            url: `https://valorant-api.com/v1/agents/${interaction.options.get('agent').value}`,
        };

        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);

                console.log(data);

                const embed = new Discord.MessageEmbed()
                .setColor(config.discord.embedHex)
                .setTitle(data.data.displayName)
                .setThumbnail(data.data.displayIconSmall)
                .addField("// Biography", data.data.description)
                .addField("// Role", "--------------------------------------")
                .addField(data.data.role.displayName, data.data.role.description)
                .addField("// Abilities", "--------------------------------------")
                .addField('Q - "' + data.data.abilities[0].displayName + '"', data.data.abilities[0].description, false)
                .addField('E - "' + data.data.abilities[1].displayName + '"', data.data.abilities[1].description, false)
                .addField('C - "' + data.data.abilities[2].displayName + '"', data.data.abilities[2].description, false)
                .addField('X - "' + data.data.abilities[3].displayName + '"', data.data.abilities[3].description, false)

                interaction.reply({
                    embeds: [ embed ]
                });
            }
        }
          
        request(options, callback);
    }
}