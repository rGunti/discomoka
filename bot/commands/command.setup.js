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

const debug = require('debug')('discomoka:Command.SetupRoles');
const utils = require('./utils');
const perm = require('./permissions');

const DefaultRoles = {
    'Discomoka Admin': { color: 0xF46036 },
    'Discomoka User': { color: 0x5B85AA },
};

const SetupRolesCommand = {
    CommandName: 'setup',
    PermissionRequired: perm.PermissionLevel.Owner,
    execute: (params) => {
        let client = params.BotClient;
        let server = params.IssuedOn.Server;
        let roles = server.roles;

        // TODO: Since we are having permission levels in place, we might not need this anymore.
        if (server.owner_id !== params.IssuedBy.id) {
            // We simply do nothing so other the command does not get executed by accident
            //utils.sendError(
            //    client,
            //    params.IssuedOn.Channel,
            //    'Sorry ' + utils.getMention(params.IssuedBy) +
            //    ' but you are not the owner of this server! Only the owner of the server can set me up.'
            //);
            return;
        }

        for (let roleName in DefaultRoles) {
            let role = DefaultRoles[roleName];
            SetupRolesCommand.createRoleIfNotExists(client, roles, server.id, roleName, role.color);
        }

        utils.sendSuccess(
            client, params.IssuedOn.Channel,
            'I\'ve setup the roles. Have a look at the role screen.'
        );
    },
    createRoleIfNotExists: (client, roles, serverID, roleName, roleColor) => {
        if (!SetupRolesCommand.getRoleWithName(roles, roleName)) {
            SetupRolesCommand.createRole(client, serverID, roleName, roleColor);
        }
    },
    getRoleWithName: (roles, roleName) => {
        for (let roleID in roles) {
            let role = roles[roleID];
            if (role.name === roleName) {
                return role;
            }
        }
        return null;
    },
    createRole: (client, serverID, roleName, roleColor) => {
        debug('Creating Role %s on %s', roleName, serverID);
        client.createRole(serverID, (error, response) => {
            if (error) {
                debug('Error while creating a role:', error)
            } else {
                client.editRole({
                    serverID: serverID,
                    roleID: response.id,
                    name: roleName,
                    color: roleColor | 0,
                    mentionable: false,
                    hoist: false
                }, (error, response) => {
                    if (error) {
                        debug('Error while editing a role:', error)
                    } else {
                        debug('Role %s successfully created on %s', roleName, serverID)
                    }
                });
            }
        });
    }
};

module.exports = SetupRolesCommand;
