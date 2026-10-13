import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { formatMoney, initials } from '../admin/admin.format';
import { ORDER_STATUSES, Order } from '../admin/admin.models';
import { AdminStore } from '../admin/admin.store';
import { PageHeader } from '../layout/page-header';

interface Action {
  label: string;
  primary: boolean;
  run: () => void;
}

@Component({
  selector: 'app-order-detail-page',
  imports: [PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page' },
  template: `
    <app-page-header [heading]="heading()" backLink="/orders" />
    <div class="page-body">
      <div class="page-content">
        @if (order(); as o) {
          <div class="meta">
            <span class="pill status" [style.background]="statusColor()">{{ statusLabel() }}</span>
            <span class="muted">{{ o.day }} окт, отправление {{ o.time }}</span>
          </div>

          <div class="columns">
            <div class="stack">
              <section class="panel" aria-labelledby="route-title">
                <h2 id="route-title" class="panel-label">Маршрут</h2>
                <p class="route">{{ o.from }} → {{ o.to }}</p>
                <dl class="kv"><dt>Подача</dt><dd>{{ o.from }}, {{ o.addrFrom }}</dd></dl>
                <dl class="kv"><dt>Назначение</dt><dd>{{ o.to }}, {{ o.addrTo }}</dd></dl>
              </section>

              <section class="panel" aria-labelledby="client-title">
                <h2 id="client-title" class="panel-label">Клиент и оплата</h2>
                <dl class="kv"><dt>ФИО</dt><dd class="strong">{{ o.client }}</dd></dl>
                <dl class="kv"><dt>Телефон</dt><dd>{{ o.phone }}</dd></dl>
                <dl class="kv"><dt>Пассажиров</dt><dd>{{ o.pax }} чел.</dd></dl>
                <dl class="kv"><dt>Сумма</dt><dd class="strong price">{{ price() }}</dd></dl>
              </section>

              <section class="panel" aria-labelledby="car-title">
                <div class="panel-head">
                  <h2 id="car-title" class="panel-label">Машина и водитель</h2>
                  <button
                    type="button"
                    class="btn-sm"
                    [class.accent]="!pickerOpen()"
                    [attr.aria-expanded]="pickerOpen()"
                    aria-controls="car-picker"
                    (click)="pickerOpen.set(!pickerOpen())"
                  >
                    {{ pickerOpen() ? 'Закрыть' : o.driverId !== null ? 'Сменить водителя' : 'Выбрать машину' }}
                  </button>
                </div>
                <div class="person">
                  <span class="avatar big" aria-hidden="true">{{ driverInitials() }}</span>
                  <div>
                    <div class="driver-name">{{ driver()?.name ?? 'Не назначен' }}</div>
                    <div class="muted">{{ carLine() }}</div>
                  </div>
                </div>
                @if (pickerOpen()) {
                  <div id="car-picker" class="picker">
                    <div class="divider"></div>
                    <h3 class="muted picker-title">Машины на {{ o.day }} окт</h3>
                    <ul class="cars">
                      @for (c of pickCars(); track c.id) {
                        <li>
                          <button
                            type="button"
                            class="car"
                            [class.current]="c.current"
                            [disabled]="c.disabled"
                            [attr.aria-current]="c.current ? 'true' : null"
                            (click)="pick(c.id)"
                          >
                            <span class="car-time">{{ o.time }}</span>
                            <span class="car-main">
                              <span class="car-model">
                                {{ c.model }}
                                <span class="pill tariff" [class.comfort]="c.comfort">{{ c.cls }}</span>
                              </span>
                              <span class="sub">{{ c.driver }} · {{ c.plate }}</span>
                            </span>
                            <span class="car-note">{{ c.note }}</span>
                          </button>
                        </li>
                      }
                    </ul>
                  </div>
                }
              </section>
            </div>

            <div class="stack">
              <section class="panel" aria-labelledby="actions-title">
                <h2 id="actions-title" class="panel-label">Действия</h2>
                @for (a of actions(); track a.label) {
                  <button type="button" class="btn" [class.btn-dark]="a.primary" (click)="a.run()">{{ a.label }}</button>
                }
              </section>

              <section class="panel" aria-labelledby="history-title">
                <h2 id="history-title" class="panel-label">История изменений</h2>
                <ol class="history">
                  @for (h of history(); track $index; let first = $first) {
                    <li [class.latest]="first">
                      <div class="h-text">{{ h.text }}</div>
                      <div class="sub">{{ h.who }} · {{ h.when }}</div>
                    </li>
                  }
                </ol>
              </section>
            </div>
          </div>
        } @else {
          <p class="card empty">Такой заявки нет. Возможно, ссылка устарела.</p>
        }
      </div>
    </div>
  `,
  styleUrl: './order-detail-page.css',
})
export class OrderDetailPage {
  private readonly store = inject(AdminStore);

  /** Параметр маршрута orders/:id. */
  readonly id = input.required<string>();

  protected readonly pickerOpen = signal(false);

  protected readonly order = computed(() => this.store.order(Number(this.id())));
  protected readonly driver = computed(() => this.store.driver(this.order()?.driverId ?? null));

  protected readonly heading = computed(() => {
    const o = this.order();
    return o ? `Заявка №${o.id}` : 'Заявка не найдена';
  });

  protected readonly statusLabel = computed(() => this.status()?.label ?? '');
  protected readonly statusColor = computed(() => this.status()?.color ?? '');
  protected readonly price = computed(() => formatMoney(this.order()?.price ?? 0));
  protected readonly driverInitials = computed(() => {
    const d = this.driver();
    return d ? initials(d.name) : '?';
  });
  protected readonly carLine = computed(() => {
    const d = this.driver();
    return d ? `${d.car} · ${d.cls} · ${d.plate}` : 'Машина не выбрана';
  });

  /** Новые события сверху. */
  protected readonly history = computed(() => [...(this.order()?.history ?? [])].reverse());

  protected readonly actions = computed<Action[]>(() => {
    const o = this.order();
    return o ? this.actionsFor(o) : [];
  });

  protected readonly pickCars = computed(() => {
    const o = this.order();
    if (!o) return [];
    return this.store.drivers().map((d) => {
      const current = d.id === o.driverId;
      const off = d.status === 'Выходной';
      return {
        id: d.id,
        model: d.car,
        cls: d.cls,
        comfort: d.cls === 'Комфорт',
        driver: d.name,
        plate: d.plate,
        current,
        disabled: off || current,
        note: current ? 'Текущий' : d.status,
      };
    });
  });

  private readonly status = computed(() => {
    const o = this.order();
    return o ? ORDER_STATUSES[o.status] : null;
  });

  protected pick(driverId: number): void {
    const o = this.order();
    if (!o) return;
    this.store.assignDriver(o.id, driverId);
    this.pickerOpen.set(false);
  }

  private actionsFor(o: Order): Action[] {
    const s = this.store;
    const id = o.id;
    const run = (fn: () => void) => () => {
      fn();
      this.pickerOpen.set(false);
    };
    switch (o.status) {
      case 'new': {
        const free = s.suggestedDriver(o);
        return [
          { label: `Назначить: ${free.name}`, primary: true, run: run(() => s.assignDriver(id, free.id)) },
          { label: 'Отменить заявку', primary: false, run: run(() => s.cancelOrder(id)) },
        ];
      }
      case 'assigned':
        return [
          { label: 'Начать рейс', primary: true, run: run(() => s.startTrip(id)) },
          { label: 'Снять водителя', primary: false, run: run(() => s.unassignDriver(id)) },
          { label: 'Отменить заявку', primary: false, run: run(() => s.cancelOrder(id)) },
        ];
      case 'route':
        return [{ label: 'Завершить рейс', primary: true, run: run(() => s.finishTrip(id)) }];
      default:
        return [{ label: 'Вернуть в новые', primary: false, run: run(() => s.reopenOrder(id)) }];
    }
  }
}
