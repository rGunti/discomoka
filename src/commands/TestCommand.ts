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

const debugPrinter: debug = debug('discomoka-ts:TestCommand');

export class TestCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'test',
            group: 'test_commands',
            memberName: 'test',
            description: 'This is just a test command',
            examples: ['test'],
            aliases: ['t'],
            guildOnly: true,
            args: [
                { key: 'message',
                    type: 'string',
                    label: 'Message to send',
                    prompt: 'Enter your message here:' }
            ],
            throttling: {
                usages: 1,
                duration: 3
            }
        });
    }

    public run(msg:CommandMessage, args, fromPattern:boolean):void {
        let { message } = args;
        return msg.say(`derp: ${message}`);
    }
}
