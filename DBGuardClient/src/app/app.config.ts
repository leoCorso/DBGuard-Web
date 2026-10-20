import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import Material from '@primeuix/themes/material';
import { MyPreset } from './theme-preset';

import { DialogService } from 'primeng/dynamicdialog';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { requestErrorInterceptor } from './interceptors/request-error-interceptor';
import { accessTokenInterceptor } from './interceptors/token-interceptor';
import { refreshTokenInterceptor } from './interceptors/refresh-token-interceptor';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: '.my-app-dark',
        },
      },
      ripple: true,
      license: environment.primeng.license // Add your license here
    }),
    DialogService,
    MessageService,
    ConfirmationService,
    provideHttpClient(
      withXhr(),
      withInterceptors([requestErrorInterceptor, accessTokenInterceptor, refreshTokenInterceptor]),
    ),
  ],
};
