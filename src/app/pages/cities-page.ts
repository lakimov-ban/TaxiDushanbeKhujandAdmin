import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { matches } from '../admin/admin.format';
import { AdminStore } from '../admin/admin.store';
import { PageHeader } from '../layout/page-header';

@Component({
  selector: 'app-cities-page',
  imports: [PageHeader, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page' },
  template: `
    <app-page-header heading="Города" searchable [(query)]="query" addLink="/cities/new" addLabel="+ Добавить город" />
    <div class="page-body">
      <div class="page-content">
        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th scope="col">Город</th>
                <th scope="col">Регион</th>
                <th scope="col">Активен</th>
                <th scope="col"><span class="visually-hidden">Действия</span></th>
              </tr>
            </thead>
            <tbody>
              @for (c of rows(); track c.id) {
                <tr>
                  <td class="strong">{{ c.name }}</td>
                  <td class="muted">{{ c.region }}</td>
                  <td>
                    <button
                      type="button"
                      role="switch"
                      class="switch"
                      [attr.aria-checked]="c.active"
                      [attr.aria-label]="'Доступен для заказа: ' + c.name"
                      (click)="toggle(c.id)"
                    >
                      <span class="knob"></span>
                    </button>
                  </td>
                  <td>
                    <a class="btn-sm" [routerLink]="['/cities', c.id]" [attr.aria-label]="'Изменить: ' + c.name">Изменить</a>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="4" class="empty">Город не найден</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: `
    .data-table { min-width: 520px; }
    .switch {
      position: relative; display: block; width: 44px; height: 26px; padding: 0; border: 0;
      border-radius: 13px; background: #8a8576; cursor: pointer;
    }
    .switch[aria-checked='true'] { background: var(--ink); }
    .knob {
      position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%;
      background: var(--card); transition: left 0.15s ease;
    }
    .switch[aria-checked='true'] .knob { left: 21px; }
  `,
})
export class CitiesPage {
  private readonly store = inject(AdminStore);
  protected readonly query = signal('');

  protected readonly rows = computed(() =>
    this.store.cities().filter((c) => matches(this.query(), c.name, c.region)),
  );

  protected toggle(id: number): void {
    this.store.toggleCity(id);
  }
}
