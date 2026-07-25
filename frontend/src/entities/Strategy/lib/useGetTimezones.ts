import { getAllTimezones } from 'countries-and-timezones';

export const useTimezoneOptions = () => {
  const timezones = getAllTimezones();
  const timezoneOptions = Object.values(timezones).map((tz) => ({
    value: tz.name,
    label: tz.name,
  }));
  return timezoneOptions;
};