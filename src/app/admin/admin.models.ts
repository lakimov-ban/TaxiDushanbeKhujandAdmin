export type OrderStatus = 'new' | 'assigned' | 'route' | 'done' | 'cancelled';
export type CarClass = 'Эконом' | 'Комфорт';
export type DriverStatus = 'Свободен' | 'В рейсе' | 'Выходной';
export type Shift = 'trip' | 'off' | 'vacation';

export const CAR_CLASSES: readonly CarClass[] = ['Эконом', 'Комфорт'];

export const ORDER_STATUSES: Record<OrderStatus, { label: string; color: string }> = {
  new: { label: 'Новая', color: '#F2B705' },
  assigned: { label: 'Назначена', color: '#E9E3D3' },
  route: { label: 'В пути', color: '#C9D8F0' },
  done: { label: 'Завершена', color: '#D5E6C3' },
  cancelled: { label: 'Отменена', color: '#F0CFC6' },
};

export const DRIVER_STATUS_COLORS: Record<DriverStatus, string> = {
  Свободен: '#D5E6C3',
  'В рейсе': '#C9D8F0',
  Выходной: '#E9E3D3',
};

export const SHIFTS: Record<Shift, { label: string; color: string; next: Shift }> = {
  trip: { label: 'Рейс', color: '#F2B705', next: 'off' },
  off: { label: 'Выходной', color: '#F0EBDD', next: 'vacation' },
  vacation: { label: 'Отпуск', color: '#C9D8F0', next: 'trip' },
};

export interface HistoryEntry {
  text: string;
  who: string;
  when: string;
}

export interface Order {
  id: number;
  from: string;
  to: string;
  /** День месяца отправления (демо-данные — октябрь). */
  day: number;
  time: string;
  client: string;
  phone: string;
  cls: CarClass;
  pax: number;
  price: number;
  status: OrderStatus;
  driverId: number | null;
  addrFrom: string;
  addrTo: string;
  history: HistoryEntry[];
}

export interface DriverRoute {
  from: string;
  to: string;
  price: number | null;
}

/** То, что администратор редактирует в карточке водителя. */
export interface DriverDraft {
  name: string;
  phone: string;
  car: string;
  plate: string;
  cls: CarClass;
  /** Наценка водителя, %. */
  markup: number | null;
  adult: number | null;
  child: number | null;
  bag: number | null;
  routes: DriverRoute[];
}

export interface Driver extends DriverDraft {
  id: number;
  status: DriverStatus;
  rating: string;
  trips: number;
}

export interface CityDraft {
  name: string;
  region: string;
  active: boolean;
}

export interface City extends CityDraft {
  id: number;
}

export interface Client {
  name: string;
  phone: string;
  trips: number;
  spent: number;
  last: string;
}

/** Неделя водителя: смена на каждый день с понедельника. */
export type Week = Shift[];
