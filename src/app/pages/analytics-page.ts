import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { formatMoney, WEEKDAYS } from '../admin/admin.format';
import { ORDER_STATUSES, OrderStatus } from '../admin/admin.models';
import { AdminStore } from '../admin/admin.store';
import { PageHeader } from '../layout/page-header';

const PERIODS = [7, 14, 30] as const;
type Period = (typeof PERIODS)[number];

/** Демо-данные считаны за неделю; при выборе периода масштабируем их. */
const SEED_DAYS = 6;

@Component({
  selector: 'app-analytics-page',
  imports: [PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page' },
  template: `
    <app-page-header heading="Аналитика" />
    <div class="page-body">
      <div class="page-content">
        <ul class="kpis">
          @for (k of kpis(); track k.label) {
            <li class="card kpi">
              <span class="muted">{{ k.label }}</span>
              <strong class="kpi-value">{{ k.value }}</strong>
              <span class="kpi-delta" [style.color]="k.color">{{ k.delta }}</span>
            </li>
          }
        </ul>

        <section class="panel" aria-labelledby="chart-title">
          <div class="chart-head">
            <h2 id="chart-title" class="panel-title">Заявки по дням</h2>
            <div class="chips" role="group" aria-label="Период">
              @for (p of periods; track p) {
                <button
                  type="button"
                  class="chip soft accent"
                  [attr.aria-pressed]="period() === p"
                  (click)="period.set(p)"
                >
                  {{ p }} дней
                </button>
              }
            </div>
          </div>
          <ol class="bars">
            @for (b of bars(); track $index) {
              <li class="bar-col" [attr.aria-label]="b.label + ': ' + b.value">
                <span class="bar-value" aria-hidden="true">{{ b.value }}</span>
                <span class="bar" [style.height.px]="b.height"></span>
                <span class="bar-label" aria-hidden="true">{{ b.label }}</span>
              </li>
            }
          </ol>
        </section>

        <div class="grid-2">
          <section class="panel" aria-labelledby="routes-title">
            <h2 id="routes-title" class="panel-title">Популярные маршруты</h2>
            <ul class="plain">
              @for (r of topRoutes(); track r.name) {
                <li class="route">
                  <div class="kv">
                    <span class="strong">{{ r.name }}</span><span class="muted nowrap">{{ r.count }}</span>
                  </div>
                  <div class="track"><div class="fill" [style.width.%]="r.width"></div></div>
                </li>
              }
            </ul>
          </section>
          <section class="panel" aria-labelledby="status-title">
            <h2 id="status-title" class="panel-title">Статусы заявок</h2>
            <ul class="plain">
              @for (s of statusStats(); track s.label) {
                <li class="kv status">
                  <span class="pill" [style.background]="s.color">{{ s.label }}</span>
                  <span class="strong">{{ s.count }}</span>
                </li>
              }
            </ul>
            <div class="divider"></div>
            <dl class="kv">
              <dt>Эконом / Комфорт</dt>
              <dd class="strong">{{ classSplit() }}</dd>
            </dl>
          </section>
        </div>
      </div>
    </div>
  `,
  styles: `
    .kpis {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px;
      margin: 0; padding: 0; list-style: none;
    }
    .kpi { display: flex; flex-direction: column; gap: 6px; padding: 20px; font-size: 14px; }
    .kpi-value { font-size: 30px; letter-spacing: -0.03em; }
    .kpi-delta { font-size: 13px; font-weight: 600; }
    .chart-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
    .chip { padding: 6px 14px; }
    .bars { display: flex; align-items: flex-end; gap: 6px; height: 200px; margin: 0; padding: 0; list-style: none; }
    .bar-col {
      flex: 1; min-width: 0; height: 100%; display: flex; flex-direction: column;
      align-items: center; justify-content: flex-end; gap: 6px; font-size: 11px; color: var(--muted);
    }
    .bar { width: 100%; border-radius: 6px 6px 0 0; background: var(--accent); }
    .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; }
    .plain { display: flex; flex-direction: column; gap: 12px; margin: 0; padding: 0; list-style: none; }
    .route { display: flex; flex-direction: column; gap: 4px; }
    .status { align-items: center; }
    .nowrap { white-space: nowrap; }
    .track { height: 6px; border-radius: 3px; background: var(--paper); }
    .fill { height: 6px; border-radius: 3px; background: var(--ink); }
  `,
})
export class AnalyticsPage {
  private readonly store = inject(AdminStore);

  protected readonly periods = PERIODS;
  protected readonly period = signal<Period>(14);

  private readonly scale = computed(() => this.period() / SEED_DAYS);

  protected readonly kpis = computed(() => {
    const orders = this.store.orders();
    const done = orders.filter((o) => o.status === 'done');
    const revenue = done.reduce((sum, o) => sum + o.price, 0);
    const avg = done.length ? Math.round(revenue / done.length / 10) * 10 : 0;
    const cancelled = this.store.statusCounts().cancelled;
    return [
      { label: 'Заявок за период', value: String(Math.floor(orders.length * this.scale())), delta: '+12% к прошлому', color: '#3E7A1F' },
      { label: 'Выручка', value: formatMoney(Math.floor(revenue * this.scale())), delta: '+8% к прошлому', color: '#3E7A1F' },
      { label: 'Средний чек', value: formatMoney(avg), delta: '−2% к прошлому', color: '#B3341B' },
      { label: 'Отмены', value: `${orders.length ? Math.round((cancelled / orders.length) * 100) : 0}%`, delta: 'без изменений', color: '#7A5E00' },
    ];
  });

  protected readonly bars = computed(() => {
    const p = this.period();
    const count = p === 30 ? 15 : p;
    const values = Array.from({ length: count }, (_, i) => 14 + ((i * 7 + 3) % 9) * 4 + (i % 7 >= 4 ? 14 : 0));
    const max = Math.max(...values);
    return values.map((value, i) => ({
      value,
      height: Math.round((value / max) * 150),
      label: p === 30 ? String(i * 2 + 1) : WEEKDAYS[i % 7],
    }));
  });

  protected readonly topRoutes = computed(() => {
    const counts = new Map<string, number>();
    for (const o of this.store.orders()) {
      const key = `${o.from} — ${o.to}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const factor = Math.max(1, Math.floor(this.scale())) * 3;
    return top.map(([name, n]) => ({
      name,
      count: `${n * factor} заявок`,
      width: Math.round((n / top[0][1]) * 100),
    }));
  });

  protected readonly statusStats = computed(() => {
    const counts = this.store.statusCounts();
    return (Object.keys(ORDER_STATUSES) as OrderStatus[]).map((k) => ({
      label: ORDER_STATUSES[k].label,
      color: ORDER_STATUSES[k].color,
      count: counts[k],
    }));
  });

  protected readonly classSplit = computed(() => {
    const orders = this.store.orders();
    if (!orders.length) return '—';
    const economy = Math.round((orders.filter((o) => o.cls === 'Эконом').length / orders.length) * 100);
    return `${economy}% / ${100 - economy}%`;
  });
}
