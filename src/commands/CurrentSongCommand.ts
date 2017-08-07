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
import {TextChannel, Guild, RichEmbed, GuildMember, Snowflake, Collection} from "discord.js";
import {MusicPlayer} from "../utils/MusicPlayer";
import {Song} from "../db/models/Song";

const debugPrinter: debug = debug('discomoka-ts:CurrentSongCommand');

export class CurrentSongCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'currentsong',
            group: 'music_player',
            memberName: 'currentsong',
            description: 'Shows the currently playing song.',
            aliases: ['cuso', 'current', 'song', 'nowplaying', 'now', 'playing'],
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 30
            }
        });
    }

    public async run(msg:CommandMessage, args, fromPattern:boolean) {
        let server:Guild = msg.message.guild;
        let serverID:string = server.id.toString();
        let textChannel:TextChannel = msg.message.channel;

        let musicPlayer:MusicPlayer = MusicPlayer.getPlayer(serverID);
        if (!musicPlayer || !musicPlayer.isPlaying()) {
            return msg.say(`:no_entry: Sorry <@${msg.message.author.id}>, but I'm not playing anything right now :O`);
        }

        let currentSongID:number = musicPlayer.getCurrentSongID();
        let currentSong:Song = await Song.findById<Song>(currentSongID);
        if (currentSong) {
            let embedInfo:RichEmbed = new RichEmbed();
            embedInfo.color = 0x3ad100;
            embedInfo.setAuthor(this['client'].user.username, this['client'].user.avatarURL);
            embedInfo.title = `Currently playing on '${server.name}'`;
            embedInfo.addField('ID', currentSong.id, false);
            embedInfo.addField('Title', currentSong.title, true);
            embedInfo.addField('Artist', currentSong.artist, true);
            embedInfo.addField('Uploader', `<@${currentSong.user_id}>`, false);
            embedInfo.setFooter(`Source: (${currentSong.source_type}) ${currentSong.source_link}`);

            return textChannel.sendEmbed(embedInfo);
        } else {
            return msg.say(`:no_entry: Sorry <@${msg.message.author.id}>, but I don't know the current song. ` +
                `Maybe it was deleted shortly?`
            );
        }
    }
}
