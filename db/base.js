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

const debug = require('debug')('discomoka:DB/base');
const config = require('../base/config');
const async = require('async');
const { Pool } = require('pg');
const pool = new Pool({
    host: config.getValue(config.KEYS.DB_HOST),
    port: config.getValue(config.KEYS.DB_PORT),
    user: config.getValue(config.KEYS.DB_USER),
    password: config.getValue(config.KEYS.DB_PASSWORD),
    database: config.getValue(config.KEYS.DB_DATABASE)
});

const DbComponent = {
    getEntities: async (table) => {
        return await this.queryAsync('SELECT * FROM ' + table)
    },
    getEntitiesWhere: async (table, restrictions) => {
        let sql = "SELECT * FROM " + table + " WHERE ";
        let restrictionParts = [];
        let params = [];
        let i = 0;
        for (let column in restrictions) {
            i++;
            let restrParam = restrictions[column];
            restrictionParts.push(column + " = $" + i);
            params.push(restrParam);
        }
        sql += restrictionParts.join(' AND ');
        return await DbComponent.queryAsync(sql, params);
    },
    insert: async (table, obj) => {
        let columns = Object.keys(obj);
        let params = [];
        for (let paramName in obj) {
            params.push(obj[paramName]);
        }

        let paramL = [];
        for (let i = 1; i <= params.length; i++) { paramL.push(i); }

        let sql = "INSERT INTO " + table + " (" + columns.join(', ') + ") VALUES($" + paramL.join(', $') + ")";
        return await DbComponent.queryAsync(sql, params);
    },
    update: async (table, pkName, pkVal, obj) => {
        let sql = "UPDATE " + table + " SET ";

        let params = [];
        let sqlParts = [];
        let i = 0;
        for (let column in obj) {
            i++;
            sqlParts.push(column + " = $" + i + " ");
            params.push(obj[column]);
        }

        sql += sqlParts.join(', ') + " WHERE " + pkName + " = $" + (i + 1);
        params.push(pkVal);
        return await DbComponent.queryAsync(sql, params);
    },
    updateMultiKey: async (table, pkNameAndVals, obj) => {
        let sql = "UPDATE " + table + " SET ";

        let params = [];
        let sqlParts = [];
        let i = 0;
        for (let column in obj) {
            i++;
            sqlParts.push(column + " = $" + i + " ");
            params.push(obj[column]);
        }
        sql += sqlParts.join(', ') + " WHERE ";

        sqlParts = [];
        for (let pkName in pkNameAndVals) {
            i++;
            sqlParts.push(pkName + " = $" + i);
            params.push(pkNameAndVals[pkName]);
        }
        sql += sqlParts.join(' AND ');

        return await DbComponent.queryAsync(sql, params);
    },
    delete: async (table, pkName, pkVal) => {
        let sql = "DELETE FROM " + table + " WHERE " + pkName + " = $1";
        return await DbComponent.queryAsync(sql, [pkVal]);
    },
    deleteMultiKey: async (table, pkNameAndVals) => {
        let sql = "DELETE FROM " + table + " WHERE ";
        let params = [];
        let i = 0;
        for (let pkName in pkNameAndVals) {
            sql += pkName + " = $" + i;
            params.push(pkNameAndVals[pkName]);
            i++;
        }
        return await DbComponent.queryAsync(sql, params);
    },
    query: (sql, params, callback) => {
        debug('Executing SQL: %s', sql);
        return pool.query(sql, params, callback);
    },
    queryAsync: async function (sql, params) {
        debug('Executing SQL: %s', sql);
        return await pool.query(sql, params)
    }
};

module.exports = DbComponent;

