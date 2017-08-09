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

const debugPrinter: debug = debug('discomoka:ILogger');

export enum LogLevel {
    Debug = 1,
    Info = 2,
    Warning = 3,
    Error = 4,
    Fatal = 5
}

export interface Logger {
    logLevel:LogLevel;

    log(level:LogLevel, message:string):void;
    debug(message:string):void;
    info(message:string):void;
    warn(message:string):void;
    error(message:string):void;
    fatal(message:string):void;
}

export abstract class BaseLogger implements Logger {

    public logLevel:LogLevel;

    constructor(minLogLevel:LogLevel) {
        this.logLevel = minLogLevel;
    }

    protected abstract processLogEntry(level: LogLevel, message: string):void;

    public log(level: LogLevel, message: string):void {
        if (this.logLevel <= level) {
            this.processLogEntry(level, message);
        }
    }

    public debug(message: string): void {
        this.log(LogLevel.Debug, message);
    }

    public info(message: string): void {
        this.log(LogLevel.Info, message);
    }

    public warn(message: string): void {
        this.log(LogLevel.Warning, message);
    }

    public error(message: string): void {
        this.log(LogLevel.Error, message);
    }

    public fatal(message: string): void {
        this.log(LogLevel.Fatal, message);
    }
}
