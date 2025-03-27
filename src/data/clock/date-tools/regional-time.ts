import { DateTime, DateTimeFormatOptions, LocaleOptions } from "luxon";

const TIME_PATTERN = 'i:HH:mm:ss';

export function getTimeTokens(formattedTime: string) {
    const [day, hour, minute, second] = formattedTime.split(':');

    return {
        day: parseInt(day),
        hour: parseInt(hour),
        minute: parseInt(minute),
        second: parseInt(second)
    };
}

export function getFormattedSkyTime(date: DateTime, FormatStr: string) {
    const newDate = date.setZone("America/Los_Angeles");
    return newDate.toFormat(FormatStr);
}

export function getSkyTime(date: DateTime) {
    const newDate = date.setZone("America/Los_Angeles");
    return getTimeTokens(newDate.toFormat(TIME_PATTERN));
}