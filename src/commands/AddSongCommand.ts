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
import { Command, CommandMessage, ArgumentInfo } from 'discord.js-commando';
import * as ytdl from 'youtube-dl';
import {DiscomokaConfig} from "../config/DiscomokaConfig";
import {ConfigReader} from "../config/ConfigReader";
import * as path from 'path';
import * as fs from 'fs';
import * as fx from 'mkdir-recursive';
import {Song} from "../db/models/Song";
import {TextChannel, Message, User} from "discord.js";
import {MusicPlayer} from "../utils/MusicPlayer";

const debugPrinter: debug = debug('discomoka-ts:AddSongCommand');

export class AddSongCommand extends Command {
    allowedExtractors:string[];
    resourcePath:string;

    constructor(client) {
        super(client, {
            name: 'addsong',
            aliases: ['as'],
            group: 'music_player',
            memberName: 'addsong',
            description: 'Adds a song to the server\'s playlist.',
            guildOnly: true,
            args: [
                { key: 'url',
                    type: 'string',
                    label: 'Video / Music URL',
                    prompt: 'Enter the URL of the Video / Music item you wan\'t to add:' }
            ],
            throttling: {
                usages: 3,
                duration: 15
            }
        });

        let config: DiscomokaConfig = ConfigReader.getConfig();
        this.allowedExtractors = config.allowedExtractors;
        this.resourcePath = config.resourcePath;

        if (!AddSongCommand.fileExists(this.resourcePath)) {
            debugPrinter('Creating Resource Directory ...');
            fx.mkdirSync(this.resourcePath);
        }
    }

    private static fileExists(path:string):boolean {
        try {
            fs.accessSync(path, fs.constants.F_OK);
            return true;
        } catch (err) {
            return false;
        }
    }

    private static getResourcePath(resourcePath:string, extractor:string, videoID:string):string {
        return path.join(resourcePath, extractor, videoID);
    }

    private static sendSuccess(channel:TextChannel, author:User, song:Song):void {
        channel.send(`:white_check_mark: Hey <@${author.id}>, your download is done! :D\n` +
            `Your song has been registered under the following ID: \`${song.id}\``
        )
            .then((m:Message) => debugPrinter(m.content))
            .catch(console.error);
    }

    private static sendAlreadyExists(channel:TextChannel, author:User, song:Song):void {
        channel.send(`:information_source: <@${author.id}>, your download was ignored because we already have that. ` +
            `This is the ID: \`${song.id}\``
        )
            .then((m:Message) => debugPrinter(m.content))
            .catch(console.error);
    }

    public run(msg:CommandMessage, args, fromPattern:boolean):void {
        let { url } = args;
        let resourcePath = this.resourcePath;
        let allowedExtractors = this.allowedExtractors;
        let channel:TextChannel = msg.message.channel;
        let serverID:string = msg.message.guild.id.toString();
        ytdl.getInfo(url, [], null, async (err, info) => {
            if (err) {
                channel.send(`:no_entry: Sorry, <@${msg.message.author.id}>, but something went wrong here D:\n` +
                    `Information has been sent to the developer.`
                )
                    .then((m:Message) => debugPrinter(m.content))
                    .catch(console.error);
            } else if (allowedExtractors.length > 0 && (allowedExtractors.indexOf(info.extractor) < 0)) {
                channel.send(`:no_entry: Sorry, <@${msg.message.author.id}>, but we don\'t support ${info.extractor}.`)
                    .then((m:Message) => debugPrinter(m.content))
                    .catch(console.error);
            } else {
                let outputPath = AddSongCommand.getResourcePath(resourcePath, info.extractor, info.id);
                let mp3Path = `${outputPath}.mp3`;

                let dirName = path.dirname(mp3Path);
                if (!AddSongCommand.fileExists(dirName)) {
                    fx.mkdirSync(dirName);
                }

                let existingSong:Song = await Song.findOne<Song>({
                    where: {
                        source_type: info.extractor,
                        source: info.id,
                        server_id: msg.message.guild.id.toString()
                    }
                });
                if (existingSong) {
                    // If Song already exists on Server, respond with "Already exists"
                    AddSongCommand.sendAlreadyExists(channel, msg.message.author, existingSong);
                    return;
                } else {
                    existingSong = await Song.findOne<Song>({
                        where: {
                            source_type: info.extractor,
                            source: info.id
                        }
                    });
                    if (existingSong) {
                        let newSong:Song = Song.build<Song>({
                            server_id: msg.message.guild.id.toString(),
                            user_id: msg.message.author.id.toString(),
                            title: info.title,
                            artist: info.uploader,
                            source_type: info.extractor,
                            source: info.id,
                            source_link: info.webpage_url
                        });
                        newSong = await newSong.save();
                        AddSongCommand.sendSuccess(channel, msg.message.author, newSong);
                        MusicPlayer.addSongToQueue(serverID, newSong);
                        return;
                    } else {
                        debugPrinter('Glitch in the system, redownloading track ...')
                    }
                }

                ytdl.exec(url,
                    ['-x', '--audio-format', 'mp3', '-o', `${outputPath}.TMP`],
                    { cwd: path.dirname(resourcePath) },
                    async (err, output) => {
                        if (err) {
                            channel.send(`:no_entry: Sorry, <@${msg.message.author.id}>, but your download failed! ` +
                                `The technician is notified™.`
                            )
                                .then((m:Message) => debugPrinter(m.content))
                                .catch(console.error);
                        } else {
                            let song:Song = Song.build<Song>({
                                server_id: msg.message.guild.id.toString(),
                                user_id: msg.message.author.id.toString(),
                                title: info.title,
                                artist: info.uploader,
                                source_type: info.extractor,
                                source: info.id,
                                source_link: info.webpage_url
                            });
                            song = await song.save();
                            AddSongCommand.sendSuccess(channel, msg.message.author, song);
                            MusicPlayer.addSongToQueue(serverID, song);
                        }
                    }
                );
            }
        });
        return;
    }
}
