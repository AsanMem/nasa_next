/** NASA timestamps without a zone are UTC, never browser-local time. */
export function sourceTime(value?: string | null): number | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}(?:$|[T ])/.test(value)) return null;
  const day = value.slice(0,10), midnight = Date.parse(day+'T00:00:00Z');
  if (!Number.isFinite(midnight) || new Date(midnight).toISOString().slice(0,10) !== day) return null;
  const normalized = value.length === 10 ? value+'T00:00:00Z' : value.replace(' ','T');
  const time = Date.parse(/(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized) ? normalized : normalized+'Z');
  return Number.isFinite(time) ? time : null;
}
export function observationDate(value?: string | null) {
  const time = sourceTime(value);
  if (time === null) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', ...(value?.length === 10 ? {} : { timeStyle: 'short' as const }), timeZone: 'UTC' }).format(time) + ' UTC';
}
