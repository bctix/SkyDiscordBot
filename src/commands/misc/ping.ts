import { ChatInputCommandInteraction } from 'discord.js';
import { ChatCommand, ChatCommandOptions, ChatCommandExecute } from '../../types/bot_classes';

const textcommand: ChatCommand = new ChatCommand(
    {
        name: "ping",
        description: "Ping pong!",
        argParser(str, message) {
            return [str];
        },
        async execute(execute: ChatCommandExecute) {
           execute.data.reply("Pong!");
        },
    } as ChatCommandOptions
);

export default textcommand;