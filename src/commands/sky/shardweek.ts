import { EmbedBuilder, InteractionContextType } from 'discord.js';
import { ChatCommand, ChatCommandOptions, ChatCommandExecute } from '../../types/bot_classes';
import { getShardInfo, ShardInfo } from '../../data/shard';
import { DateTime, Duration } from 'luxon';
import Translation from "../../lang/en.json"

const realms = Translation["skyRealms"];

const textcommand: ChatCommand = new ChatCommand(
    {
        name: "shardweek",
        description: "Forecast for the week",
        aliases: ["sw"],
        usage: "Tells you about shard for the next seven days",
        contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
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
                const nameStr = 
                `> ${shardInfo.hasShard ? `` : `~~`}**${shardInfo.date.toLocaleString({weekday: "long"})}** (${shardInfo.date.toLocaleString(DateTime.DATE_SHORT)}) ${shardInfo.hasShard ? `` : `~~`}`
                const valueStr =
                `${shardInfo.hasShard ? `` : `~~`}\`${realms[`${shardInfo.realm}.short`]}\`${shardInfo.hasShard ? `` : `~~`},\n${shardInfo.hasShard ? shardInfo.isRed ? "Red shard" : "Black shard" : "~~None~~"}`
                embed.addFields(
                    {name: nameStr, 
                    value: valueStr}
                )
            });
            embed.setColor([229, 222, 207]);

            execute.data.reply({embeds: [embed]});
        },
    } as ChatCommandOptions
);

export default textcommand;