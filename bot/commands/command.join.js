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

const debug = require('debug')('discomoka:Command.JoinVoiceChannel');
const utils = require('./utils');
const perm = require('./permissions');
const streams = require('../musicPlayer/streamCollection');

const JoinVoiceChannelCommand = {
    CommandName: 'join',
    Alias: ['j'],
    PermissionRequired: perm.PermissionLevel.Admin,
    execute: (params) => {
        let bot = params.BotClient;
        let issuerID = params.IssuedBy.id;
        let channels = params.IssuedOn.Server.channels;
        for (let channelID in channels) {
            let channel = channels[channelID];
            if (channel.type === 'voice') {
                debug('C=%s: Voice channel, checking ...', channelID);
                if (issuerID in channel.members) {
                    debug('C=%s: Found you, joining ...', channelID);
                    bot.joinVoiceChannel(channelID, (error, response) => {
                        if (error) {
                            utils.sendError(bot, params.IssuedOn.Channel,
                                'Something went wrong here D:\n```\n' +
                                error + '\n```');
                        } else {
                            utils.sendInfo(bot, params.IssuedOn.Channel,
                                'I\'m now sitting in :speaker: ' + channel.name);
                            bot.getAudioContext(channelID, (error, stream) => {
                                if (error) {
                                    utils.sendError(bot, params.IssuedOn.Channel,
                                        'Something went wrong here D:\n```\n' +
                                        error + '\n```'
                                    );
                                    bot.leaveVoiceChannel(channelID);
                                } else {
                                    streams.addStream(params.IssuedOn.Server.id, stream);
                                }
                            });
                        }
                    });
                    return;
                } else {
                    debug('C=%s: Could not find issuer, skipping ...', channelID);
                }
            } else {
                debug('C=%s: Not a voice channel, skipping ...', channelID);
            }
        }

        utils.sendError(bot, params.IssuedOn.Channel,
            'Sorry, ' + utils.getMentionById(issuerID) +
            ', but I can\'t find you. Are you sitting in a Voice Channel?');
    }
};

module.exports = JoinVoiceChannelCommand;
