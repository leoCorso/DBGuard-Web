import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import Material from '@primeuix/themes/material';
import { DialogService } from 'primeng/dynamicdialog';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { requestErrorInterceptor } from './interceptors/request-error-interceptor';
import { tokenInterceptor } from './interceptors/token-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: Material
      }
    }),
    DialogService,
    MessageService,
    provideHttpClient(withInterceptors([requestErrorInterceptor, tokenInterceptor]))
  ]
};
