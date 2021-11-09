const Discord = require('discord.js');
const config = require('../config.json');
const logger = require('kailogs');
const sqlite = require('sqlite3').verbose();
let db = new sqlite.Database('./data.db');
const { API, Regions, Locales, Queue } = require("node-valorant-api");

module.exports = {
    name: "verify",
    description: "Links your Riot account to this server.",
    options: [
        {
          name: 'riot_id',
          type: 3, // 'STRING' Type
          description: 'Your Riot ID that is used by players to find you in Valorant.',
          required: true,
        },
        {
            name: 'tagline',
            type: 3, // 'STRING' Type
            description: 'The #**** behind your Riot ID',
            required: true,
        }
      ],
    async execute(interaction, client) {
        const valorant = new API(Regions.NA, config.riot.apiKey, Regions.AMERICAS);
        valorant.AccountV1.getAccountByRiotID(interaction.options.get('riot_id').value, interaction.options.get('tagline').value).then(account => {
            console.log(account);

            db.run(`INSERT OR REPLACE INTO accounts(discordID, puuID, discordName, riotName, riotTag) VALUES("${interaction.user.id}", "${account.puuid}", "${interaction.user.username}", "${account.gameName}", "${account.tagLine}")`, function(err) {
                if(err) {
                    logger.error(err, 'database');
                    interaction.reply({
                        content: `Error: ${err}`,
                        ephemeral: true
                    });
                }
                else
                {
                    var guild = interaction.guild;
                    var member = guild.members.cache.get(interaction.user.id);

                    console.log(member);

                    member.roles.add(guild.roles.cache.find(r => r.id === config.discord.role));
                    member.setNickname(account.gameName);

                    logger.log(`Added profile for user '${account.gameName}#${account.tagLine}'`, 'main');
                    interaction.reply({
                        content: ':white_check_mark: **Successfully verified account** `' + account.gameName + '#' + account.tagLine + '`',
                        ephemeral: true
                    });
    
                    var user = interaction.user;
                    const modEmbed = new Discord.MessageEmbed()
                    modEmbed.setColor('fff200')
                    modEmbed.setAuthor(`${user.username}#${user.discriminator} verified account`, user.displayAvatarURL())
                    modEmbed.addField("Riot ID:", `${account.gameName}#${account.tagLine}`, true)
                    modEmbed.setFooter("ID: " + user.id)
                    client.channels.cache.get(config.discord.logging).send({ embeds: [modEmbed] });
                }
            });
        }).catch(err => {
            console.log(err);
            logger.error(`API returned error '${err.message}' at '${err.request.header}'`, 'api');
            interaction.reply({
                content: `API Error: ${err.message}`,
                ephemeral: true
            });
        })
    }
}