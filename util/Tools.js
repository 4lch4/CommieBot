"use strict"

const config = require('../util/config.json');
const moment = require('moment-timezone');
const Chance = require('chance');
const chance = new Chance();

const RoleManagement = require('../cmds/RoleManagement.js');
const roleManager = new RoleManagement();

// ============================================================================================== //
class Tools {
    constructor(options) {
        this.options = options || {};
    }

    getFormattedTimestamp() {
        return moment().tz(config.defaultTimezone).format('YYYY-MM-DD_HH:mm:ss')
    }

    concatArgs(args) {
        let str = "";

        if (args.length > 1) {
            args.forEach((curr, index, arr) => {
                if (str.length > 1) {
                    str += " " + curr.toLowerCase();
                } else {
                    str += curr.toLowerCase();
                }
            })
        } else {
            str = args[0].toLowerCase();
        }

        return str;
    }

    allowedRole(comparison) {
        let allowed = false;

        roleManager.getRoles(guildId, (roleNames) => {
            roleNames.forEach((curr, index, arr) => {
                if (curr != null && curr.toLowerCase() == comparison) {
                    allowed = true;
                }
            });
        });

        return allowed;
    }

    getRoleName(roleId, msg, callback) {
        let roles = msg.channel.guild.roles;

        roles.forEach((curr, index, array) => {
            if (curr.id == roleId) {
                callback(curr);
            }
        });
    }

    memberIsMod(msg, callback) {
        let roles = msg.channel.guild.members.get(msg.author.id).roles;

        roles.forEach((curr, index, arr) => {
            this.getRoleName(curr, msg, (role) => {
                if (role.name == "Commie-Mod") {
                    callback(true);
                }
            });
        });
    }

    getRoleId(msg, comparison) {
        let id = "";

        msg.channel.guild.roles.forEach((curr, index, values) => {
            if (curr.name.toLowerCase() == comparison) {
                id = curr.id;
            }
        })

        return id;
    }

    removeAllRoles(userId, msg, bot) {
        for (var x = 0; x < roleNames.length; x++) {
            let roleId = this.getRoleId(msg, roleNames[x].toLowerCase());
            msg.channel.guild.removeMemberRole(userId, roleId);
        }

        bot.createMessage(msg.channel.id, "You've been removed from all the roles available to you.");
        msg.delete();
    }

    addAllRoles(msg, roleNames, callback) {
        for (var x = 0; x < roleNames.length; x++) {
            let roleId = this.getRoleId(msg, roleNames[x].toLowerCase());
            msg.channel.guild.addMemberRole(userId, roleId);
        }

        bot.createMessage(msg.channel.id, "You've been added to all the roles available to you.");
        msg.delete();
    }

    /**
     * Returns a random integer between {min} and {max}, not including the max.
     * 
     * @param {*} min 
     * @param {*} max 
     */
    getRandom(min, max) {
        return chance.integer({
            min: min,
            max: max
        });
    }

    messageIs(msg, str) {
        let input = ""

        if (msg.content != undefined) {
            input = msg.content.toUpperCase()
        } else {
            input = msg.toUpperCase()
        }

        if (input != null) {
            let comparison = str.toUpperCase()
            return input === comparison
        } else {
            return null
        }
    }

    messageStartsWith(msg, str) {
        let comparison = str.toUpperCase();
        let input = "";

        if (msg.content != undefined) {
            input = msg.content.toUpperCase();
        } else {
            input = msg.toUpperCase();
        }

        return input.startsWith(comparison);
    }
}

module.exports = Tools;