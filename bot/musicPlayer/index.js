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

const debug = require('debug')('discomoka:MusicPlayer');
const streams = require('./streamCollection');
const db = require('../../db');
const fs = require('fs');
const path = require('path');
const config = require('../../base/config');

const RESOURCE_PATH = config.getValue(config.KEYS.RESOURCE_PATH);

function MusicPlayer(serverID) {
    this._serverID = serverID;
    this._stream = streams.getStream(serverID);
    this._fsStreams = [];
    this._queue = [];

    this.getServerID = () => this._serverID;
    this.getStream = () => this._stream;

    this._onStreamEnd = () => {
        // Add Last played song to the end of the queue
        let lastSong = this._queue[0];
        this._queue.push(lastSong);

        // Remove first item in queue
        this._queue.splice(0, 1);
        this.playQueue();
    };

    this._stream.on('done', this._onStreamEnd);

    this.addSongToQueue = async (songID) => {
        let song = await db.Songs.getByServerAndId(this._serverID, songID);
        if (song) {
            debug('[S=%s] Adding File to Queue: %s ...', this._serverID, songID);
            this._queue.push(songID);
        } else {
            debug('[S=%s] Song %s could not be found', this._serverID, songID);
        }
    };

    this.playQueue = async () => {
        // No songs left, stopping playback
        if (!this._queue || this._queue.length === 0) { return; }

        let songID = this._queue[0];
        if (!songID) { return; }

        let song = await db.Songs.getByServerAndId(this._serverID, songID);
        if (song) {
            let songPath = MusicPlayer.getSongPath(song);
            debug('[S=%s] Streaming File: %s ...', this._serverID, songPath);
            try {
                let fsStream = fs.createReadStream(songPath);
                fsStream
                    .on('error', (err) => { debug('[%s] Error file streaming file', songPath) })
                    .on('end', () => { debug('[%s] File Stream ended', songPath); })
                    .pipe(this._stream, { end: false })
                ;
            } catch (err) {
                debug(err);
            }
        } else {
            debug('[S=%s] Song %s could not be found', this._serverID, songID);
            this._onStreamEnd();
        }
    };

    /**
     * @deprecated
     * @param songID
     * @returns {Promise.<void>}
     */
    this.playSong = async (songID) => {
        let song = await db.Songs.getByServerAndId(this._serverID, songID);
        if (song) {
            let songPath = MusicPlayer.getSongPath(song);
            debug('[S=%s] Streaming File: %s ...', this._serverID, songPath);
            try {
                let fsStream = fs.createReadStream(songPath);
                this._fsStreams.push(fsStream);
                fsStream
                    .on('error', (err) => { debug('[%s] An error occurred while file streaming', songPath) })
                    .on('end', () => { debug('[%s] File Stream ended', songPath) })
                    .pipe(this.getStream(), { end: false })
                ;
            } catch (err) {
                debug(err);
            }
        } else {
            debug('[S=%s] Song %s could not be found', this._serverID, songID);
        }
    };

    this.close = () => {
        debug('Closing %s Stream(s) ...', this._fsStreams.length);
        for (let i in this._fsStreams) {
            try {
                let stream = this._fsStreams[i];
                stream.close();
            } catch (err) { /* ignored */ }
        }
    };

    this.skip = () => {
        this._fsStreams.pop().close();
    };
}

MusicPlayer.getSongPath = (song) => {
    return path.join(
        fs.realpathSync(RESOURCE_PATH),
        song.source_type.replace(/:/g, '_'),
        song.source + '.mp3'
    );
};

MusicPlayer.Collection = { };
MusicPlayer.createPlayerForServer = (serverID) => {
    let player = new MusicPlayer(serverID);
    MusicPlayer.Collection[serverID] = player;
    return player;
};
MusicPlayer.getPlayerForServer = (serverID) => {
    if (serverID in MusicPlayer.Collection) {
        return MusicPlayer.Collection[serverID];
    } else {
        debug('Player for Server %s does not exist ...', serverID);
        return null;
    }
};
MusicPlayer.removePlayerForServer = (serverID) => {
    if (serverID in MusicPlayer.Collection) {
        debug('Deleting Player for Server %s ...', serverID);
        delete MusicPlayer.Collection[serverID];
    }
};

module.exports = MusicPlayer;
