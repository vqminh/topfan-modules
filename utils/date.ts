import { Timestamp } from "firebase/firestore";

export function convertTZ(date: Date | string, tzString: string) {
  return new Date(
    (typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {
      timeZone: tzString,
    })
  );
}

export function getWeekOfYear(date: Date) {
  const oneJan = new Date(date.getFullYear(), 0, 1);
  const numberOfDays = Math.floor(
    (date.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000)
  );
  return Math.ceil((date.getDay() + 1 + numberOfDays) / 7);
}

export function formatTimestamp(ts: Timestamp) {
  return ts?.toDate?.()?.toDateString() || "";
}
