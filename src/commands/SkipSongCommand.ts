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
import {TextChannel} from "discord.js";

const debugPrinter: debug = debug('discomoka-ts:SkipSongCommand');

export class SkipSongCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'skipsong',
            group: 'music_player',
            memberName: 'skipsong',
            description: 'Skips the current playing song in the queue.',
            aliases: ['skip'],
            guildOnly: true,
            throttling: {
                usages: 3,
                duration: 5
            }
        });
    }

    public run(msg:CommandMessage, args, fromPattern:boolean):void {
        let serverID:string = msg.message.guild.id.toString();
        let textChannel:TextChannel = msg.message.channel;

        let musicPlayer:MusicPlayer = MusicPlayer.getPlayer(serverID);
        if (!musicPlayer) {
            return msg.say(`:no_entry: Sorry <@${msg.message.author.id}>, but I'm not playing anything right now :O`);
        } else {
            musicPlayer.skip();
        }
    }

}
