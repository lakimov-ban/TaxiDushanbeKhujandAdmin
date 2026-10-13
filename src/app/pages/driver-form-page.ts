import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CAR_CLASSES, CarClass, DriverDraft, DriverRoute } from '../admin/admin.models';
import { AdminStore } from '../admin/admin.store';
import { PageHeader } from '../layout/page-header';
import { notBlank, parseEntityId } from './form-validators';

const DEFAULT_ROUTE: DriverRoute = { from: 'Душанбе', to: 'Худжанд', price: null };
const EMPTY_DRAFT: DriverDraft = {
  name: '', phone: '', car: '', plate: '', cls: 'Эконом',
  markup: 0, adult: 50, child: 30, bag: 20, routes: [DEFAULT_ROUTE],
};

@Component({
  selector: 'app-driver-form-page',
  imports: [PageHeader, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page' },
  templateUrl: './driver-form-page.html',
  styles: `
    .wide { grid-column: 1 / -1; }
    .route-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
    .route-row select { flex: 1 1 160px; }
    .route-row .input-unit { flex: 1 1 140px; }
    .add-route { align-self: flex-start; padding: 10px 18px; font-size: 14px; border-radius: 12px; }
    .add-route:hover { background: var(--accent); }
    .hint { margin: 0; align-self: center; }
  `,
})
export class DriverFormPage {
  private readonly store = inject(AdminStore);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  /** Параметр маршрута drivers/:id; «new» — новый водитель. */
  readonly id = input<string>();

  protected readonly classes = CAR_CLASSES;
  protected readonly cityNames = computed(() => this.store.cities().map((c) => c.name));

  protected readonly form = this.fb.group({
    name: ['', notBlank],
    phone: [''],
    car: ['', notBlank],
    plate: ['', notBlank],
    cls: this.fb.control<CarClass>('Эконом'),
    markup: this.fb.control<number | null>(0, Validators.min(0)),
    adult: this.fb.control<number | null>(50, Validators.min(0)),
    child: this.fb.control<number | null>(30, Validators.min(0)),
    bag: this.fb.control<number | null>(20, Validators.min(0)),
    routes: this.fb.array([this.routeGroup(DEFAULT_ROUTE)]),
  });

  protected readonly extras = [
    { key: 'markup', label: 'Наценка водителя', unit: '%' },
    { key: 'adult', label: 'За пассажира', unit: 'сом.' },
    { key: 'child', label: 'За ребёнка', unit: 'сом.' },
    { key: 'bag', label: 'За чемодан', unit: 'сом.' },
  ] as const;

  private readonly driverId = computed(() => parseEntityId(this.id()));
  private readonly driver = computed(() => this.store.driver(this.driverId()));

  protected readonly heading = computed(() => {
    const d = this.driver();
    return d ? `Редактирование: ${d.name}` : 'Новый водитель';
  });

  constructor() {
    effect(() => {
      const draft = this.driver() ?? EMPTY_DRAFT;
      untracked(() => this.load(draft));
    });
  }

  protected get routes() {
    return this.form.controls.routes;
  }

  protected addRoute(): void {
    this.routes.push(this.routeGroup(DEFAULT_ROUTE));
  }

  protected removeRoute(index: number): void {
    this.routes.removeAt(index);
  }

  protected save(): void {
    if (this.form.invalid) return;
    this.store.saveDriver(this.driver() ? this.driverId() : null, this.form.getRawValue());
    void this.router.navigate(['/drivers']);
  }

  private load(draft: DriverDraft): void {
    this.routes.clear();
    for (const r of draft.routes) this.routes.push(this.routeGroup(r));
    this.form.reset(draft);
  }

  private routeGroup(r: DriverRoute) {
    return this.fb.group({
      from: [r.from],
      to: [r.to],
      price: this.fb.control<number | null>(r.price, Validators.min(0)),
    });
  }
}
