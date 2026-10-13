import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatMoney, matches } from '../admin/admin.format';
import { ORDER_STATUSES } from '../admin/admin.models';
import { AdminStore, StatusFilter } from '../admin/admin.store';
import { PageHeader } from '../layout/page-header';

const FILTERS: readonly { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'new', label: 'Новые' },
  { key: 'assigned', label: 'Назначены' },
  { key: 'route', label: 'В пути' },
  { key: 'done', label: 'Завершены' },
  { key: 'cancelled', label: 'Отменены' },
];

@Component({
  selector: 'app-orders-page',
  imports: [PageHeader, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page' },
  template: `
    <app-page-header heading="Заявки" searchable [(query)]="query" />
    <div class="page-body">
      <div class="page-content">
        <div class="chips" role="group" aria-label="Фильтр по статусу">
          @for (f of filters; track f.key) {
            <button
              type="button"
              class="chip"
              [attr.aria-pressed]="filter() === f.key"
              (click)="filter.set(f.key)"
            >
              {{ f.label }} {{ store.statusCounts()[f.key] }}
            </button>
          }
        </div>

        <div class="row head" aria-hidden="true">
          <div>№ / Дата</div><div>Маршрут</div><div>Клиент</div><div>Машина / Водитель</div><div>Сумма</div><div>Статус</div>
        </div>
        <ul class="list">
          @for (o of rows(); track o.id) {
            <li>
              <a class="row card" [routerLink]="['/orders', o.id]">
                <div><div class="strong">№{{ o.id }}</div><div class="sub">{{ o.date }}</div></div>
                <div class="route">{{ o.route }}</div>
                <div><div class="name">{{ o.client }}</div><div class="sub">{{ o.phone }}</div></div>
                <div><div class="name">{{ o.car }}</div><div class="sub">{{ o.driver }}</div></div>
                <div><div class="strong">{{ o.price }}</div><div class="sub">{{ o.cls }}</div></div>
                <div><span class="pill" [style.background]="o.statusColor">{{ o.status }}</span></div>
              </a>
            </li>
          } @empty {
            <li class="card empty">Заявок не найдено</li>
          }
        </ul>
      </div>
    </div>
  `,
  styles: `
    .list { display: flex; flex-direction: column; gap: 8px; margin: 0; padding: 0; list-style: none; }
    .row {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px 16px;
      align-items: center; padding: 16px 24px; font-size: 15px; text-decoration: none;
    }
    a.row:hover { box-shadow: 0 0 0 3px var(--accent); }
    .head { display: none; }
    .route, .name { font-weight: 600; text-wrap: pretty; }

    @media (min-width: 1180px) {
      .row { grid-template-columns: 90px 1.7fr 1.3fr 1.4fr 100px 120px; }
      .head {
        display: grid; padding-block: 0; font-size: 12px; font-weight: 600; color: var(--muted);
        text-transform: uppercase; letter-spacing: 0.04em;
      }
    }
  `,
})
export class OrdersPage {
  protected readonly store = inject(AdminStore);

  protected readonly filters = FILTERS;
  protected readonly filter = signal<StatusFilter>('all');
  protected readonly query = signal('');

  protected readonly rows = computed(() => {
    const filter = this.filter();
    const query = this.query();
    return this.store
      .orders()
      .filter((o) => filter === 'all' || o.status === filter)
      .map((o) => {
        const d = this.store.driver(o.driverId);
        return {
          id: o.id,
          route: `${o.from} → ${o.to}`,
          date: `${o.day} окт, ${o.time}`,
          client: o.client,
          phone: o.phone,
          car: d?.car ?? 'Не назначена',
          driver: d?.name ?? 'Водитель не назначен',
          driverName: d?.name ?? '',
          cls: o.cls,
          price: formatMoney(o.price),
          status: ORDER_STATUSES[o.status].label,
          statusColor: ORDER_STATUSES[o.status].color,
        };
      })
      .filter((r) => matches(query, r.id, r.route, r.client, r.phone, r.driverName));
  });
}
