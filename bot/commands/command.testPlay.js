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

const debug = require('debug')('discomoka:Command.TestPlay');
const utils = require('./utils');
const perm = require('./permissions');
const fs = require('fs');

const TestPlayCommand = {
    CommandName: 'testplay',
    PermissionRequired: perm.PermissionLevel.Admin,
    execute: (params) => {
        let bot = params.BotClient;
        let voiceChannelID = params.MessageText.split(' ')[1];
        bot.joinVoiceChannel(voiceChannelID, function (error, response) {
            if (error) {
                utils.sendError(bot, params.IssuedOn.Channel, 'Error while joining Voice Channel: ' + error);
                return debug(error);
            }
            bot.getAudioContext(voiceChannelID, function (error, stream) {
                if (error) {
                    utils.sendError(bot, params.IssuedOn.Channel, 'Error while getting Audio Context: ' + error);
                    return debug(error);
                }
                let filepath = './test/wolf.mp3';
                fs.createReadStream(filepath).pipe(stream, {end: false});
                utils.sendInfo(bot, params.IssuedOn.Channel, 'Transmitting Test Audio...');
                stream.on('done', function () {
                    utils.sendSuccess(bot, params.IssuedOn.Channel, 'Finished playing Test Audio');
                    debug('Stream has ended!');
                });
            });
        });
    }
};

module.exports = TestPlayCommand;
