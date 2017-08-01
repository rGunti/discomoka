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

const debug = require('debug')('discomoka:Command.LeaveServer');
const utils = require('./utils');
const perm = require('./permissions');

const LeaveServerCommand = {
    CommandName: 'leave',
    Alias: ['byebye'],
    PermissionRequired: perm.PermissionLevel.Owner,
    execute: (params) => {
        utils.sendMessage(params.BotClient, params.IssuedOn.Channel,
            'I\'ll be leaving you as ordered by ' + utils.getMention(params.IssuedBy) +
            '. Thank you for using ' + utils.getMentionById(params.BotClient.id) + '. ^_^',
            () => {
            debug('Leaving server %s ...', params.IssuedOn.Server.id);
            params.BotClient.leaveServer(params.IssuedOn.Server.id, function (err, response) {
                if (err) {
                    debug('Error while leaving server: %O', err);
                } else {
                    debug('Left server %s', params.IssuedOn.Server.id);
                }
            });
        });
    }
};

module.exports = LeaveServerCommand;
