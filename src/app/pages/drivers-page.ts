import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { initials, matches } from '../admin/admin.format';
import { DRIVER_STATUS_COLORS } from '../admin/admin.models';
import { AdminStore } from '../admin/admin.store';
import { PageHeader } from '../layout/page-header';

@Component({
  selector: 'app-drivers-page',
  imports: [PageHeader, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page' },
  template: `
    <app-page-header
      heading="Водители и автомобили"
      searchable
      [(query)]="query"
      addLink="/drivers/new"
      addLabel="+ Добавить водителя"
    />
    <div class="page-body">
      <div class="page-content">
        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th scope="col">Водитель</th>
                <th scope="col">Автомобиль</th>
                <th scope="col">Класс</th>
                <th scope="col">Телефон</th>
                <th scope="col">Рейтинг</th>
                <th scope="col">Рейсов</th>
                <th scope="col">Статус</th>
                <th scope="col"><span class="visually-hidden">Действия</span></th>
              </tr>
            </thead>
            <tbody>
              @for (d of rows(); track d.id) {
                <tr>
                  <td>
                    <div class="person"><span class="avatar" aria-hidden="true">{{ d.initials }}</span>{{ d.name }}</div>
                  </td>
                  <td>{{ d.car }}<div class="sub">{{ d.plate }}</div></td>
                  <td>{{ d.cls }}</td>
                  <td class="nowrap">{{ d.phone }}</td>
                  <td class="strong nowrap">★ {{ d.rating }}</td>
                  <td>{{ d.trips }}</td>
                  <td><span class="pill" [style.background]="d.statusColor">{{ d.status }}</span></td>
                  <td>
                    <a class="btn-sm" [routerLink]="['/drivers', d.id]" [attr.aria-label]="'Изменить: ' + d.name">Изменить</a>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="8" class="empty">Никого не нашли</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: `
    .data-table { min-width: 960px; }
    .nowrap { white-space: nowrap; }
  `,
})
export class DriversPage {
  private readonly store = inject(AdminStore);
  protected readonly query = signal('');

  protected readonly rows = computed(() =>
    this.store
      .drivers()
      .filter((d) => matches(this.query(), d.name, d.car, d.plate, d.phone))
      .map((d) => ({ ...d, initials: initials(d.name), statusColor: DRIVER_STATUS_COLORS[d.status] })),
  );
}
