import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { WEEKDAYS, matches } from '../admin/admin.format';
import { SHIFTS } from '../admin/admin.models';
import { AdminStore } from '../admin/admin.store';
import { PageHeader } from '../layout/page-header';

const ROUTE_LABELS = ['Душанбе — Худжанд', 'Худжанд — Душанбе', 'Душанбе — Пенджикент', 'Душанбе — Истаравшан'];

@Component({
  selector: 'app-schedule-page',
  imports: [PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page' },
  template: `
    <app-page-header heading="Графики работы" searchable [(query)]="query" />
    <div class="page-body">
      <div class="page-content">
        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th scope="col" class="name-col">Водитель</th>
                @for (day of days; track day) {
                  <th scope="col">{{ day }}</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (r of rows(); track r.id) {
                <tr>
                  <th scope="row" class="name">{{ r.name }}</th>
                  @for (c of r.cells; track $index) {
                    <td>
                      <button
                        type="button"
                        class="cell"
                        [style.background]="c.color"
                        [attr.aria-label]="r.name + ', ' + days[$index] + ': ' + c.label + '. Нажмите, чтобы сменить'"
                        (click)="cycle(r.id, $index)"
                      >
                        <span class="strong">{{ c.label }}</span>
                        <span class="cell-sub">{{ c.sub }}</span>
                      </button>
                    </td>
                  }
                </tr>
              } @empty {
                <tr><td colspan="8" class="empty">Никого не нашли</td></tr>
              }
            </tbody>
          </table>
        </div>
        <p class="sub hint">Нажмите на ячейку, чтобы переключить: рейс, выходной, отпуск.</p>
      </div>
    </div>
  `,
  styles: `
    .data-table { min-width: 900px; table-layout: fixed; }
    .name-col { width: 180px; }
    .name { font-size: 15px; font-weight: 600; text-align: left; border-top: 1px solid var(--line); padding: 10px 10px 10px 20px; }
    td { padding: 8px 4px; }
    .cell {
      display: flex; flex-direction: column; align-items: flex-start; width: 100%; min-height: 48px;
      padding: 8px; border: 0; border-radius: 10px; font-size: 12px; line-height: 1.3; text-align: left; cursor: pointer;
    }
    .cell:hover { box-shadow: inset 0 0 0 2px var(--ink); }
    .hint { margin: 0; }
  `,
})
export class SchedulePage {
  private readonly store = inject(AdminStore);

  protected readonly days = WEEKDAYS;
  protected readonly query = signal('');

  protected readonly rows = computed(() => {
    const schedule = this.store.schedule();
    return this.store
      .drivers()
      .filter((d) => matches(this.query(), d.name))
      .map((d) => ({
        id: d.id,
        name: d.name,
        cells: (schedule[d.id] ?? []).map((shift, day) => ({
          label: SHIFTS[shift].label,
          color: SHIFTS[shift].color,
          sub: shift === 'trip' ? ROUTE_LABELS[(d.id + day) % ROUTE_LABELS.length] : shift === 'off' ? '—' : 'до 20 окт',
        })),
      }));
  });

  protected cycle(driverId: number, day: number): void {
    this.store.cycleShift(driverId, day);
  }
}
