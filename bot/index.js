/*********************************************************************************** *
 * MIT License
 *
 * Copyright (c) 2017 Raphael "rGunti" Guntersweiler
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * ********************************************************************************* */

const debug = require('debug')('discomoka:Bot');
const debugEvent = require('debug')('discomoka:Bot.Event');
const config = require('../base/config');
const moment = require('moment');
const db = require('../db');
const {Client} = require('discord.io');
const commandRegister = require('./commands');

let startupDate = moment();
let updateInterval;
let commandsHandled = 0;

const bot = new Client({
    autorun: true,
    token: config.getValue(config.KEYS.API_KEY)
});

bot.on('ready', function (event) {
    debug('Logged in as [%s] %s', bot.id, bot.username);
    debug('To invite %s to your server, go to the following URL:\n' +
        'https://discordapp.com/oauth2/authorize?client_id=%s&scope=bot&permissions=372534272',
        bot.username, bot.id
    );

    bot.setPresence({game: {name: 'a Bot, ' + commandsHandled + ' requests handled in this session'}});
    startupDate = moment();
    //updateInterval = setInterval(() => {
    //    if (bot.connected) {
    //        bot.setPresence({game: {name: 'since ' + startupDate.fromNow(true)}});
    //    } else {
    //        clearInterval(updateInterval);
    //    }
    //}, 15000);
});

bot.on('disconnect', function (errMsg, code) {
    debug('Disconnected (Error %s: %s)', code, errMsg);
    //clearInterval(updateInterval);

    debug('Trying to reconnect...');
    bot.connect();
});

bot.on('message', async function (userName, userID, channelID, message, event) {
    debug('%s (%s) has sent a message in channel %s: %s', userName, userID, channelID, message);

    // Generate Event Parameters
    let sourceChannel = bot.channels[channelID];
    let sourceServer = sourceChannel ? bot.servers[sourceChannel.guild_id] : null;
    let eventParameters = {
        IssuedBy: bot.users[userID],
        IssuedOn: {
            Channel: sourceChannel,
            Server: sourceServer,
            IsPrivateChannel: (!sourceChannel)
        },
        MessageText: message,
        MessageDetail: event.d,
        BotClient: bot
    };

    // Check if user exists.
    // If it does and his name is different, update it
    // If it does not, create it
    let dbUser = await db.Users.getById(userID);
    if (dbUser) {
        if (dbUser.name !== userName) {
            dbUser.name = userName;
            dbUser.discriminator = eventParameters.IssuedBy.discriminator;
            db.Users.update(dbUser);
        }

        if (!eventParameters.IssuedOn.IsPrivateChannel) {
            let member = eventParameters.IssuedOn.Server.members[userID];
            let serverMember = await db.ServerMembers.getById(sourceServer.id, userID);
            if (serverMember) {
                let memberName = member.nick ? member.nick : userName;
                if (serverMember.name !== memberName) {
                    serverMember.name = memberName;
                    await db.ServerMembers.update(serverMember);
                }
            } else {
                await db.ServerMembers.insert({
                    server_id: sourceServer.id,
                    user_id: userID,
                    name: userName
                });
            }
        }
    } else {
        await db.Users.insert({id: userID, name: userName, discriminator: eventParameters.IssuedBy.discriminator});
    }

    // Do not process Bot Messages
    if (userID === bot.id) { return; }

    // Check if is command and execute it
    if (message.startsWith(commandRegister.CommandPrefix)) {
        let commandName = message.split(' ')[0];
        if (commandRegister.hasCommand(commandName)) {
            commandRegister.executeCommand(commandName, eventParameters);
            commandsHandled++;
            bot.setPresence({game: {name: 'a Bot, ' + commandsHandled + ' requests handled in this session'}});
        }
    }
});

//bot.on('presence', function (userName, userID, status, game, event) {
//    debug('%s (%s) has changed their presence: %s : %s', userName, userID, status, game ? game.name : '-');
//});

//bot.on('any', function (event) {
//    debug('%s happened', event.t || event.op);
//});

//bot.on('messageCreate', function (userName, userID, channelID, message) {
//    debugEvent('"messageCreate" happened: %s (%s) => %s: %s', userName, userID, channelID, message);
//});

//bot.on('messageUpdate', function (oldMessage, newMessage) {
//    debugEvent('"messageUpdate" happened: %s => %s', oldMessage, newMessage);
//});

//bot.on('presenceUpdate', function () {
//    debugEvent('"presenceUpdate" happened');
//});

//bot.on('userUpdate', function () {
//    debugEvent('"userUpdate" happened');
//});

//bot.on('userSettingsUpdate', function () {
//    debugEvent('"userSettingsUpdate" happened');
//});

bot.on('guildCreate', async (server) => {
    debugEvent('"guildCreate" happened: (%s) %s', server.id, server.name);

    let existingServer = await db.Servers.getById(server.id);
    if (existingServer) {
        if (server.name !== existingServer.name) {
            await db.Servers.update({ id: server.id, name: server.name });
        }
    } else {
        await db.Servers.insert({ id: server.id, name: server.name });
    }
});

bot.on('guildUpdate', async (oldServer, newServer) => {
    debugEvent('"guildUpdate" happened: %s => %s', oldServer ? oldServer.id : '<null>', newServer.id);

    let existingServer = await db.Servers.getById(newServer.id);
    if (existingServer) {
        await db.Servers.update({ id: newServer.id, name: newServer.name });
    } else {
        await db.Servers.insert({ id: newServer.id, name: newServer.name });
    }
});

//bot.on('guildDelete', function (server) {
//    debugEvent('"guildDelete" happened: %s', server.id);
//});

//bot.on('guildMemberAdd', function (member) {
//    debugEvent('"guildMemberAdd" happened: %s', member);
//});

//bot.on('guildMemberUpdate', function (oldMember, newMember) {
//    debugEvent('"guildMemberUpdate" happened: (%s)', newMember.id);
//});

//bot.on('guildMemberRemove', function (member) {
//    debugEvent('"guildMemberRemove" happened: %s', member);
//});

//bot.on('guildRoleCreate', function (role) {
//    debugEvent('"guildRoleCreate" happened: (%s) %s', role.id, role.name);
//});

//bot.on('guildRoleUpdate', function (oldRole, newRole) {
//    debugEvent('"guildRoleUpdate" happened: %s => %s', oldRole, newRole);
//});

//bot.on('guildRoleDelete', function (role) {
//    debugEvent('"guildRoleDelete" happened: %s', role.id);
//});

//bot.on('channelCreate', function (channel) {
//    debugEvent('"channelCreate" happened: (%s)', channel.id);
//});

//bot.on('channelUpdate', function (oldChannel, newChannel) {
//    debugEvent('"channelUpdate" happened: %s => %s', oldChannel, newChannel);
//});

//bot.on('channelDelete', function (channel) {
//    debugEvent('"channelDelete" happened: ', channel);
//});

//bot.on('voiceStateUpdate', function () {
//    debugEvent('"voiceStateUpdate" happened');
//});

//bot.on('voiceServerUpdate', function () {
//    debugEvent('"voiceServerUpdate" happened');
//});

module.exports = bot;
