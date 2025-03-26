import { ChatInputCommandInteraction, Colors, EmbedBuilder, ShardingManager } from 'discord.js';
import { ChatCommand, ChatCommandOptions, ChatCommandExecute } from '../../types/bot_classes';
import { getShardInfo, ShardInfo } from '../../data/shard';
import { DateTime, Duration } from 'luxon';

const textcommand: ChatCommand = new ChatCommand(
    {
        name: "shardweek",
        description: "Forecast for the week",
        aliases: ["sw"],
        usage: "Tells you about shard for the next seven days",
        async execute(execute: ChatCommandExecute) {
            const shardInfoWeek: ShardInfo[] = [];

            for (let idx = 0; idx < 7; idx++) {
                const today = DateTime.now();
                let offset = Duration.fromObject({day: idx});
                const newday = today.plus(offset);
                const info = getShardInfo(newday);
                shardInfoWeek.push(info);
            }

            const embed = new EmbedBuilder();
            embed.setTitle("Shard forecast");
            shardInfoWeek.forEach(shardInfo => {
                embed.addFields(
                    {name: shardInfo.date.toLocaleString({weekday: "long"}), 
                    value: shardInfo.hasShard ? shardInfo.isRed ? "Red" : "Black" : "None"}
                )
            });
            embed.setColor([229, 222, 207]);

            execute.data.reply({embeds: [embed]});
        },
    } as ChatCommandOptions
);

export default textcommand;