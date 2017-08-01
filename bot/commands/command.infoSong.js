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

const debug = require('debug')('discomoka:Command.InfoSong');
const utils = require('./utils');
const perm = require('./permissions');
const ytdl = require('youtube-dl');
const config = require('../../base/config');

const allowedExtractors = config.getValue(config.KEYS.ALLOWED_EXTRACTORS);

const InfoSongCommand = {
    CommandName: 'infosong',
    Alias: ['is'],
    PermissionRequired: perm.PermissionLevel.User,
    SupportsPrivateChat: true,
    execute: (params) => {
        let command = params.MessageText;
        let sourceLink = command.substring(command.indexOf(' ')).trim();
        let responseTarget = params.IssuedOn.IsPrivateChannel ? params.IssuedBy : params.IssuedOn.Channel;

        if (!sourceLink) {
            utils.sendError(params.BotClient, responseTarget,
                'No Link provided. Please tell me where to get your sick beats.'
            );
            return;
        }

        ytdl.getInfo(sourceLink, [], null, function(err, info) {
            if (err) {
                utils.sendError(params.BotClient, responseTarget,
                    'Sorry but something went wrong while I was looking up what you sent me.\n' +
                    'Here is a little more detail about this:\n' +
                    '```\n' + err + '\n```'
                );
            } else {
                let output = 'Alright, here is some information about your video I was able to look up:';
                output += '\n **ID**: ' + info.id;
                output += '\n **Title**: ' + info.title;
                output += '\n **Uploader**: ' + info.uploader;
                //output += '\n **URL**: ' + info.url;
                output += '\n **Thumbnail**: ' + info.thumbnail;
                //output += '\n **Filename**: ' + info._filename;
                //output += '\n **Format ID**: ' + info.format_id;
                output += '\n **Extractor**: ' + info.extractor;
                output += '\n **Format**: ' + info.format;

                //debug(info);
                utils.sendInfo(params.BotClient, responseTarget, output);
            }
        });
    }
};

module.exports = InfoSongCommand;
