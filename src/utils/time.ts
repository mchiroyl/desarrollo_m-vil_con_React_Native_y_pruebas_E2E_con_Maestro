function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function timeRangesOverlap(
  firstStartTime: string,
  firstDurationMinutes: number,
  secondStartTime: string,
  secondDurationMinutes: number,
): boolean {
  const firstStart = timeToMinutes(firstStartTime);
  const secondStart = timeToMinutes(secondStartTime);
  return (
    firstStart < secondStart + secondDurationMinutes &&
    secondStart < firstStart + firstDurationMinutes
  );
}
