import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { formatMoney, initials, matches } from '../admin/admin.format';
import { AdminStore } from '../admin/admin.store';
import { PageHeader } from '../layout/page-header';

@Component({
  selector: 'app-clients-page',
  imports: [PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page' },
  template: `
    <app-page-header heading="Клиенты" searchable [(query)]="query" />
    <div class="page-body">
      <div class="page-content">
        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th scope="col">Клиент</th>
                <th scope="col">Телефон</th>
                <th scope="col">Поездок</th>
                <th scope="col">Потрачено</th>
                <th scope="col">Последняя</th>
              </tr>
            </thead>
            <tbody>
              @for (c of rows(); track c.phone) {
                <tr>
                  <td>
                    <div class="person"><span class="avatar" aria-hidden="true">{{ c.initials }}</span>{{ c.name }}</div>
                  </td>
                  <td class="nowrap">{{ c.phone }}</td>
                  <td>{{ c.trips }}</td>
                  <td class="strong nowrap">{{ c.spent }}</td>
                  <td class="muted">{{ c.last }}</td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="empty">Никого не нашли</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: `
    .data-table { min-width: 680px; }
    .nowrap { white-space: nowrap; }
  `,
})
export class ClientsPage {
  private readonly store = inject(AdminStore);
  protected readonly query = signal('');

  protected readonly rows = computed(() =>
    this.store
      .clients()
      .filter((c) => matches(this.query(), c.name, c.phone))
      .map((c) => ({ ...c, initials: initials(c.name), spent: formatMoney(c.spent) })),
  );
}
