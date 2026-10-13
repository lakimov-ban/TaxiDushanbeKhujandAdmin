import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminStore } from '../admin/admin.store';
import { PageHeader } from '../layout/page-header';
import { notBlank, parseEntityId } from './form-validators';

@Component({
  selector: 'app-city-form-page',
  imports: [PageHeader, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page' },
  template: `
    <app-page-header [heading]="heading()" backLink="/cities" />
    <div class="page-body">
      <form class="page-content" [formGroup]="form" (ngSubmit)="save()">
        <div class="panel">
          <label class="form-field">
            <span>Название города</span>
            <input class="input" formControlName="name" placeholder="Вахдат" autocomplete="off" />
          </label>
          <label class="form-field">
            <span>Регион</span>
            <input class="input" formControlName="region" placeholder="РРП" autocomplete="off" />
          </label>
          <fieldset class="form-field">
            <legend class="form-legend">Доступен для заказа</legend>
            <div class="chips">
              @for (o of activeOptions; track o.label) {
                <button
                  type="button"
                  class="chip soft"
                  [attr.aria-pressed]="form.controls.active.value === o.value"
                  (click)="form.controls.active.setValue(o.value)"
                >
                  {{ o.label }}
                </button>
              }
            </div>
          </fieldset>
        </div>
        <div class="actions">
          <button type="submit" class="btn btn-dark" [disabled]="form.invalid">Сохранить</button>
          <a class="btn" routerLink="/cities">Отмена</a>
        </div>
      </form>
    </div>
  `,
  styles: `
    .panel { max-width: 520px; gap: 16px; }
  `,
})
export class CityFormPage {
  private readonly store = inject(AdminStore);
  private readonly router = inject(Router);

  /** Параметр маршрута cities/:id; «new» — новый город. */
  readonly id = input<string>();

  protected readonly activeOptions = [
    { label: 'Да', value: true },
    { label: 'Нет', value: false },
  ];

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', notBlank],
    region: [''],
    active: [true],
  });

  private readonly cityId = computed(() => parseEntityId(this.id()));
  private readonly city = computed(() => {
    const id = this.cityId();
    return id === null ? undefined : this.store.cities().find((c) => c.id === id);
  });

  protected readonly heading = computed(() => {
    const city = this.city();
    return city ? `Редактирование: ${city.name}` : 'Новый город';
  });

  constructor() {
    effect(() => {
      const city = this.city();
      untracked(() => this.form.reset(city ?? {}));
    });
  }

  protected save(): void {
    if (this.form.invalid) return;
    this.store.saveCity(this.city() ? this.cityId() : null, this.form.getRawValue());
    void this.router.navigate(['/cities']);
  }
}
