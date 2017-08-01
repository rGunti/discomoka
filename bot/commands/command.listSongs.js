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

const debug = require('debug')('discomoka:Command.ListSongs');
const utils = require('./utils');
const perm = require('./permissions');
const db = require('../../db');

const PAGE_SIZE = 20;

const ListSongsCommand = {
    CommandName: 'listsongs',
    Alias: ['ls'],
    PermissionRequired: perm.PermissionLevel.User,
    execute: async (params) => {
        let bot = params.BotClient;
        let server = params.IssuedOn.Server;

        let serverSongs = await db.Songs.getAllByServer(server.id);
        let outputMessages = [];

        let outputMessage = `__**Songs on ${server.name}**__ ${serverSongs.length} song(s)\n`;
        for (let i in serverSongs) {
            let song = serverSongs[i];
            if (i % PAGE_SIZE === 0) {
                outputMessages.push(outputMessage);
                outputMessage = "";
            }
            outputMessage += `\`${song.id}\` ${song.title} - ${song.artist}\n`;
        }

        if (outputMessage) {
            outputMessages.push(outputMessage);
        }

        ListSongsCommand.sendMessageArray(bot, params.IssuedOn.Channel, outputMessages, 0);
    },
    sendMessageArray: (client, target, arr, i) => {
        if (i >= arr.length) { return; }
        utils.sendMessage(client, target, arr[i], (err, resp) => {
            if (!err) {
                setTimeout(() => {
                    ListSongsCommand.sendMessageArray(client, target, arr, i + 1);
                }, 100);
            }
        });
    }
};

module.exports = ListSongsCommand;
