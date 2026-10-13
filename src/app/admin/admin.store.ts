import { Injectable, computed, signal } from '@angular/core';
import { ADMIN_NAME, createSeed } from './admin.data';
import { formatStamp } from './admin.format';
import { CityDraft, Driver, DriverDraft, Order, OrderStatus, SHIFTS } from './admin.models';

export type StatusFilter = OrderStatus | 'all';

/** Данные админки. Пока бэкенда нет — живут в памяти вкладки. */
@Injectable({ providedIn: 'root' })
export class AdminStore {
  private readonly seed = createSeed();

  readonly orders = signal(this.seed.orders);
  readonly drivers = signal(this.seed.drivers);
  readonly clients = signal(this.seed.clients);
  readonly cities = signal(this.seed.cities);
  readonly schedule = signal(this.seed.schedule);

  readonly statusCounts = computed(() => {
    const counts: Record<StatusFilter, number> = {
      all: 0, new: 0, assigned: 0, route: 0, done: 0, cancelled: 0,
    };
    for (const o of this.orders()) {
      counts.all++;
      counts[o.status]++;
    }
    return counts;
  });

  /** Часы для отметок в истории; подменяется в тестах. */
  now: () => Date = () => new Date();

  order(id: number): Order | undefined {
    return this.orders().find((o) => o.id === id);
  }

  driver(id: number | null): Driver | undefined {
    return id === null ? undefined : this.drivers().find((d) => d.id === id);
  }

  /** Кого предложить на новую заявку: свободного водителя нужного класса. */
  suggestedDriver(order: Order): Driver {
    const drivers = this.drivers();
    return drivers.find((d) => d.status === 'Свободен' && d.cls === order.cls) ?? drivers[0];
  }

  assignDriver(orderId: number, driverId: number): void {
    const order = this.order(orderId);
    const next = this.driver(driverId);
    if (!order || !next || order.driverId === driverId) return;
    const prev = this.driver(order.driverId);
    const text = prev
      ? `Смена водителя: ${prev.name} → ${next.name}`
      : `Назначен водитель: ${next.name}`;
    const status = order.status === 'new' ? 'assigned' : order.status;
    this.patchOrder(orderId, { driverId, status }, text);
  }

  unassignDriver(orderId: number): void {
    this.patchOrder(orderId, { driverId: null, status: 'new' }, 'Водитель снят, статус: Новая');
  }

  startTrip(orderId: number): void {
    this.patchOrder(orderId, { status: 'route' }, 'Статус: В пути');
  }

  finishTrip(orderId: number): void {
    this.patchOrder(orderId, { status: 'done' }, 'Статус: Завершена');
  }

  cancelOrder(orderId: number): void {
    this.patchOrder(orderId, { status: 'cancelled' }, 'Статус: Отменена');
  }

  reopenOrder(orderId: number): void {
    this.patchOrder(orderId, { driverId: null, status: 'new' }, 'Статус: Новая (возврат)');
  }

  /** Рейс → выходной → отпуск → рейс. */
  cycleShift(driverId: number, day: number): void {
    this.schedule.update((s) => ({
      ...s,
      [driverId]: s[driverId].map((shift, i) => (i === day ? SHIFTS[shift].next : shift)),
    }));
  }

  toggleCity(cityId: number): void {
    this.cities.update((list) => list.map((c) => (c.id === cityId ? { ...c, active: !c.active } : c)));
  }

  /** id = null — новый город. */
  saveCity(id: number | null, draft: CityDraft): void {
    const city = { ...draft, name: draft.name.trim(), region: draft.region.trim() };
    this.cities.update((list) =>
      id === null
        ? [...list, { id: nextId(list), ...city }]
        : list.map((c) => (c.id === id ? { ...c, ...city } : c)),
    );
  }

  /** id = null — новый водитель; ему ставится свободная неделя без рейсов. */
  saveDriver(id: number | null, draft: DriverDraft): void {
    const data: DriverDraft = {
      ...draft,
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      car: draft.car.trim(),
      plate: draft.plate.trim(),
      routes: draft.routes.map((r) => ({ ...r })),
    };
    if (id !== null) {
      this.drivers.update((list) => list.map((d) => (d.id === id ? { ...d, ...data } : d)));
      return;
    }
    const newId = nextId(this.drivers());
    this.drivers.update((list) => [
      ...list,
      { id: newId, ...data, status: 'Свободен', rating: '5.0', trips: 0 },
    ]);
    this.schedule.update((s) => ({ ...s, [newId]: Array(7).fill('off') }));
  }

  private patchOrder(id: number, patch: Partial<Pick<Order, 'status' | 'driverId'>>, text: string): void {
    const entry = { text, who: ADMIN_NAME, when: formatStamp(this.now()) };
    this.orders.update((list) =>
      list.map((o) => (o.id === id ? { ...o, ...patch, history: [...o.history, entry] } : o)),
    );
  }
}

function nextId(list: readonly { id: number }[]): number {
  return list.reduce((max, x) => Math.max(max, x.id), -1) + 1;
}
