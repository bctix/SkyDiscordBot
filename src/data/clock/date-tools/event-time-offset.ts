import { DateTime } from "luxon";
import { getSkyTime } from "./regional-time";
import { EventDefinition } from "../event-data";

export function getMinutesToEvent(eventData: EventDefinition, currentDate: DateTime) {
    const { day, hour, minute } = getSkyTime(currentDate);

    const dayOffset = eventData.days ? eventData.days(day) : 0;
    const hourOffset = eventData.hour(hour);
    const minuteOffset = eventData.minute(minute);

    if (eventData.period > 24 * 60) {
        return (dayOffset * 24 * 60) + (hourOffset * 60) + minuteOffset;
    } else if (eventData.period === 24 * 60) {
        return (hourOffset * 60) + minuteOffset;
    } else if (hourOffset > 0) {
        return eventData.period - ((hourOffset * 60) - minuteOffset);
    } else if (minuteOffset > 0) {
        return minuteOffset;
    } else {
        return eventData.period - Math.abs(minuteOffset);
    }
}

export function getEventTime(eventData: EventDefinition, currentDate: DateTime): DateTime {
    const minutesToEvent = getMinutesToEvent(eventData, currentDate);

    const daysOffset = Math.floor(minutesToEvent / (24 * 60));
    const hoursOffset = Math.floor(minutesToEvent / 60);
    const minutesOffset = minutesToEvent % 60;

    const eventTime = currentDate.plus({ minutes: minutesToEvent});

    return eventTime;
}