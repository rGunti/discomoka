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

const debug = require('debug')('discomoka:Bot.Commands');
const config = require('../../base/config');
const fs = require('fs');
const perm = require('./permissions');
const utils = require('./utils');

const commandPrefix = config.getValue(config.KEYS.COMMAND_PREFIX);
const commandFileNamePrefix = "command.";

let CommandRegister = {
    CommandPrefix: commandPrefix,
    Commands: {},
    registerCommand: (name, command) => {
        debug('Registering Command %s%s ...', commandPrefix, name);
        CommandRegister.Commands[commandPrefix + name] = command;
    },
    registerAlias: (name, originalName) => {
        debug('Registering Alias %s%s => %s%s ...', commandPrefix, name, commandPrefix, originalName);
        CommandRegister.Commands[commandPrefix + name] = CommandRegister.Commands[commandPrefix + originalName];
    },
    hasCommand: (name) => { return name in CommandRegister.Commands; },
    executeCommand: (commandName, params) => {
        let command = CommandRegister.Commands[commandName];
        if (!command.SupportsPrivateChat && params.IssuedOn.IsPrivateChannel) {
            // Unsupported Command request from private chat
            debug(
                '%s tried to execute %s in private chat but the command does not support this mode.',
                params.IssuedBy.id, commandName
            );
            return;
        }

        if (!params.IssuedOn.IsPrivateChannel && command.PermissionRequired !== undefined) {
            // Command request from Server requires permission check
            let currentPermission = perm.getCurrentPermissionLevel(params.IssuedOn.Server, params.IssuedBy);
            if (!perm.hasPermission(currentPermission, command.PermissionRequired)) {
                debug('Failed to comply to Permission Requirements; %s required, %s given',
                    command.PermissionRequired,
                    currentPermission
                );
                utils.sendPermissionError(
                    params.BotClient,
                    params.IssuedOn.Channel,
                    params.IssuedBy,
                    command.PermissionRequired
                );
                return;
            }
        }

        // Everything is OK, execute command
        CommandRegister.Commands[commandName].execute(params);
    }
};

// Get all command.* files to include commands
fs.readdirSync(__dirname).forEach(file => {
    if (file.startsWith(commandFileNamePrefix) && file.endsWith('.js')) {
        let commandImpl = require('./' + file);
        CommandRegister.registerCommand(commandImpl.CommandName, commandImpl);
        if (commandImpl.Alias) {
            for (let i in commandImpl.Alias) {
                let alias = commandImpl.Alias[i];
                CommandRegister.registerAlias(alias, commandImpl.CommandName);
            }
        }
    }
});

module.exports = CommandRegister;
