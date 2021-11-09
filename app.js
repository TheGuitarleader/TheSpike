const fs = require('fs');
const Discord = require('discord.js');
const Client = require('./client/client.js');
const config = require('./config.json');
const package = require('./package.json');
const logger = require('kailogs');
const clock = require('date-events')();
const moment = require('moment');
const updateStatus = require('./functions/updateStatus.js');
const { type } = require('os');

const client = new Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const sqlite = require('sqlite3').verbose();
let db = new sqlite.Database('./data.db');

for(const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

console.log(client.commands);

logger.loadLog('./logs');
logger.log(`${package.name} v${package.version}`, 'main');
client.login(config.discord.token);

client.once('disconnect', () => {
	logger.warn('Disconnected from Discord', 'main');
});

client.once('ready', () => {
    logger.log('Online and connected to Discord', 'main');
    updateStatus(client);
});

// Saves the log at 11:59pm
clock.on('23:59', function (date) {
    logger.save();
    logger.createLog('./logs');
});

// client.guilds.fetch(config.discord.guild).then((guild) => {
//     guild.commands.set(client.commands).then(() => {
//         logger.log("Deployed guild commands");
//     });
// }).catch(logger.error);

// setInterval(function() {
//     console.log("Updating Players");
//     client.guilds.fetch(config.discord.guild).then((guild) => {updatePlayers(guild, client)}).catch(logger.error);
// }, 120000);

setInterval(function() {
    updateStatus(client);
}, 35 * 60000);

// Handle commands
client.on('messageCreate', async message => {
    if(message.author.bot) return;
    if(!message.content.startsWith(config.discord.botPrefix)) return;

    console.log(message.author.id);
    //console.log(client.application.owner.id);

    if (message.content === '!deploy' && message.author.id === config.discord.devID) {
        await message.guild.commands
          .set(client.commands)
          .then(() => {
            message.reply('Deployed!');
          })
          .catch(err => {
            message.reply('Could not deploy commands! Make sure the bot has the application.commands permission!');
            console.error(err);
          });
    }
    
    // try {
    //     const args = message.content.slice(config.discord.botPrefix.length).split(/ +/);
    //     const commandName = args.shift().toLowerCase();
    //     const command = client.commands.get(commandName);
    //     command.execute(message, client); 
    //     logger.log(`Ran command: '${config.discord.botPrefix}${commandName}' from '${message.author.username}'`, 'main');
        
    // } catch(err) {
    //     logger.warn(`Unknown command: '${message.content}' from '${message.author.username}' (${message.guild.name})`, 'main');
    //     logger.error(err, 'main');
    // }
});

//
// Handle Interactions
//
client.on('interactionCreate', async interaction => {
    const command = client.commands.get(interaction.commandName.toLowerCase());

    try {
        command.execute(interaction, client); 
        logger.log(`Received interaction: '${interaction.id}' from '${interaction.member.displayName}'`, 'main');
        
    } catch(err) {
        logger.warn(`Unknown command: '${interaction.id}' from '${message.author.username}' (${interaction.guild.name})`, 'main');
        logger.error(err, 'main');
        interaction.followUp({
            content: ':x: `' + err + '`',
            ephemeral: true
        });
    }
  });


//
// Voice Channel create and delete
//
client.on('voiceStateUpdate', (oldState, newState) => {
    var catagory = client.channels.cache.get(config.discord.channel);
    var channels = catagory.children.filter((c) => c.type !== "category");

    if(newState.channel != null && newState.channel.name == 'Join to Create!') { 
        newState.guild.channels.create(`Game Chat`, {
            type: 'GUILD_VOICE',
            parent: config.discord.channel,
            userLimit: 5
        }).then(vc => {
            newState.setChannel(vc);
        })
    }

    if(oldState.channel != null && oldState.channel.name == 'Game Chat' )
    {
        if(oldState.channel.members.size < 1)
        {
            oldState.channel.delete();
        }
    }
});

//
// New member joins
//
client.on('guildMemberAdd', member => {
    logger.log(`User '${member.displayName}' (${member.id}) joined server '${member.guild.name}' (${member.guild.id})`)

    var createdDate = new Date(member.user.createdAt);
    console.log(createdDate);

    const embed = new Discord.MessageEmbed()
    .setColor('1f8b4c')
    .setAuthor(`${member.user.username}#${member.user.discriminator} joined the guild`)
    .addField('Total Users:', member.guild.memberCount.toString(), true)
    .addField('Account created:', `${createdDate.toString().split(" ").slice(0, 4).join(" ")} (${getActiveDays(member.user.createdAt) -1} days old)`, true)
    .setFooter("ID: " + member.user.id)
    client.channels.cache.get(config.discord.logging).send({ embeds: [embed] });
});


//
// Member leaves
//
client.on('guildMemberRemove', member => {
    logger.log(`User '${member.displayName}' (${member.id}) left server '${member.guild.name}' (${member.guild.id})`)

    var createdDate = new Date(member.joinedAt);
    console.log(createdDate);

    const embed = new Discord.MessageEmbed()
    .setColor('E74C3C')
    .setAuthor(`${member.user.username}#${member.user.discriminator} left the guild`)
    .addField('Total Users:', member.guild.memberCount.toString(), true)
    .addField('Member since:', `${createdDate.toString().split(" ").slice(0, 4).join(" ")} (${getActiveDays(member.joinedAt) -1} days old)`, true)
    .setFooter("ID: " + member.user.id)
    client.channels.cache.get(config.discord.logging).send({ embeds: [embed] });

    db.run(`DELETE FROM accounts WHERE discordID = "${member.id}"`, (err) => {
        if(err){
            logger.error(err, 'database');
        }
        else
        {
            logger.log(`Removed account '${member.user.username}'`, 'event');
        }
    });
});


//
// Log invite creates
//
client.on('inviteCreate', (invite) => {
    console.log(invite);
    logger.log(`User '${invite.inviter.username}' created invite' (${invite.code})`)

    var user = client.users.cache.find(user => user.id === invite.inviter.id);
    var createdDate = new Date(invite.createdAt);
    var expireDate = new Date(invite.expiresAt);

    const embed = new Discord.MessageEmbed()
    .setColor('1f8b4c')
    .setAuthor(`${user.username}#${user.discriminator} created invite`, user.avatarURL())
    .addField('Code:', invite.code)
    .addField('Created:', `${moment(createdDate).format('llll')} (${getActiveMinutes(invite.createdAt)} minutes ago)`)
    .addField('Expires:', `${moment(expireDate).format('llll')} (${getActiveMinutes(invite.expiresAt)} minutes)`)
    .setFooter("ID: " + user.id)
    client.channels.cache.get(config.discord.logging).send({ embeds: [embed] });
});


//
// Functions
//
function getActiveMinutes(date) {
    var createdDate = new Date(date);
    console.log(createdDate);
    var currentDate = new Date(Date.now());
    var diffMin = Math.ceil(Math.abs(currentDate - createdDate) / (1000 * 60));
    console.log(diffMin);
    return diffMin;
}

function getActiveDays(date) {
    var createdDate = new Date(date);
    console.log(createdDate);
    var currentDate = new Date(Date.now());
    var diffDays = Math.ceil(Math.abs(currentDate - createdDate) / (1000 * 60 * 60 * 24));
    console.log(diffDays);
    return diffDays;
}