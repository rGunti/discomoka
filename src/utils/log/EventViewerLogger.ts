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
import { EventLogger } from 'node-windows';
import {BaseLogger, Logger, LogLevel} from "./Logger";

const debugPrinter: debug = debug('discomoka:EventViewerLogger');

export enum EventCode {
    Default = 1000,
    DebugOutput = 1001,
    FatalOutput = 1002
}

export class EventViewerLogger extends BaseLogger implements Logger {

    private static BASE_SOURCE = "Discomoka";

    private eventLogger:EventLogger;
    private source:string;

    constructor(minLogLevel:LogLevel, source:string) {
        super(minLogLevel);
        this.source = source;
        this.eventLogger = new EventLogger(`${EventViewerLogger.BASE_SOURCE}/${source}`);
    }

    protected processLogEntry(level: LogLevel, message: string): void {
        switch (level) {
            case LogLevel.Debug:
                this.eventLogger.info(`DEBUG: ${message}`, EventCode.DebugOutput);
                break;
            case LogLevel.Info:
                this.eventLogger.info(message);
                break;
            case LogLevel.Warning:
                this.eventLogger.warn(message);
                break;
            case LogLevel.Error:
                this.eventLogger.error(message);
                break;
            case LogLevel.Fatal:
                this.eventLogger.error(`FATAL: ${message}`, EventCode.FatalOutput);
                break;
        }
    }
}
