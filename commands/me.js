const sqlite = require('sqlite3').verbose();
const Discord = require('discord.js');
const config = require('../config.json');
const logger = require('kailogs');

let db = new sqlite.Database('./data.db');

module.exports = {
    name: "me",
    description: "Shows info about the current user on the server",
    async execute(interaction, client) {
        db.get(`SELECT * FROM accounts WHERE discordID = ?`, [interaction.user.id], (err, profile) => {

            console.log(profile);

            var createdDate = new Date(interaction.user.createdAt);
            var joinedDate = new Date(interaction.member.joinedAt);

            const embed = new Discord.MessageEmbed()
            .setColor(interaction.member.displayHexColor)
            .setAuthor(`${interaction.user.username}#${interaction.user.discriminator}`)
            .setThumbnail(interaction.user.displayAvatarURL())
            .addField('Riot ID:', `${profile.riotName}#${profile.riotTag}`)
            .addField('Account created:', `${createdDate.toString().split(" ").slice(0, 4).join(" ")} (${getActiveDays(interaction.user.createdAt) -1} days old)`)
            .addField('Member since:', `${joinedDate.toString().split(" ").slice(0, 4).join(" ")} (${getActiveDays(interaction.member.joinedAt) -1} days old)`)
            .setFooter("ID: " + interaction.user.id)
            interaction.reply({
                embeds: [ embed ],
                ephemeral: true,
            });
        });
    }
}

function getActiveDays(date) {
    var createdDate = new Date(date);
    console.log(createdDate);
    var currentDate = new Date(Date.now());
    var diffDays = Math.ceil(Math.abs(currentDate - createdDate) / (1000 * 60 * 60 * 24));
    console.log(diffDays);
    return diffDays;
}