import { CarClass, City, Client, Driver, DriverStatus, HistoryEntry, Order, OrderStatus, Week } from './admin.models';

export const ADMIN_NAME = 'Нилуфар К. (админ)';

const CITY_SEED: readonly [string, string][] = [
  ['Душанбе', 'г. Душанбе'],
  ['Худжанд', 'Согдийская обл.'],
  ['Бохтар', 'Хатлонская обл.'],
  ['Куляб', 'Хатлонская обл.'],
  ['Истаравшан', 'Согдийская обл.'],
  ['Гиссар', 'РРП'],
  ['Турсунзаде', 'РРП'],
  ['Пенджикент', 'Согдийская обл.'],
  ['Вахдат', 'РРП'],
  ['Исфара', 'Согдийская обл.'],
];
const CITY_NAMES = CITY_SEED.map(([name]) => name);

const DRIVER_NAMES = [
  'Фирдавс Рахимов', 'Сухроб Назаров', 'Бахтиёр Каримов', 'Далер Шарипов',
  'Манучехр Саидов', 'Рустам Иброгимов', 'Шерзод Холов', 'Фаридун Юсупов',
];
const CARS: readonly [string, CarClass][] = [
  ['Skoda Octavia', 'Эконом'],
  ['Kia K5', 'Комфорт'],
  ['Hyundai Solaris', 'Эконом'],
  ['Toyota Camry', 'Комфорт'],
  ['Kia Rio', 'Эконом'],
  ['Skoda Superb', 'Комфорт'],
  ['Volkswagen Polo', 'Эконом'],
  ['Toyota Camry', 'Комфорт'],
];
const PLATES = [
  '0123 AB 01', '4567 AC 01', '7890 BA 02', '3210 AD 01',
  '6543 KA 03', '9870 MB 01', '2468 TC 02', '1357 AM 01',
];
const CLIENT_NAMES = [
  'Мадина Рахимова', 'Парвиз Азизов', 'Нигина Саидова', 'Комрон Шарипов', 'Зарина Каримова',
  'Исмоил Назаров', 'Шахноза Юсупова', 'Акмал Давлатов', 'Малика Иброгимова', 'Джамшед Холов',
];
const OPERATORS = ['90', '91', '92', '93', '98', '99', '55', '50', '88', '77'];

/** Пары индексов городов: Душанбе — Худжанд встречается чаще всего. */
const ORDER_ROUTES: readonly [number, number][] = [
  [0, 1], [1, 0], [0, 4], [0, 7], [1, 4], [0, 2], [0, 3], [1, 9], [0, 1], [3, 0],
];
const ORDER_STATUS_CYCLE: readonly OrderStatus[] = [
  'new', 'assigned', 'route', 'done', 'done', 'done', 'cancelled', 'done', 'assigned', 'new', 'done', 'route',
];
const DEPARTURES = ['06:30', '08:00', '09:30', '11:00', '13:30', '15:00', '17:30', '19:00'];

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function phone(i: number, a: number, b: number, c: number): string {
  return `+992 ${OPERATORS[i % OPERATORS.length]} ${a} ${pad2(b)} ${pad2(c)}`;
}

function driverStatus(i: number): DriverStatus {
  if (i === 5) return 'Выходной';
  return i === 7 || i === 2 ? 'В рейсе' : 'Свободен';
}

export interface AdminSeed {
  orders: Order[];
  drivers: Driver[];
  clients: Client[];
  cities: City[];
  schedule: Record<number, Week>;
}

/**
 * Детерминированные демо-данные для админки.
 * Заменить на запросы к API, когда появится бэкенд.
 */
export function createSeed(): AdminSeed {
  const drivers: Driver[] = DRIVER_NAMES.map((name, i) => ({
    id: i,
    name,
    car: CARS[i][0],
    cls: CARS[i][1],
    plate: PLATES[i],
    phone: phone(i, 200 + i * 37, 10 + i * 9, 20 + i * 5),
    markup: (i % 3) * 5,
    adult: 50,
    child: 30,
    bag: 20,
    routes: [
      { from: 'Душанбе', to: 'Худжанд', price: 300 + i * 10 },
      { from: 'Худжанд', to: 'Душанбе', price: 300 + i * 10 },
    ],
    rating: (4.6 + ((i * 3) % 5) / 10).toFixed(1),
    trips: 120 + i * 53,
    status: driverStatus(i),
  }));

  const clients: Client[] = CLIENT_NAMES.map((name, i) => ({
    name,
    phone: phone(i + 3, 300 + i * 41, 11 + i * 7, 30 + i * 4),
    trips: 1 + ((i * 7) % 12),
    spent: ((320 + i * 410) % 4800) + 450,
    last: `${1 + i * 2} окт`,
  }));

  const orders: Order[] = [];
  for (let i = 0; i < 24; i++) {
    const [fromIdx, toIdx] = ORDER_ROUTES[i % ORDER_ROUTES.length];
    const client = clients[i % clients.length];
    const cls: CarClass = i % 3 === 1 ? 'Комфорт' : 'Эконом';
    const status = ORDER_STATUS_CYCLE[i % ORDER_STATUS_CYCLE.length];
    const day = i < 6 ? 12 + (i % 3) : Math.max(3, 11 - (i % 9));
    const sameClass = drivers.filter((d) => d.cls === cls);
    const driverId = status === 'new' ? null : sameClass[(i % 4) % sameClass.length].id;
    const driverName = driverId === null ? '' : drivers[driverId].name;
    const time = DEPARTURES[i % DEPARTURES.length];

    const history: HistoryEntry[] = [
      {
        text: 'Заявка создана',
        who: `${client.name} (сайт)`,
        when: `${day - 2} окт, ${10 + (i % 9)}:${10 + ((i * 7) % 50)}`,
      },
    ];
    if (status !== 'new') {
      history.push({
        text: `Назначен водитель: ${driverName}`,
        who: ADMIN_NAME,
        when: `${day - 2} окт, ${11 + (i % 9)}:${10 + ((i * 3) % 50)}`,
      });
    }
    if (status === 'route' || status === 'done') {
      history.push({ text: 'Статус: В пути', who: driverName, when: `${day} окт, ${time}` });
    }
    if (status === 'done') {
      const arrival = `${pad2(parseInt(time, 10) + 4)}${time.slice(2)}`;
      history.push({ text: 'Статус: Завершена', who: driverName, when: `${day} окт, ${arrival}` });
    }
    if (status === 'cancelled') {
      history.push({ text: 'Статус: Отменена', who: `${client.name} (сайт)`, when: `${day - 1} окт, 20:05` });
    }

    orders.push({
      id: 1048 - i,
      from: CITY_NAMES[fromIdx],
      to: CITY_NAMES[toIdx],
      day,
      time,
      client: client.name,
      phone: client.phone,
      cls,
      pax: 1 + (i % 3),
      price: Math.round((250 + toIdx * 15 + i * 3 + (cls === 'Комфорт' ? 120 : 0)) / 10) * 10,
      status,
      driverId,
      addrFrom: `пр. Рудаки, ${3 + i}`,
      addrTo: `ул. Айни, ${10 + i * 2}`,
      history,
    });
  }

  const cities: City[] = CITY_SEED.map(([name, region], i) => ({ id: i, name, region, active: i < 8 }));

  const schedule: Record<number, Week> = {};
  for (const d of drivers) {
    schedule[d.id] = [0, 1, 2, 3, 4, 5, 6].map((k) => {
      const v = (d.id + k) % 7;
      return v === 5 ? 'off' : v === 6 && d.id % 3 === 0 ? 'vacation' : 'trip';
    });
  }

  return { orders, drivers, clients, cities, schedule };
}
