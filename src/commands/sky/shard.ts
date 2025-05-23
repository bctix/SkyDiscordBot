import { ApplicationCommandOptionType, Colors, EmbedBuilder, InteractionContextType, time, TimestampStyles } from 'discord.js';
import { ChatCommand, ChatCommandOptions, ChatCommandExecute } from '../../types/bot_classes';
import { getShardInfo } from '../../data/shard';
import { DateTime } from 'luxon';
import Translation from "../../lang/en.json"

const Maps = Translation["skyMaps"];
const Relams = Translation["skyRealms"]

const textcommand: ChatCommand = new ChatCommand(
    {
        name: "shard",
        description: "Free stuff!!!!",
        aliases: ["s"],
        usage: "Tells you all about the shard today (if there is one today). If offset is provided, it offsets the day shown.",
        contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
        options: [
            {
                name: "dayoffset",
                description: "offset days",
                default: 0,
                type: ApplicationCommandOptionType.Number,
            }
        ],
        argParser(str, message) {
            let int = parseInt(str);
            return [isNaN(int) ? 0 : int];
        },
        async execute(execute: ChatCommandExecute) {
            var offset = execute.args[0];
            var today = DateTime.now()
            let newDay = today.plus({day: offset});
            const shardInfo = getShardInfo(newDay);

            const hasShard = shardInfo.hasShard;

            if (!hasShard) {
                execute.data.reply("There is no shard today!");
                return;
            }

            const embed = new EmbedBuilder();
            embed.setTitle(`There is a ${shardInfo.isRed ? "Red" : "Black"} Shard today!`);
            embed.setColor(shardInfo.isRed ? Colors.Red : Colors.DarkGrey);

            const imgUrl = shardInfo.numVarient > 1 && (shardInfo.numVarient - 1|| shardInfo.numVarient - 1 === 0)
            ? `https://raw.githubusercontent.com/PlutoyDev/sky-shards/e59ed5a864c47cf5ef40436fd565b662509fb81c/public/infographics/map_varient_clement/${shardInfo.map}.${shardInfo.numVarient - 1}.webp`
            : `https://raw.githubusercontent.com/PlutoyDev/sky-shards/e59ed5a864c47cf5ef40436fd565b662509fb81c/public/infographics/map_clement/${shardInfo.map}.webp`

            embed.setImage(imgUrl);

            embed.addFields(
                {name: "Where?", value: `in \`${Relams[`${shardInfo.realm}.long`]}\` at the \`${Maps[shardInfo.map]}\``},
                {name: "Reward", value: `${shardInfo.isRed ? `\`${shardInfo.rewardAC}\` Red candles` : `\`4 cakes of wax\``}`}
            )
            
            for (let idx = 0; idx < shardInfo.occurrences.length; idx++) {
                const occurrence = shardInfo.occurrences[idx];
                embed.addFields(
                    {name: `Shard #${idx+1}`, value: `${time(occurrence.land.toJSDate(), TimestampStyles.RelativeTime)} - ${time(occurrence.end.toJSDate(), TimestampStyles.RelativeTime)}`},
                );
            }

            execute.data.reply({embeds: [embed]});
        },
    } as ChatCommandOptions
);

export default textcommand;