const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

export const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/** «1 250 сом.» */
export function formatMoney(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' сом.';
}

/** «Фирдавс Рахимов» → «ФР» */
export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('');
}

/** «13 окт, 09:05» — отметка времени для истории заявки. */
export function formatStamp(date: Date): string {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}, ${hh}:${mm}`;
}

/** Совпадает ли строка поиска хотя бы с одним из полей. */
export function matches(query: string, ...fields: (string | number)[]): boolean {
  const q = query.trim().toLowerCase();
  return !q || fields.join(' ').toLowerCase().includes(q);
}
