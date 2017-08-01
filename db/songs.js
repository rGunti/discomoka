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

const debug = require('debug')('discomoka:DB/Songs');
const db = require('./base');

const Songs = {
    tableName: "songs",
    pkName: "id",
    getAll: async () => {
        let result = await db.getEntities(Songs.tableName);
        return result.rows;
    },
    getAllByServer: async (server_id) => {
        let result = await db.getEntitiesWhere(Songs.tableName, { server_id: server_id });
        return result.rows;
    },
    getById: async (id) => {
        let result = await db.getEntitiesWhere(Songs.tableName, {'id': id});
        if (result.rowCount === 1) {
            return result.rows[0];
        } else {
            debug('Could not find Song with ID %s', id);
            return null;
        }
    },
    getByServerAndId: async (server_id, id) => {
        let result = await db.getEntitiesWhere(Songs.tableName, { 'server_id': server_id, 'id': id });
        if (result.rowCount === 1) {
            return result.rows[0];
        } else {
            debug('Could not find Song with ID Server=%s/%s', server_id, id);
            return null;
        }
    },
    getBySource: async (source_type, source) => {
        let result = await db.getEntitiesWhere(Songs.tableName, {
            source_type: source_type,
            source: source
        });
        if (result.rowCount === 0) {
            return null;
        } else {
            return result.rows;
        }
    },
    insert: async (o) => {
        debug('Creating Song [%s] %s - %s', o.server_id, o.title, o.artist);
        return await db.insert(Songs.tableName, o);
    },
    update: async (o) => {
        debug('Updating Song %s', o.id);
        return await db.update(Songs.tableName, Songs.pkName, o.id, o);
    },
    delete: async (o) => {
        debug('Deleting Song %s', o.id);
        return await db.delete(Songs.tableName, Songs.pkName, o.id);
    }
};

module.exports = Songs;
