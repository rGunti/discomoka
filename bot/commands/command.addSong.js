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

const debug = require('debug')('discomoka:Command.AddSong');
const utils = require('./utils');
const perm = require('./permissions');
const ytdl = require('youtube-dl');
const config = require('../../base/config');
const fs = require('fs');
const path = require('path');
const fx = require('mkdir-recursive');
const db = require('../../db');
const MusicPlayer = require('../musicPlayer');
const streams = require('../musicPlayer/streamCollection');

const resourcePath = config.getValue(config.KEYS.RESOURCE_PATH);
const allowedExtractors = config.getValue(config.KEYS.ALLOWED_EXTRACTORS);

const AddSongCommand = {
    CommandName: 'addsong',
    Alias: ['as'],
    PermissionRequired: perm.PermissionLevel.User,
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
            if (err || (allowedExtractors && !allowedExtractors.includes(info.extractor))) {
                utils.sendError(params.BotClient, responseTarget,
                    'Sorry, ' + utils.getMention(params.IssuedBy) +
                    ' but something went wrong while I was looking up what you sent me.\n' +
                    'Here is a little more detail about this:\n' +
                    '```\n' + err + '\n```'
                );
            } else {
                let destinationDir = path.join(fs.realpathSync(resourcePath), info.extractor.replace(/:/g, '_'));
                let destinationPath = path.join(destinationDir, info.id);
                let destinationPathWExt = destinationPath + '.mp3';
                if (AddSongCommand.fileExists(destinationPathWExt)) {
                    debug('I already have this video in stock');
                    let existingSongs = db.Songs.getBySource(info.extractor, info.id);
                    if (existingSongs && existingSongs.length > 0) {
                        utils.sendSuccess(
                            params.BotClient,
                            responseTarget,
                            'Hey ' + utils.getMention(params.IssuedBy) +
                            ', I\'m done downloading your video: ' +
                            sourceLink
                        );
                        let newSong = {
                            server_id: params.IssuedOn.Server.id,
                            user_id: params.IssuedBy.id,
                            title: existingSongs[0].title,
                            artist: existingSongs[0].artist,
                            source_type: existingSongs[0].source_type,
                            source: existingSongs[0].source,
                            source_link: existingSongs[0].source_link
                        };
                        db.Songs.insert(newSong);
                        return;
                    } else {
                        debug('Oups! There is a glitch in the matrix. We are downloading it again, ' +
                            'just for good measure.');
                    }
                }

                debug('I don\'t know this video yet, let\'s get it ...');
                if (!AddSongCommand.fileExists(destinationDir)) {
                    debug('Never downloaded something from %s, creating directory for that ...', info.extractor);
                    fx.mkdirSync(destinationDir, 777);
                }

                utils.sendInfo(
                    params.BotClient,
                    responseTarget,
                    'Alright, I am downloading this for you, ' + utils.getMention(params.IssuedBy) +
                    '. I\'ll come back to you when I\'m done.'
                );
                ytdl.exec(sourceLink,
                    ['-x', '--audio-format', 'mp3', '-o', destinationPath + '.dl'],
                    { cwd: destinationDir },
                    (err, output) => {
                        if (err) {
                            debug('Video Download failed!', err);
                            utils.sendError(
                                params.BotClient,
                                responseTarget,
                                'Sorry ' + utils.getMention(params.IssuedBy) +
                                ', but your download failed D:\n' +
                                'Here is some info for the Tech guy:\n```' +
                                err + '\n' + output +
                                '\n```'
                            );
                        } else {
                            utils.sendSuccess(
                                params.BotClient,
                                responseTarget,
                                'Hey ' + utils.getMention(params.IssuedBy) +
                                ', I\'m done downloading your video: ' +
                                sourceLink
                            );
                            let videoObject = {
                                server_id: params.IssuedOn.Server.id,
                                user_id: params.IssuedBy.id,
                                title: info.title,
                                artist: info.uploader,
                                source_type: info.extractor,
                                source: info.id,
                                source_link: info.webpage_url
                            };
                            db.Songs.insert(videoObject);
                        }
                    }
                );
            }
        });
    },
    fileExists: (path) => {
        try {
            debug('Checking path %s ...', path);
            fs.accessSync(path, fs.constants.F_OK);
            return true;
        } catch (err) {
            return false;
        }
    }
};

module.exports = AddSongCommand;
