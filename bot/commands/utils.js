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

const debug = require('debug')('discomoka:CommandUtils');

const CommandUtils = {
    getMention: (user) => CommandUtils.getMentionById(user.id),
    getMentionById: (id) => '<@' + id + '>',
    getStateEmoji: (state) => {
        if (!state) { return ''; }
        switch (state.toLowerCase()) {
            case 'success': return ':white_check_mark:';
            case 'info': return ':information_source:';
            case 'warn': return ':warning:';
            case 'error': return ':no_entry:';
            case 'permError': return ':no_entry_sign:';
            default: return '';
        }
    },
    sendMessage: (client, target, message, callback) => {
        debug('Sending message to %s: %s', target.id, message);
        client.sendMessage({ to: target.id, message: message }, callback);
    },
    sendError: (client, target, message, callback) => {
        CommandUtils.sendMessage(client, target, CommandUtils.getStateEmoji('error') + ' **Error**: ' + message, callback)
    },
    sendSuccess: (client, target, message, callback) => {
        CommandUtils.sendMessage(client, target, CommandUtils.getStateEmoji('success') + ' ' + message, callback)
    },
    sendInfo: (client, target, message, callback) => {
        CommandUtils.sendMessage(client, target, CommandUtils.getStateEmoji('info') + ' ' + message, callback)
    },
    sendWarning: (client, target, message, callback) => {
        CommandUtils.sendMessage(client, target, CommandUtils.getStateEmoji('warn') + ' ' + message, callback)
    },
    sendPermissionError: (client, target, user, permissionLevel, callback) => {
        CommandUtils.sendMessage(
            client,
            target,
            CommandUtils.getStateEmoji('permError') +
                ' Sorry, ' + CommandUtils.getMention(user) +
                ' but you cannot use this command because you don\'t have ' +
                'permission to do so.' +
                (permissionLevel ? '\nYour required permission level is `' + permissionLevel + '`.' : ''),
            callback
        )
    },
    sendAutoDismissMessage: (client, target, state, message, autoDismissAfter) => {
        CommandUtils.sendMessage(client, target, (CommandUtils.getStateEmoji(state) + ' ' + message).trim(),
            (error, response) => {
                setTimeout((client, channelID, messageID) => {
                    client.deleteMessage({ channelID: channelID, messageID: messageID });
                }, autoDismissAfter * 1000, client, target.id, response.id);
            }
        );
    },
    deleteMessage: (client, channelID, messageID) => {
        debug('Deleting Message %s from Channel %s ...', messageID, channelID);
        client.deleteMessage({ channelID: channelID, messageIDs: messageID }, (error) => {
            if (error) {
                debug('Failed to delete Message %s from Channel %s!', messageID, channelID, error);
            }
        });
    },
    deleteMessages: (client, channelID, messageIDs) => {
        debug('Deleting %s message(s) from Channel %s ...', messageIDs.length, channelID);
        client.deleteMessages({ channelID: channelID, messageIDs: messageIDs }, (error) => {
            if (error) {
                debug('Failed to delete %s message(s) from Channel %s!', messageIDs.length, channelID, error);
            }
        });
    }
};

module.exports = CommandUtils;
