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
import {Song} from "../db/models/Song";
import {TextChannel, Message} from "discord.js";

const debugPrinter: debug = debug('discomoka-ts:ListSongsCommand');

export class ListSongsCommand extends Command {
    static PAGE_SIZE:number = 15;

    constructor(client) {
        super(client, {
            name: 'listsongs',
            aliases: ['ls'],
            group: 'music_player',
            memberName: 'listsongs',
            description: 'Lists the server\'s playlist.',
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 60
            }
        });
    }

    public run(msg:CommandMessage, args, fromPattern:boolean):void {
        let serverID = msg.message.guild.id.toString();
        let channel:TextChannel = msg.message.channel;
        channel.startTyping();
        Song.findAll<Song>({ where: { server_id: serverID }, order: [ [ 'id', 'ASC' ] /* Sort by ID */ ] })
            .then((songs:Song[]) => {
                let messages = [];
                let message:string = `__**Songs on '${msg.message.guild.name}'**__`;
                let i:number = 0;
                for (let songIndex in songs) {
                    i++;
                    let song:Song = songs[songIndex];
                    message += `\n#${song.id} : ${song.title} - ${song.artist}`;

                    if (i % ListSongsCommand.PAGE_SIZE == 0) {
                        messages.push(message);
                        message = "";
                    }
                }
                if (message.length >= 2) {
                    messages.push(message);
                }

                if (messages.length > 0) {
                    ListSongsCommand.sendMessageArray(channel, messages, 0, 500);
                }
            });
    }

    private static sendMessageArray(channel:TextChannel, messages:string[], index:number, delay:number):void {
        if (index >= messages.length) {
            return;
        }
        let message:string = messages[index];
        channel.send(message);
        setTimeout(() => {
            ListSongsCommand.sendMessageArray(channel, messages, index + 1, delay);
        }, delay);
    }
}
