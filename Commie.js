"use strict"

const config = require('./util/config.json');
const Tools = require('./util/Tools.js');
const tools = new Tools();
const info = require('./package.json');

const redis = require('redis');
const redisClient = redis.createClient();

const RoleManagement = require('./cmds/RoleManagement.js');
const roleManager = new RoleManagement();

let roleNames = [""];;

const Eris = require("eris");

// ========================== Bot Declaration =================================================== //
const bot = new Eris.CommandClient(config.token, {}, {
    description: info.description,
    owner: info.author,
    prefix: config.prefix
});

redisClient.on('connect', () => {
    console.log('Commie-redis connected at - ' + tools.getFormattedTimestamp());
});

// ========================== Exile Command ===================================================== //
bot.registerCommand('exile', (msg, args) => {
    if (msg.mentions.length == 1) {
        
    } else {
        return 'Invalid mentions, please only mention one member of the server.';
    }
});

// ========================== List Roles Command ================================================ //
bot.registerCommand('listr', (msg, args) => {
    let message = "List of currently available roles:\n";

    roleManager.getAvailableRoles(msg.channel.guild.id, (roles) => {
        if (roles.length > 0) {
            roles.forEach((curr, index, arr) => {
                if (curr.length > 0) {
                    message += "- **" + curr + "**\n";
                }
            });

            bot.createMessage(msg.channel.id, message);
        } else {
            bot.createMessage(msg.channel.id, "Unfortunately no roles are currently available. Speak to your server admin to remedy this!");
        }
    });
}, {
    description: 'List roles that are available to join.',
    fullDescription: 'Lists the roles that have been added by an administrator that are available.'
});

// ========================== Join Role Command ================================================= //
bot.registerCommand('joinr', (msg, args) => {
    let comparison = tools.concatArgs(args);

    if (msg.channel.guild != undefined) {
        let userId = msg.author.id;

        roleManager.joinRole(msg, comparison, (added) => {
            if (added) {
                bot.createMessage(msg.channel.id, "You've successfuly been added to the requested role(s)!");
                msg.delete("Joined role successfully.");
            }
        });
    }
}, {
    description: 'Places you into the requested server role.',
    fullDescription: 'Server admins are able to add select roles to the bot so that anyone can join the role with this command.'
});

// ========================== Add Role Command ================================================== //
bot.registerCommand('addr', (msg, args) => {
    if (msg.channel.guild != null) {
        tools.memberIsMod(msg, (isMod) => {
            if (isMod) {
                roleManager.addRole(msg, args, (added) => {
                    if (added) {
                        bot.createMessage(msg.channel.id, "Added " + tools.concatArgs(args) + " to the list of available roles.");
                    } else {
                        bot.createMessage(msg.channel.id, "It appears no roles were found under this name, please verify you're spelling it correctly. Capitalization isn't necessary.");
                    }
                });
            }
        });
    }
});

// ========================== Delete Role Command =============================================== //
bot.registerCommand('delr', (msg, args) => {
    if (msg.channel.guild != null) {
        tools.memberIsMod(msg, (isMod) => {
            if (isMod) {
                roleManager.deleteRole(msg.channel.guild.id, tools.concatArgs(args), (deleted) => {
                    if (deleted) {
                        bot.createMessage(msg.channel.id, "Role successfully deleted!");
                    }
                });
            }
        });
    }
});

// ========================== Member Joined Server ============================================== //
bot.on("guild_member_add", (member) => {
    console.log(member);
});

// ========================== Ping Command ====================================================== //
bot.registerCommand('ping', (msg, args) => {
    return 'Pong!';
});

// ========================== onReady Event Handler ============================================= //
bot.on("ready", () => {
    console.log('Commie is ready!');
    if (!isNaN(config.notificationChannel)) {
        bot.createMessage(config.notificationChannel, config.notificationMessage + ' > ' + tools.getFormattedTimestamp());
    }

    bot.editStatus('busy', {
        name: config.defaultgame,
        type: 1,
        url: ''
    });
});

// ========================== Connect Bot ======================================================= //
bot.connect();