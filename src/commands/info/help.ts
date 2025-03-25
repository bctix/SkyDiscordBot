import { ChatInputCommandInteraction, Colors, EmbedBuilder } from 'discord.js';
import { ChatCommand, ChatCommandOptions, ChatCommandExecute } from '../../types/bot_classes';

const textcommand: ChatCommand = new ChatCommand(
    {
        name: "help",
        description: "uhm",
        usage: "Self explainitory",
        async execute(execute: ChatCommandExecute) {
            const commands = execute.client.chatcommands.values();

            let commandStr = "";

            for (const command of commands) {
                if (!command.usage || command.isAlias) continue;
                commandStr += 
                `\`${command.name}\` ${command.aliases ? `[\`${command.aliases.join("`")}\`]` : ""} - ${command.usage}\n`
            }

            const embed = new EmbedBuilder();
            embed.setTitle("Commands for SkyDiscordBot");
            embed.setDescription(commandStr);
            embed.setColor([229, 222, 207]);
            
            execute.data.reply({embeds: [embed]});
        },
    } as ChatCommandOptions
);

export default textcommand;