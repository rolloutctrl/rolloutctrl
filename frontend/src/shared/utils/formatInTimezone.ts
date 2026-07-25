import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatInTimezone = (
  date: string | Date,
  timezone: string,
) => {
  return dayjs.utc(date).tz(timezone).format('DD MMM YYYY HH:mm');
};

export const getCurrentTimeInTimezone = (
  timezone: string,
) => {
  return dayjs().tz(timezone).format('DD MMM YYYY HH:mm');
};