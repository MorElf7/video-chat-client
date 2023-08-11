import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
dayjs.extend(updateLocale);
dayjs.extend(calendar);
dayjs.extend(relativeTime);
dayjs.updateLocale("en", {
	relativeTime: {
		future: "in %s",
		past: "%s ago",
		s: "%ds",
		m: "1m",
		mm: "%dm",
		h: "1h",
		hh: "%dh",
		d: "1d",
		dd: "%dd",
		M: "1m",
		MM: "%dm",
		y: "1y",
		yy: "%dy",
	},
});

export function timeFromNow(date: Date) {
	return dayjs(date).fromNow(true);
}

export function calendarTime(date: Date) {
	return dayjs().calendar(date);
}
