import { EmbedBuilder } from 'discord.js';
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
                
                let cmdOptions = "";
                if(command.options) {
                    for (let idx = 0; idx < command.options.length; idx++) {
                        const opt = command.options[idx];
                        const optName = `${opt.name}${opt.required ? "" : "?"}`;
                        cmdOptions += idx === command.options.length - 1 ? optName : optName + ", ";
                    }
                }
                
                commandStr += 
                `\\> \`${command.name}\` ${command.aliases ? `[\`${command.aliases.join("`")}\`]` : ""} ${cmdOptions !== "" ? `(${cmdOptions})` : ""} - ${command.usage}\n`
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