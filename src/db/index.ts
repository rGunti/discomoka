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

import {debug} from 'debug';
import {Sequelize} from "sequelize-typescript";
import {DbConfig, DiscomokaConfig} from "../config/DiscomokaConfig";
import {ConfigReader} from "../config/ConfigReader";
import {Song} from "./models/Song";

const debugPrinter: debug = debug('discomoka-ts:DB');

export class DbInstance {
    public static seqInstance: Sequelize;

    public static init():void {
        debugPrinter('Initializing DB Connection ...');

        const config: DiscomokaConfig = ConfigReader.getConfig();
        const dbConfig: DbConfig = config.db;

        debugPrinter(`Connecting to ${dbConfig.host}:${dbConfig.port}/${dbConfig.database} ...`);
        let seq: Sequelize = new Sequelize({
            dialect: 'postgres',
            host: dbConfig.host,
            port: dbConfig.port,
            username: dbConfig.user,
            password: dbConfig.password,
            name: dbConfig.database
        });
        seq.addModels([Song]);
        DbInstance.seqInstance = seq;
    }
}