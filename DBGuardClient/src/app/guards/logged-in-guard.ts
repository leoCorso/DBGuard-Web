import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const loggedInGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if(authService.loggedIn()){
    return true;
  }
  else {
    return router.createUrlTree(['login'], {
      queryParams: {
        returnUrl: state.url
      }
    });
  }
};
