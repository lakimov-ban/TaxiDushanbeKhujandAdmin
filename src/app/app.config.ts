import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Параметры маршрута (orders/:id и т.п.) приходят в компоненты как input().
    provideRouter(routes, withComponentInputBinding()),
  ],
};
