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
import { Command, CommandMessage, ArgumentInfo, VoiceChannel } from 'discord.js-commando';
import {MusicPlayer} from "../utils/MusicPlayer";
import {Song} from "../db/models/Song";
import {TextChannel} from "discord.js";

const debugPrinter: debug = debug('discomoka-ts:PlaySongCommand');

export class PlaySongCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'playsong',
            group: 'music_player',
            memberName: 'playsong',
            description: 'Plays a song of the queue.',
            aliases: ['ps'],
            guildOnly: true,
            args: [
                { key: 'songID',
                    type: 'integer',
                    label: 'Song ID',
                    prompt: 'Enter a Song ID to play',
                    default: -1 }
            ],
            throttling: {
                usages: 1,
                duration: 15
            }
        });
    }

    public async run(msg:CommandMessage, args, fromPattern:boolean) {
        let { songID } = args;
        let hasSongID:boolean = (songID > 0);
        let serverID:string = msg.message.guild.id.toString();
        let textChannel:TextChannel = msg.message.channel;

        let musicPlayer = MusicPlayer.getPlayer(serverID);
        if (!musicPlayer) {
            musicPlayer = MusicPlayer.createPlayer(serverID);
        }
        if (!musicPlayer) {
            await textChannel.send(`Sorry <@${msg.message.author.id}>, but something went wrong.`);
            return;
        }

        if (!hasSongID) {
            let songs:Song[] = await Song.findAll<Song>({
                where : { server_id: serverID }
            });
            for (let i in songs) {
                let song:Song = songs[i];
                musicPlayer.addSong(song);
            }
            musicPlayer.playQueue();
        } else {
            let song:Song = await Song.findOne<Song>({
                where : { id: Number(songID), server_id: serverID }
            });
            if (!song) {
                await textChannel.send(`Sorry <@${msg.message.author.id}>, but I don't know this song.`);
                return;
            } else {
                musicPlayer.playSongInQueue(song.id);
            }
        }
    }
}

