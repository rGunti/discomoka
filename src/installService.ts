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
import {ConfigReader} from "./config/ConfigReader";
import {DiscomokaConfig} from "./config/DiscomokaConfig";
import {HeaderPrinter} from "./config/HeaderPrinter";
import {Service} from 'node-windows';
import {EventViewerLogger} from "./utils/log/EventViewerLogger"
import {LogLevel} from "./utils/log/Logger";

const debugPrinter: debug = debug('discomoka-ts:Windows Service Installer');
const log:EventViewerLogger = new EventViewerLogger(LogLevel.Debug, 'SvcInstaller');

ConfigReader.readDefaultConfig<DiscomokaConfig>();
const config:DiscomokaConfig = ConfigReader.getConfig();
HeaderPrinter.print(ConfigReader.getPackageConfig(), config);

debugPrinter(`Service Installer for ${config.title} [${config.flag}] is starting up...`);
log.info(`SvcInstaller is starting up; App ${config.title}, Flag ${config.flag}`);

let serviceTitle:string = `${config.title} (${config.flag})`;

let service:Service = new Service({
    name: serviceTitle,
    description: `Node.JS Service running ${serviceTitle}`,
    script: __dirname + '/main.js',
    env: [{
        name: 'CONFIG_PATH',
        value: process.env.CONFIG_PATH || ConfigReader.DEFAULT_FILE
    }, {
        name: 'DEBUG',
        value: process.env.DEBUG || 'discomoka-ts:*'
    }],
    wait: 5,       // 5 sec
    grow: 0.1,     // 10%
    maxRetries: 15
});

service.on('install', () => {
    debugPrinter(`Service ${serviceTitle} installed, starting ...`);
    log.info(`Service ${serviceTitle} installed, requested Service start`);
    service.start();
});

service.on('uninstall', () => {
    debugPrinter(`Service uninstall of ${serviceTitle} completed.`);
    debugPrinter(`Service existence: ${service.exists}`);

    log.info(`Service ${serviceTitle} uninstalled, existence: ${service.exists}`);
});

if (process.env.UNINSTALL && process.env.UNINSTALL === '1') {
    service.uninstall();
} else {
    service.install();
}
