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

const debug = require('debug')('discomoka:Bot.Command/Permissions');
const OWNER_ROLE = '$$OWNER$$';

const PermissionUtils = {
    PermissionLevel: {
        None: 0,
        User: 1,
        Admin: 8,
        Owner: 9
    },
    PermissionLevelRoleNames: {
        0: [],
        1: ['Discomoka User'],
        8: ['Discomoka Admin'],
        9: [OWNER_ROLE]
    },
    getCurrentPermissionLevel: (server, user) => {
        // If the user is the server's owner, we don't need to check further
        if (server.owner_id === user.id) { return PermissionUtils.PermissionLevel.Owner }

        // Check the users roles
        let serverRoles = server.roles;
        let userRoles = server.members[user.id].roles;
        // Get all role names
        let userRoleNames = [];
        for (let i = 0; i < userRoles.length; i++) {
            let role = serverRoles[userRoles[i]];
            if (role) userRoleNames.push(role.name);
        }

        let permLevelFound = PermissionUtils.PermissionLevel.None;
        for (let permLevelName in PermissionUtils.PermissionLevel) {
            let permLevel = PermissionUtils.PermissionLevel[permLevelName];
            let roleNames = PermissionUtils.PermissionLevelRoleNames[permLevel];

            for (let i = 0; i < roleNames.length; i++) {
                let roleName = roleNames[i];
                if (roleName === OWNER_ROLE && server.owner_id === user.id) {
                    return PermissionUtils.PermissionLevel.Owner;
                } else if (userRoleNames.includes(roleName)) {
                    permLevelFound = (permLevel > permLevelFound) ? permLevel : permLevelFound;
                }
            }
        }

        return permLevelFound;
    },
    hasPermission: (currentPermission, requiredPermission) => (currentPermission >= requiredPermission)
};

module.exports = PermissionUtils;
