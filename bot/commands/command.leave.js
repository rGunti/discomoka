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

const debug = require('debug')('discomoka:Command.LeaveVoiceChannel');
const utils = require('./utils');
const perm = require('./permissions');
const streams = require('../musicPlayer/streamCollection');
const MusicPlayer = require('../musicPlayer');

const LeaveVoiceChannelCommand = {
    CommandName: 'leave',
    Alias: ['l'],
    PermissionRequired: perm.PermissionLevel.Admin,
    execute: (params) => {
        let bot = params.BotClient;
        let channels = params.IssuedOn.Server.channels;
        for (let channelID in channels) {
            let channel = channels[channelID];
            if (channel.type === 'voice') {
                debug('C=%s: Voice channel, checking ...', channelID);
                if (bot.id in channel.members) {
                    debug('C=%s: Found ME, leaving ...', channelID);
                    let serverID = params.IssuedOn.Server.id;
                    let player = MusicPlayer.getPlayerForServer(serverID);
                    player.close();
                    MusicPlayer.removePlayerForServer(serverID);
                    bot.leaveVoiceChannel(channelID, () => {
                        utils.sendInfo(bot, params.IssuedOn.Channel, 'Bye :speaker: ' + channel.name);
                        streams.removeStream(serverID);
                    });
                    return;
                } else {
                    debug('C=%s: Could not find issuer, skipping ...', channelID);
                }
            } else {
                debug('C=%s: Not a voice channel, skipping ...', channelID);
            }
        }
    }
};

module.exports = LeaveVoiceChannelCommand;
