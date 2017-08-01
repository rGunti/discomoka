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

const debug = require('debug')('discomoka:MusicPlayer.StreamCollection');
const moment = require('moment');

const StreamCollection = {
    CollectionCreated: moment().format('YYYY-MM-DD HH:mm:ss.SSS ZZ'),
    _Streams: {},
    addStream: (serverID, stream) => {
        debug('[COL=%s] Adding Stream for Server %s ...', StreamCollection.CollectionCreated, serverID);
        StreamCollection._Streams[serverID] = stream;
    },
    getStream: (serverID) => {
        if (serverID in StreamCollection._Streams) {
            return StreamCollection._Streams[serverID];
        } else {
            debug('[COL=%s] Stream for Server %s does not exist', StreamCollection.CollectionCreated, serverID);
            return null;
        }
    },
    removeStream: (serverID) => {
        debug('[COL=%s] Removing Stream for Server %s ...', StreamCollection.CollectionCreated, serverID);
        if (serverID in StreamCollection._Streams) {
            delete StreamCollection._Streams[serverID];
        }
    }
};

module.exports = StreamCollection;
