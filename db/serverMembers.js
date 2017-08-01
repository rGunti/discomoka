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

const debug = require('debug')('discomoka:DB/ServerMembers');
const db = require('./base');

const ServerMembers = {
    tableName: "server_members",
    pkName: "server_id, user_id",
    getAll: async () => {
        let result = await db.getEntities(ServerMembers.tableName);
        return result.rows;
    },
    getById: async (server_id, user_id) => {
        let result = await db.getEntitiesWhere(ServerMembers.tableName, {'server_id': server_id, 'user_id': user_id});
        if (result.rowCount === 1) {
            return result.rows[0];
        } else {
            debug('Could not find ServerMember with ID %s / %s', server_id, user_id);
            return null;
        }
    },
    insert: async (o) => {
        debug('Creating ServerMember %s <=> %s', o.server_id, o.user_id);
        return await db.insert(ServerMembers.tableName, o);
    },
    update: async (o) => {
        debug('Updating ServerMember %s <=> %s', o.server_id, o.user_id);
        return await db.updateMultiKey(ServerMembers.tableName, { server_id: o.server_id, user_id: o.user_id }, o);
    },
    delete: async (o) => {
        debug('Deleting ServerMember %s <=> %s', o.server_id, o.user_id);
        return await db.deleteMultiKey(ServerMembers.tableName, { server_id: o.server_id, user_id: o.user_id });
    }
};

module.exports = ServerMembers;
