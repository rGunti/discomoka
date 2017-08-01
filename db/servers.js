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

const debug = require('debug')('discomoka:DB/Servers');
const db = require('./base');

const Servers = {
    tableName: "servers",
    pkName: "id",
    getAll: async () => {
        let result = await db.getEntities(Servers.tableName);
        return result.rows;
    },
    getById: async (id) => {
        let result = await db.getEntitiesWhere(Servers.tableName, { 'id': id });
        if (result.rowCount === 1) {
            return result.rows[0];
        } else {
            debug('Could not find Server with ID %s', id);
            return null;
        }
    },
    insert: async (server) => {
        debug('Creating Server [%s] %s', server.id, server.name);
        return await db.insert(Servers.tableName, server);
    },
    update: async (server) => {
        debug('Updating Server [%s] %s', server.id, server.name);
        return await db.update(Servers.tableName, Servers.pkName, server.id, server);
    },
    delete: async (server) => {
        debug('Deleting Server [%s] %s', server.id || server, server.name || '');
        return await db.delete(Servers.tableName, Servers.pkName, server.id || server);
    }
};

module.exports = Servers;
