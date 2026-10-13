import { ChangeDetectionStrategy, Component, booleanAttribute, input, model } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Шапка раздела: «назад», заголовок, поиск и главная кнопка действия. */
@Component({
  selector: 'app-page-header',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="title-row">
      @if (backLink(); as link) {
        <a class="round-btn" [routerLink]="link" aria-label="Назад">←</a>
      }
      <h1 tabindex="-1">{{ heading() }}</h1>
    </div>
    @if (searchable()) {
      <div class="search">
        <input
          #search
          type="search"
          aria-label="Поиск"
          placeholder="Поиск"
          autocomplete="off"
          [value]="query()"
          (input)="query.set(search.value)"
        />
      </div>
    }
    @if (addLink(); as link) {
      <a class="btn btn-accent" [routerLink]="link">{{ addLabel() }}</a>
    }
  `,
  styles: `
    :host {
      flex: none; display: flex; align-items: center; justify-content: space-between;
      gap: 12px; flex-wrap: wrap; padding: 20px var(--gutter) 8px;
    }
    .title-row { display: flex; align-items: center; gap: 12px; min-width: 0; }
    h1 { margin: 0; font-size: clamp(24px, 4vw, 32px); letter-spacing: -0.03em; }
    .search {
      display: flex; align-items: center; flex: 1 1 220px; max-width: 320px; height: 44px;
      padding: 0 16px; border-radius: 14px; background: var(--card);
    }
    .search:focus-within { box-shadow: 0 0 0 3px var(--ink); }
    .search input {
      flex: 1; min-width: 0; height: 100%; border: 0; outline: 0; background: transparent; font-size: 15px;
    }
    .search input::placeholder { color: var(--muted); opacity: 1; }
    .btn { padding: 12px 20px; }
  `,
})
export class PageHeader {
  readonly heading = input.required<string>();
  readonly backLink = input<string | null>(null);
  readonly searchable = input(false, { transform: booleanAttribute });
  readonly query = model('');
  readonly addLink = input<string | null>(null);
  readonly addLabel = input('');
}
