import dayjs from "../dayjs";

export default function isPaused(pausedUntil: string | null): boolean {
  if (!pausedUntil) return false;
  const paused = dayjs(pausedUntil);

  return paused.isAfter(dayjs());
}
