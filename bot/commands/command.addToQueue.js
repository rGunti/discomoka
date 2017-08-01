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

const debug = require('debug')('discomoka:Command.AddToQueue');
const utils = require('./utils');
const perm = require('./permissions');
const MusicPlayer = require('../musicPlayer');
const streams = require('../musicPlayer/streamCollection');

const AddToQueueCommand = {
    CommandName: 'queueadd',
    Alias: ['qa'],
    PermissionRequired: perm.PermissionLevel.User,
    execute: async (params) => {
        let bot = params.BotClient;
        let serverID = params.IssuedOn.Server.id;

        let message = params.MessageText;
        let songID = Number(message.substr(message.indexOf(' ')));
        if (Number.isNaN(songID)) {
            utils.sendError(bot, params.IssuedOn.Channel,
                'I don\'t know this song.');
            return;
        }

        let stream = streams.getStream(serverID);
        if (!stream) {
            utils.sendError(bot, params.IssuedOn.Channel,
                'Erm... I\'m not in a channel to play your sick beats. Sowwy!');
            return;
        }

        let musicPlayer = MusicPlayer.getPlayerForServer(serverID);
        if (!musicPlayer) {
            musicPlayer = MusicPlayer.createPlayerForServer(serverID);
        }
        await musicPlayer.addSongToQueue(songID);
    }
};

module.exports = AddToQueueCommand;
