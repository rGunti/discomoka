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

import { ConfigReader, DiscomokaConfig } from './config'
import { HeaderPrinter } from "./config/HeaderPrinter";
import { debug } from 'debug';
import { Client, Message } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';
import * as path from 'path';
import {DbInstance} from "./db/index";
import {Song} from "./db/models/Song";
import {MusicPlayer} from "./utils/MusicPlayer";

const debugPrinter:debug = debug('discomoka-ts:MAIN');
const eventPrinter:debug = debug('discomoka-ts:Event');
const messagePrinter:debug = debug('discomoka-ts:Message');

ConfigReader.readDefaultConfig<DiscomokaConfig>();
const config:DiscomokaConfig = ConfigReader.getConfig();

HeaderPrinter.print(ConfigReader.getPackageConfig(), config);

debugPrinter(`Starting up ${config.title} [${config.flag}]`);

debugPrinter('Initializing Db Connection ...');
DbInstance.init();

debugPrinter('Initializing Music Player ...');
MusicPlayer.init(config);

const client = new CommandoClient({
    commandPrefix: config.commandPrefix,
    disableEveryone: false
});
client.registry
    .registerDefaultTypes()
    .registerDefaultGroups()
    .registerDefaultCommands({
        prefix: false
    })
    .registerGroups([
        ['test_commands', 'Test Commands'],
        ['music_player', 'Music Player Commands']
    ])
    .registerCommandsIn(path.join(__dirname, 'commands'))
;
client.on('ready', () => {
    eventPrinter('Bot ready');
    client.user.setGame('a bot');
});
client.on('message', (message:Message) => {
    //eventPrinter('Message received');
    messagePrinter(`${message.author.username}#${message.author.discriminator} : ${message}`);

    //let song = Song.build<Song>({
    //    server_id: message.guild.id.toString(),
    //    user_id: message.author.id.toString(),
    //    title: message.toString(),
    //    artist: '',
    //    source_type: '#MESSAGE',
    //    source: '-',
    //    source_link: '-'
    //});
    //song.save();

    //Song.findOne<Song>({ where: { id: 1 } })
    //    .then(song => {
    //    debugPrinter(song);
    //});
});

client.login(config.apiKey);
