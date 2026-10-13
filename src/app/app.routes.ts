import { Routes } from '@angular/router';
import { AdminLayout } from './layout/admin-layout';

const page = (title: string) => `${title} — Taxi админ`;

export const routes: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'orders' },
      {
        path: 'analytics',
        title: page('Аналитика'),
        loadComponent: () => import('./pages/analytics-page').then((m) => m.AnalyticsPage),
      },
      {
        path: 'orders',
        title: page('Заявки'),
        loadComponent: () => import('./pages/orders-page').then((m) => m.OrdersPage),
      },
      {
        path: 'orders/:id',
        title: page('Заявка'),
        loadComponent: () => import('./pages/order-detail-page').then((m) => m.OrderDetailPage),
      },
      {
        path: 'drivers',
        title: page('Водители'),
        loadComponent: () => import('./pages/drivers-page').then((m) => m.DriversPage),
      },
      {
        path: 'drivers/:id',
        title: page('Водитель'),
        loadComponent: () => import('./pages/driver-form-page').then((m) => m.DriverFormPage),
      },
      {
        path: 'schedule',
        title: page('Графики'),
        loadComponent: () => import('./pages/schedule-page').then((m) => m.SchedulePage),
      },
      {
        path: 'cities',
        title: page('Города'),
        loadComponent: () => import('./pages/cities-page').then((m) => m.CitiesPage),
      },
      {
        path: 'cities/:id',
        title: page('Город'),
        loadComponent: () => import('./pages/city-form-page').then((m) => m.CityFormPage),
      },
      {
        path: 'clients',
        title: page('Клиенты'),
        loadComponent: () => import('./pages/clients-page').then((m) => m.ClientsPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
