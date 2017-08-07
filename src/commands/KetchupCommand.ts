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
import {TextChannel, Message} from "discord.js";

const debugPrinter: debug = debug('discomoka:KetchupCommand');

export class KetchupCommand extends Command {
    static IMAGES:string[] = [
        './resources/ketchup/ketchup1.gif',
        './resources/ketchup/ketchup2.gif'
    ];

    constructor(client) {
        super(client, {
            name: 'ketchup',
            aliases: ['splat'],
            group: 'fun',
            memberName: 'ketchup',
            description: 'Ketchup',
            throttling: {
                usages: 1,
                duration: 60
            }
        });
    }

    private static generateRandomNumber(max:number, min:number = 0):number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    public run(msg:CommandMessage, args, fromPattern:boolean):void {
        let channel:TextChannel = msg.message.channel;
        let gifIndex:number = KetchupCommand.generateRandomNumber(KetchupCommand.IMAGES.length);
        channel.send({
            files: [ KetchupCommand.IMAGES[gifIndex] ]
        });
    }

}
