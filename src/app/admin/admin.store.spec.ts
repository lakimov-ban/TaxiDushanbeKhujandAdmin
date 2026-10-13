import { TestBed } from '@angular/core/testing';
import { AdminStore } from './admin.store';

describe('AdminStore', () => {
  let store: AdminStore;

  beforeEach(() => {
    store = TestBed.inject(AdminStore);
    store.now = () => new Date(2026, 9, 13, 9, 5);
  });

  const firstWith = (status: string) => store.orders().find((o) => o.status === status)!;

  it('assigns a driver to a new order and records it in history', () => {
    const order = firstWith('new');
    const driver = store.suggestedDriver(order);
    expect(driver.cls).toBe(order.cls);

    store.assignDriver(order.id, driver.id);

    const updated = store.order(order.id)!;
    expect(updated.status).toBe('assigned');
    expect(updated.driverId).toBe(driver.id);
    expect(updated.history.at(-1)).toEqual({
      text: `Назначен водитель: ${driver.name}`,
      who: 'Нилуфар К. (админ)',
      when: '13 окт, 09:05',
    });
  });

  it('describes a driver change and keeps the status', () => {
    const order = firstWith('route');
    const prev = store.driver(order.driverId)!;
    const next = store.drivers().find((d) => d.id !== prev.id)!;

    store.assignDriver(order.id, next.id);

    const updated = store.order(order.id)!;
    expect(updated.status).toBe('route');
    expect(updated.history.at(-1)!.text).toBe(`Смена водителя: ${prev.name} → ${next.name}`);
  });

  it('walks an order through its lifecycle', () => {
    const { id } = firstWith('assigned');
    store.startTrip(id);
    expect(store.order(id)!.status).toBe('route');
    store.finishTrip(id);
    expect(store.order(id)!.status).toBe('done');
    store.reopenOrder(id);
    expect(store.order(id)!.status).toBe('new');
    expect(store.order(id)!.driverId).toBeNull();
  });

  it('keeps status counts in sync', () => {
    const before = store.statusCounts();
    store.cancelOrder(firstWith('new').id);
    const after = store.statusCounts();
    expect(after.new).toBe(before.new - 1);
    expect(after.cancelled).toBe(before.cancelled + 1);
    expect(after.all).toBe(before.all);
  });

  it('cycles a shift trip → off → vacation → trip', () => {
    const driverId = store.drivers()[0].id;
    const day = store.schedule()[driverId].indexOf('trip');
    store.cycleShift(driverId, day);
    expect(store.schedule()[driverId][day]).toBe('off');
    store.cycleShift(driverId, day);
    expect(store.schedule()[driverId][day]).toBe('vacation');
    store.cycleShift(driverId, day);
    expect(store.schedule()[driverId][day]).toBe('trip');
  });

  it('adds a new driver with an empty week', () => {
    const count = store.drivers().length;
    store.saveDriver(null, {
      name: '  Азиз Каримов ', phone: '', car: 'Kia K5', plate: '1111 AA 01', cls: 'Комфорт',
      markup: 0, adult: 50, child: 30, bag: 20, routes: [],
    });
    const added = store.drivers().at(-1)!;
    expect(store.drivers().length).toBe(count + 1);
    expect(added.name).toBe('Азиз Каримов');
    expect(added.status).toBe('Свободен');
    expect(store.schedule()[added.id].every((s) => s === 'off')).toBe(true);
  });

  it('adds and edits cities', () => {
    store.saveCity(null, { name: 'Канибадам', region: 'Согдийская обл.', active: true });
    const city = store.cities().at(-1)!;
    expect(city.name).toBe('Канибадам');

    store.saveCity(city.id, { name: 'Канибадам', region: 'Согд', active: false });
    store.toggleCity(city.id);
    expect(store.cities().find((c) => c.id === city.id)).toEqual({ ...city, region: 'Согд', active: true });
  });
});
