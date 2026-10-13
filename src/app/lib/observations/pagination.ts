export const EVENTS_PER_PAGE = 8;
export function eventPage(items: { id: string }[], id: string) {
  return Math.max(0, Math.floor(items.findIndex(item => item.id === id) / EVENTS_PER_PAGE));
}
