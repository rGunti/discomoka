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
import {RichEmbed, TextChannel} from "discord.js";
import {DiscomokaConfig} from "../config/DiscomokaConfig";
import {ConfigReader, PackageInfo} from "../config/ConfigReader";
import * as fs from "fs";
import MemoryUsage = NodeJS.MemoryUsage;
import * as os from "os";

const debugPrinter: debug = debug('discomoka-ts:AboutMeCommand');

export class AboutMeCommand extends Command {
    static setup:boolean;
    static config:DiscomokaConfig;
    static packageInfo:PackageInfo;
    static descriptionFileContent:string;
    static todoFileContent:string;
    static linksFileContent:string;

    constructor(client) {
        super(client, {
            name: 'aboutme',
            group: 'util',
            memberName: 'aboutme',
            description: 'Tells you about myself.',
            aliases: ['me', 'i', 'wtfwhoaru', 'hi', 'e'],
            throttling: {
                usages: 1,
                duration: 60
            }
        });

        if (!AboutMeCommand.setup) {
            AboutMeCommand.config = ConfigReader.getConfig();
            AboutMeCommand.packageInfo = ConfigReader.getPackageConfig();
            AboutMeCommand.descriptionFileContent = fs.readFileSync('./resources/description.txt').toString();
            AboutMeCommand.todoFileContent = fs.readFileSync('./resources/todo.txt').toString();
            AboutMeCommand.linksFileContent = fs.readFileSync('./resources/links.txt').toString();
        }
    }

    public async run(msg:CommandMessage, args, fromPattern:boolean) {
        let textChannel:TextChannel = msg.message.channel;
        let embedInfo:RichEmbed = new RichEmbed();

        let memoryUsage:MemoryUsage = process.memoryUsage();

        embedInfo
            .setAuthor(this['client'].user.username, this['client'].user.avatarURL)
            .setTitle(`About ${AboutMeCommand.config.title}`)
            .setDescription(AboutMeCommand.descriptionFileContent)
            .addField('Version', AboutMeCommand.packageInfo.version, true)
            .addField('Instance', AboutMeCommand.config.flag, true)
            .addField('Platform', `Node.JS ${process.version}`, true)
            .addField('Memory Usage',
                `Heap: ${Math.floor(memoryUsage.heapUsed / 1024)} / ` +
                `${Math.floor(memoryUsage.heapTotal / 1024)} kB\n` +
                `RSS: ${Math.floor(memoryUsage.rss / 1024 / 1024)} MB\n` +
                `OS: ${Math.floor(os.freemem() / 1024 / 1024)} / ${Math.floor(os.totalmem() / 1024 / 1024)} MB`,
                true)
            .addField('Uptime', `${AboutMeCommand.formatTime(process.uptime())}`,
                true)
            .addField('Planned Features & ToDos', AboutMeCommand.todoFileContent, false)
            .addField('Links', AboutMeCommand.linksFileContent, false)
            .setFooter(`© ${new Date().getFullYear()}, rGunti, All rights reserved.`)
        ;
        return textChannel.send({ embed: embedInfo });
    }

    static pad(num:number):string {
        return ("0"+num).slice(-2);
    }

    static formatTime(secs:number):string {
        secs = Math.floor(secs);

        let minutes = Math.floor(secs / 60);
        secs = secs % 60;
        let hours = Math.floor(minutes / 60);
        minutes = minutes % 60;
        let days = Math.floor(hours / 24);
        hours = hours % 24;

        return `${days} day(s), ${hours}:${AboutMeCommand.pad(minutes)}:${AboutMeCommand.pad(secs)}`;
    }

}

