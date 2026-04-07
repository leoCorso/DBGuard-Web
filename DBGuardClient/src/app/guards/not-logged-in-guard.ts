import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const notLoggedInGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  if(authService.loggedIn()){
    return false;
  }
  else {
    return true;
  }
};
