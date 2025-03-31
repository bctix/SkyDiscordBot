import { EmbedBuilder, time, TimestampStyles } from 'discord.js';
import { ChatCommand, ChatCommandOptions, ChatCommandExecute } from '../../types/bot_classes';
import { EventDefinition, eventDefinitions, eventNames } from '../../data/clock/event-data';
import { getEventTime, getMinutesToEvent } from '../../data/clock/date-tools/event-time-offset';
import { DateTime } from 'luxon';

const textcommand: ChatCommand = new ChatCommand(
    {
        name: "wax",
        description: "yummy",
        usage: "Get all the times for commonly farmed wax events.",
        aliases: ["w"],
        async execute(execute: ChatCommandExecute) {

            const now = DateTime.now();
            const commonWaxEvents = [
                eventNames.GRANDMA,
                eventNames.GEYSER,
                eventNames.TURTLE,
                eventNames.DREAMS_SKATER
            ]

            commonWaxEvents.sort((a,b) => {
                const aEvent = eventDefinitions[a];
                const bEvent = eventDefinitions[b];

                const aMintues = getMinutesToEvent(aEvent, now);
                const bMinutes = getMinutesToEvent(bEvent, now);

                return aMintues - bMinutes;
            })

            const embed = new EmbedBuilder();
            embed.setTitle("Wax events");
            embed.setColor([229, 222, 207]);
            
            commonWaxEvents.forEach(eventName => {
                const event = eventDefinitions[eventName];
                const eventTime = getEventTime(event, now);

                embed.addFields(
                    {name: event.name, value: time(eventTime.toJSDate(), TimestampStyles.RelativeTime)}
                );
            })

            const resetTime = getEventTime(eventDefinitions[eventNames.DAILY_RESET], now);

            embed.addFields(
                { name: "Daily Reset", value: time(resetTime.toJSDate(), TimestampStyles.RelativeTime)},
            );

            execute.data.reply({embeds: [embed]});
        },
    } as ChatCommandOptions
);

export default textcommand;