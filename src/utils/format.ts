export function formatCurrency(priceCents: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(priceCents / 100);
}

export function formatTimeRange(startTime: string, durationMinutes: number): string {
  const [hour, minute] = startTime.split(':').map(Number);
  const endMinuteTotal = hour * 60 + minute + durationMinutes;
  const endHour = Math.floor(endMinuteTotal / 60);
  const endMinute = endMinuteTotal % 60;
  return `${startTime} – ${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
}
