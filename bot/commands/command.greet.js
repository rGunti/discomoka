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

const debug = require('debug')('discomoka:Command.Greet');
const utils = require('./utils');

const GreetCommand = {
    CommandName: 'greet',
    Alias: ['hi'],
    execute: (params) => {
        let args = params.MessageText.split(' ');
        if (args.length < 2) {
            utils.sendMessage(
                params.BotClient,
                params.IssuedBy,
                'Sorry, ' + utils.getMention(params.IssuedBy) +
                ', but I can\'t do that as you forgot to tell me whom to greet.'
            );
            return;
        }
        let greetTarget = args[1];
        if (!greetTarget.startsWith('<@')) {
            utils.sendMessage(
                params.BotClient,
                params.IssuedBy,
                'Sorry, ' + utils.getMention(params.IssuedBy) +
                ', but I can\'t greet this being. Try to use a @mention next time' +
                ' and don\'t ask me to greet a whole group, okay?'
            );
            return;
        }

        greetTarget = greetTarget.slice(2, -1);
        if (greetTarget.startsWith('!')) { greetTarget = greetTarget.slice(1); }

        utils.sendMessage(
            params.BotClient,
            {id: greetTarget},
            'Hi ' + utils.getMentionById(greetTarget) + '! ' +
                utils.getMention(params.IssuedBy) + ' wanted me to greet you. :raising_hand:'
        );
    }
};

module.exports = GreetCommand;
