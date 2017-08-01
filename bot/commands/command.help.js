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

const debug = require('debug')('discomoka:Command.Help');
const config = require('../../base/config');
const utils = require('./utils');
const perm = require('./permissions');
const fs = require('fs');

const HelpCommand = {
    _HelpFileContent: [
        fs.readFileSync(__dirname + '/command.help.header.txt').toString(),
        fs.readFileSync(__dirname + '/command.help.txt').toString()
            .replace(/\(pfx\)/g, config.getValue(config.KEYS.COMMAND_PREFIX))
    ],
    _AdminHelpFileContent: [
        fs.readFileSync(__dirname + '/command.help.admin.intro.txt').toString(),
        fs.readFileSync(__dirname + '/command.help.admin.txt').toString()
            .replace(/\(pfx\)/g, config.getValue(config.KEYS.COMMAND_PREFIX))
    ],

    CommandName: 'help',
    Alias: ['halp', '?', 'derp', '101'],
    PermissionRequired: perm.PermissionLevel.User,
    sendNextMessage: (params, arr, i) => {
        utils.sendMessage(params.BotClient, params.IssuedBy, arr[i], (error, response) => {
            i++;
            if (i < arr.length) {
                setTimeout(HelpCommand.sendNextMessage, 100, params, arr, i);
            }
        });
    },
    execute: (params) => {
        let messages = [];
        messages = messages.concat(HelpCommand._HelpFileContent);
        if (perm.hasPermission(
                perm.getCurrentPermissionLevel(params.IssuedOn.Server, params.IssuedBy),
                perm.PermissionLevel.Admin
            )) {
            messages = messages.concat(HelpCommand._AdminHelpFileContent);
        }

        HelpCommand.sendNextMessage(params, messages, 0);
    }
};

module.exports = HelpCommand;
