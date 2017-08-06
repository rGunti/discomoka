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
import {DiscomokaConfig} from "../config"
import * as path from 'path';
import {Song} from "../db/models/Song";
import {VoiceConnection, StreamDispatcher} from "discord.js";
import {VoiceConnectionManager} from "./VoiceConnectionManager";

const debugPrinter: debug = debug('discomoka-ts:MusicPlayer');

export class MusicPlayer {
    /* --- Static --- */
    private static config:DiscomokaConfig;
    private static playerMap:Map<string, MusicPlayer>;

    public static init(config:DiscomokaConfig):void {
        MusicPlayer.config = config;
        MusicPlayer.playerMap = new Map<string, MusicPlayer>();
    }

    private static getPath(song:Song):string {
        return path.join(MusicPlayer.config.resourcePath, song.source_type, `${song.source}.mp3`);
    }

    private static setupDispatcher(instance:MusicPlayer, con:VoiceConnection, song:Song):void {
        let dispatcher:StreamDispatcher = con.playFile(MusicPlayer.getPath(song));

        dispatcher.once('end', (reason:string) => {
            debugPrinter(`${instance.serverID}: Playback has ended (Reason: ${reason})`);

            // TODO: we could introduce some more randomness by placing the last played item somewhere else
            //instance.queue.push(instance.queue[0]);
            //instance.queue.splice(0, 1);

            if (reason == 'skip') {
                instance.takeNext();
            } else if (reason == 'wish') {
                instance.currentSongID = instance.userRequestedId;
                instance.play();
            } else {
                instance.takeNext();
            }
        });

        dispatcher.on('error', (e) => {
            debugPrinter(`${instance.serverID}: An error occurred:`, e);
        });

        instance.dispatcher = dispatcher;
    }

    public static createPlayer(serverID:string):MusicPlayer {
        let player:MusicPlayer = new MusicPlayer(serverID);
        if (player.hasVoiceConnection()) {
            MusicPlayer.playerMap.set(serverID, player);
            return player;
        } else {
            debugPrinter(`Player for ${serverID} does not have a Voice Connection!`);
            return null;
        }
    }

    public static getPlayer(serverID:string):MusicPlayer {
        if (MusicPlayer.playerMap.has(serverID)) {
            return MusicPlayer.playerMap.get(serverID);
        } else {
            debugPrinter(`No Player available for ${serverID} ...`);
            return null;
        }
    }

    public static deletePlayer(serverID:string):void {
        debugPrinter(`Deleting Player for Server ${serverID} ...`);
        MusicPlayer.playerMap.delete(serverID);
    }

    public static addSongToQueue(serverID:string, song:Song):void {
        let player = MusicPlayer.getPlayer(serverID);
        if (player) {
            player.addSong(song);
        }
    }

    private static generateRandomNumber(max:number, min:number = 0):number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /* --- Instance --- */
    private serverID:string;
    private voiceConnection:VoiceConnection;
    private queue:number[];
    private dispatcher:StreamDispatcher;
    private currentSongID:number;
    private userRequestedId:number;

    constructor(serverID:string) {
        debugPrinter(`Creating Player for Server ${serverID} ...`);
        this.serverID = serverID;
        this.voiceConnection = VoiceConnectionManager.getConnection(this.serverID);
        this.queue = [];
    }

    public hasVoiceConnection():boolean {
        return !(!this.voiceConnection);
    }

    public isPlaying():boolean {
        return this.hasVoiceConnection() && this.queue.length > 0 && !(!this.dispatcher);
    }

    public getCurrentSongID():number {
        if (this.isPlaying()) { return this.currentSongID; }
        else { return -1; }
    }

    public addSong(song:Song):void {
        debugPrinter(`Adding Song ${song.source_type}/${song.source}`);
        this.addSongByID(song.id);
    }

    public addSongByID(songID:number):void {
        if (this.queue.indexOf(songID) == -1) {
            this.queue.push(songID);
        }
    }

    public removeSong(song:Song):void {
        this.removeSongByID(song.getDataValue('id'));
    }

    public removeSongByID(songID:number):void {
        if (this.queue.indexOf(songID) == -1) {
            this.queue.push(songID);
        }
    }

    private takeNext():void {
        this.currentSongID = this.queue[MusicPlayer.generateRandomNumber(this.queue.length - 1)];
        this.play();
    }

    private async play() {
        // Cancel on empty queue
        if (this.queue.length === 0) { return; }
        // Clear user request
        this.userRequestedId = null;

        let currentSong:Song = await Song.findById<Song>(this.currentSongID);
        if (!currentSong) {
            this.removeSongByID(this.currentSongID);
            this.takeNext();
            return;
        } else {
            MusicPlayer.setupDispatcher(this, this.voiceConnection, currentSong);
        }
    }

    public playQueue():void {
        this.takeNext();
    }

    public playSongInQueue(songID:number):void {
        if (this.queue.indexOf(songID) >= 0) {
            this.addSongByID(songID);
        }
        if (this.queue.indexOf(songID) >= 0) {
            if (this.dispatcher) {
                this.userRequestedId = songID;
                this.dispatcher.end('wish');
            } else {
                this.currentSongID = songID;
                this.play();
            }
        }
    }

    public skip():void {
        if (this.dispatcher) {
            this.dispatcher.end('skip');
        }
    }
}
