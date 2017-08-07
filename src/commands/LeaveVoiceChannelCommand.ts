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
import {TextChannel, Message, VoiceChannel} from "discord.js";
import {VoiceConnectionManager} from "../utils/VoiceConnectionManager";
import {MusicPlayer} from "../utils/MusicPlayer";

const debugPrinter: debug = debug('discomoka:LeaveVoiceChannelCommand');

export class LeaveVoiceChannelCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'leave',
            group: 'music_player',
            memberName: 'leave',
            description: 'Leaves the voice channel.',
            throttling: {
                usages: 1,
                duration: 15
            }
        });
    }

    public run(msg:CommandMessage, args, fromPattern:boolean):void {
        let channel:TextChannel = msg.message.channel;
        let voiceChannel:VoiceChannel = msg.message.member.voiceChannel;
        if (voiceChannel) {
            voiceChannel.leave();
            let serverID:string = voiceChannel.guild.id.toString();
            MusicPlayer.deletePlayer(serverID);
            VoiceConnectionManager.removeConnection(serverID);
            return msg.say(`:white_check_mark: Done!`);
        } else {
            return msg.say(`:no_entry: Sorry but I can\'t find you.`);
        }
    }
}

