export const HISTORY_PAGE_SIZE = 10;

export function parseHistoryPage(value) {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return 1;
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export function historySearch(page) {
  return page > 1 ? `?page=${page}` : '';
}
