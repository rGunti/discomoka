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

const debug = require('debug')('discomoka:MAIN');
const config = require('./base/config');
const db = require('./db');
const bot = require('./bot/index');
//const fs = require('fs');
require('./base/ascii_printer');

//const Discord = require('discord.io');
//let bot = new Discord.Client({
//    autorun: true,
//    token: config.getValue(config.KEYS.API_KEY)
//});
//let lastConnectedChannel;
//
//bot.on('ready', function(e) {
//    debug('Logged in as %s - %s', bot.username, bot.id);
//    bot.setPresence({ game: {
//        name: 'right now'
//    } })
//});
//
//bot.on('message', async function(user, userID, channelID, message, event) {
//    debug('%s (%s) has sent a message in channel %s: %s', user, userID, channelID, message);
//
//    let existingUser = await db.getEntitiesWhere('users', { id: userID });
//    if (existingUser.rowCount === 0) {
//        let result = await db.insert('users', { id: userID, name: user });
//        if (result) {
//            debug('New User registered: %s | %s', userID, user);
//        }
//    } else if (existingUser.rows[0].name !== user) {
//        db.update('users', 'id', userID, { name: user });
//    }
//    db.insert('message_log', { user_id: userID, message: message });
//
//    // Drop Message if from bot
//    if (userID === bot.id) { return; }
//
//    if (message === '!ping') {
//        bot.sendMessage({ to: channelID, message: "Pong!" });
//    } else if (message.startsWith('!soundtest')) {
//        let voiceChannelID = message.split(' ')[1];
//        bot.joinVoiceChannel(voiceChannelID, function (error, response) {
//            if (error) {
//                bot.sendMessage({to: channelID, message: ':name_badge: Error while joining voice channel:\n' + error});
//                return debug(error);
//            }
//            lastConnectedChannel = voiceChannelID;
//
//            bot.getAudioContext(voiceChannelID, function (error, stream) {
//                if (error) {
//                    bot.sendMessage({
//                        to: channelID,
//                        message: ':name_badge: Error while getting Audio Context:\n' + error
//                    });
//                    return debug(error);
//                }
//                fs.createReadStream('R:/test.mp3').pipe(stream, {end: false});
//                stream.on('done', function () {
//                    debug('Stream has ended!');
//                });
//            });
//        });
//        //bot.joinVoiceChannel()
//    } else if (message === '!disconnect') {
//        if (lastConnectedChannel) {
//            bot.leaveVoiceChannel(lastConnectedChannel);
//            lastConnectedChannel = null;
//        }
//    } else if (message === '!channels') {
//        let response = '**Your channels**:';
//        let channels = bot.channels;
//        for (let channelID in channels) {
//            let channel = channels[channelID];
//            response += '\n' + channel.id + ' - ' + channel.type + ' ' + channel.name
//        }
//        bot.sendMessage({ to: channelID, message: response });
//    } else if (message === '!servers') {
//        let response = '**Your servers**:';
//        let servers = bot.servers;
//        for (let serverID in servers) {
//            let server = servers[serverID];
//            response += '\n' + server.id + ' - ' + server.name;
//        }
//        bot.sendMessage({ to: channelID, message: response });
//    } else if (message === '!shutdown') {
//        bot.sendMessage({ to: channelID, message: 'Shutting down ' + config.getValue(config.KEYS.TITLE) });
//        bot.disconnect();
//    }
//});
//
//let interval = setInterval(function() {
//    if (bot.connected) {
//        debug(' - Update');
//        bot.setPresence({ game: {
//            name: 'since ' + startupDate.fromNow(true)
//        } })
//    } else {
//        debug(' - Clear interval');
//        clearInterval(interval);
//    }
//}, 15000);
