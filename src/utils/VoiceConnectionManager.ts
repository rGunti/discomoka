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
import {VoiceConnection} from "discord.js";

const debugPrinter: debug = debug('discomoka-ts:VoiceConnectionManager');

export class VoiceConnectionManager {
    private static connections: Map<string, VoiceConnection> = new Map<string, VoiceConnection>();

    public static addConnection(serverID:string, voiceConnection:VoiceConnection):void {
        debugPrinter(`Adding VoiceConnection for Server ${serverID} ...`);
        VoiceConnectionManager.connections.set(serverID, voiceConnection);
    }

    public static getConnection(serverID:string):VoiceConnection {
        if (!VoiceConnectionManager.connections.has(serverID)) {
            debugPrinter(`No VoiceConnection available for Server ${serverID}!`);
            return null;
        } else {
            return VoiceConnectionManager.connections.get(serverID);
        }
    }

    public static removeConnection(serverID:string):void {
        debugPrinter(`Removing VoiceConnection for Server ${serverID} ...`);
        VoiceConnectionManager.connections.delete(serverID);
    }
}
