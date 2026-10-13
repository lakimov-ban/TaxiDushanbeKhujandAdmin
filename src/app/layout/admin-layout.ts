import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, skip } from 'rxjs';
import { AdminStore } from '../admin/admin.store';

interface Tab {
  path: string;
  label: string;
  badge: string;
}

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="nav" aria-label="Разделы">
      <div class="logo">
        <span class="logo-mark" aria-hidden="true"><span></span></span>
        Taxi
        <span class="logo-tag">админ</span>
      </div>
      <ul class="tabs">
        @for (tab of tabs(); track tab.path) {
          <li>
            <a class="tab" [routerLink]="tab.path" routerLinkActive="active" ariaCurrentWhenActive="page">
              <span>{{ tab.label }}</span>
              @if (tab.badge) {
                <span class="badge">{{ tab.badge }}</span>
              }
            </a>
          </li>
        }
      </ul>
    </nav>
    <main class="main">
      <router-outlet />
    </main>
  `,
  styles: `
    :host { height: 100dvh; display: flex; overflow: hidden; }
    .nav {
      flex: none; display: flex; flex-direction: column; gap: 4px; width: 232px;
      padding: 20px 12px; border-right: 1px solid var(--sand);
    }
    .logo {
      flex: none; display: flex; align-items: center; gap: 10px; padding: 0 10px 18px;
      font-size: 20px; font-weight: 700; letter-spacing: -0.02em;
    }
    .logo-mark {
      display: flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; border-radius: 9px; background: var(--accent);
    }
    .logo-mark span { width: 10px; height: 10px; border-radius: 50%; background: var(--ink); }
    .logo-tag {
      padding: 2px 6px; border-radius: 6px; background: var(--sand);
      font-size: 11px; font-weight: 600; letter-spacing: 0;
    }
    .tabs {
      display: flex; flex-direction: column; gap: 4px; min-width: 0; width: 100%;
      margin: 0; padding: 0; list-style: none; overflow-x: auto;
    }
    .tab {
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      padding: 10px 14px; border-radius: 12px; font-size: 15px; font-weight: 600;
      text-decoration: none; white-space: nowrap;
    }
    .tab:hover { background: var(--sand); }
    .tab.active { background: var(--ink); color: var(--paper); }
    .badge { font-size: 12px; opacity: 0.75; }
    .main { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; }

    @media (max-width: 859px) {
      :host { flex-direction: column; }
      .nav {
        flex-direction: row; align-items: center; width: 100%; padding: 10px 12px;
        border-right: 0; border-bottom: 1px solid var(--sand);
      }
      .logo { padding: 0 8px 0 4px; }
      .tabs { flex-direction: row; }
      .tab { flex: none; }
      .badge { display: none; }
    }
  `,
})
export class AdminLayout {
  private readonly store = inject(AdminStore);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  protected readonly tabs = computed<Tab[]>(() => [
    { path: '/analytics', label: 'Аналитика', badge: '' },
    { path: '/orders', label: 'Заявки', badge: `${this.store.statusCounts().new} нов.` },
    { path: '/drivers', label: 'Водители', badge: String(this.store.drivers().length) },
    { path: '/schedule', label: 'Графики', badge: '' },
    { path: '/cities', label: 'Города', badge: String(this.store.cities().length) },
    { path: '/clients', label: 'Клиенты', badge: String(this.store.clients().length) },
  ]);

  constructor() {
    // После перехода переносим фокус на заголовок новой страницы — так его озвучат экранные дикторы.
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        skip(1),
        takeUntilDestroyed(),
      )
      .subscribe(() =>
        afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>('main h1')?.focus(), {
          injector: this.injector,
        }),
      );
  }
}
