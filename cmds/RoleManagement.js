"use strict"

const redis = require('redis');
const redisClient = redis.createClient();

class RoleManagement {
    constructor(options) {
        this.options = options || {};
    }

    getAvailableRoles(guildId, callback) {
        redisClient.get(guildId + 'roles', (err, replies) => {
            if (replies == null) {
                callback([""]);
            } else {
                callback(replies.split(','));
            }
        });
    }

    getRoleId(msg, comparison, callback) {
        msg.channel.guild.roles.forEach((curr, index, values) => {
            if (curr.name.toLowerCase() == comparison) {
                callback(curr.id);
            }
        });
    }

    joinAllRoles(msg, roleNames) {
        for (var x = 0; x < roleNames.length; x++) {
            this.getRoleId(msg, roleNames[x].toLowerCase(), (roleId) => {
                msg.channel.guild.addMemberRole(msg.author.id, roleId);
            });
        }
    }

    joinRole(msg, roleName, callback) {
        this.getAvailableRoles(msg.channel.guild.id, (roleNames) => {
            if (roleName == "all") {
                this.joinAllRoles(msg, roleNames);
                callback(true);
            } else {
                roleNames.forEach((name, index, array) => {
                    if (name.toLowerCase() == roleName) {
                        this.getRoleId(msg, roleName, (roleId) => {
                            msg.channel.guild.addMemberRole(msg.author.id, roleId);
                            callback(true);
                        });
                    }
                });
            }
        })
    }

    addRole(msg, args, callback) {
        let guildId = msg.channel.guild.id;
        this.getAvailableRoles(guildId, (roleNames) => {
            let comparison = args.join(' ').toLowerCase();
            let guildRoles = msg.channel.guild.roles;
            let found = false;

            guildRoles.forEach((value, key, mapObj) => {
                if (value.name != null) {
                    let name = value.name.toLowerCase();

                    if (name == comparison) {
                        if (!roleNames.includes(value.name)) {
                            roleNames.push(value.name);
                            redisClient.set(guildId + 'roles', roleNames.join(','));
                            found = true;
                        }
                    }
                }
            });

            callback(found);
        });
    }

    deleteRole(guildId, delRole, callback) {
        this.getAvailableRoles(guildId, (roleNames) => {
            roleNames.forEach((name, index, array) => {
                if (name.toLowerCase() == delRole) {
                    roleNames.splice(index, 1);
                }
            });

            redisClient.set(guildId + 'roles', roleNames.join(','));

            callback(true);
        });
    }
}

module.exports = RoleManagement;