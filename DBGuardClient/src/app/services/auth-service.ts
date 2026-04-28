import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, OnDestroy, OnInit, signal } from '@angular/core';
import { LoginRequest } from '../interfaces/login-request';
import { AuthResult } from '../interfaces/login-result';
import { environment } from '../../environments/environment.development';
import { Router } from '@angular/router';
import { catchError, Observable, Subject, takeUntil, tap, throwError } from 'rxjs';
import { RefreshTokenRequest } from '../interfaces/refresh-token-request';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpClient = inject(HttpClient);
  private router = inject(Router);


  public loggedIn = signal<boolean>(false);
  public loginError = signal<string | undefined>(undefined);
  public loggingIn = signal<boolean>(false);

  private accessTokenKey = 'access_token';

  private userRoles = signal<string[]>([]);
  private tokenExpiration = signal<number | null>(null);
  private accessToken = signal<string | null>(null);
  private rolesKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

  public initUser(): void {
    const accessToken = this.getAccessToken();
    if(accessToken){
      this.accessToken.set(accessToken);
      this.decodeToken(accessToken);
      if(this.tokenValid()){ // If token not expired and valid
        this.loggedIn.set(true);
      }
      else {
        this.loggedIn.set(false); // Else clear token from local storage and service
        this.clearTokenAndClaims();
      }

    }
    else {
      this.loggedIn.set(false);
      this.clearTokenAndClaims();
    }
  }
  public login(username: string, password: string): void {
    this.loggingIn.set(true);
    const loginRequest: LoginRequest = {
      username: username,
      password: password
    };
    const url = [environment.api.uri, 'user', 'login'].join('/');
    this.httpClient.post<AuthResult>(url, loginRequest).subscribe({
      next: (loginResult: AuthResult) => {
        if(loginResult.success){ // Valid login
          this.handleValidLogin(loginResult);
        }
        else {
          this.loginError.set(loginResult.message);
          this.logout();
        }
        this.loggingIn.set(false);
      },
      error: (error: HttpErrorResponse) => {
        console.log(JSON.stringify(error.error));
        this.loginError.set(error.error.message);
      }
    });
  }
  public logout(): void {
    this.loggedIn.set(false);  
    this.clearTokenAndClaims();
    this.router.navigate(['login']);
  }

  public getAccessToken = () => localStorage.getItem(this.accessTokenKey);

  private handleValidLogin(loginResult: AuthResult): void {
    this.loggedIn.set(true);
    this.storeAuthTokens(loginResult);
    this.decodeToken(loginResult.accessToken!);
  }
  private tokenValid(): boolean {
    if(!this.accessToken || !this.tokenExpiration()){
      return false;
    }

    const tokenExpiration = new Date(this.tokenExpiration()! * 1000);
      if (tokenExpiration == null || tokenExpiration.getTime() < Date.now()) {
        return false;
      }
      return true;
  }
  private decodeToken(token: string): void {
    try {
      // Split the token into parts
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT token');
      }

      // Decode the payload (second part)
      const payload = parts[1];
      const decoded = JSON.parse(atob(payload));
      
      this.tokenExpiration.set(decoded['exp']);
      this.userRoles.set(decoded[this.rolesKey]);
    }
    catch (error) {
      console.error('Error decoding JWT:', error);
    }
  }
  public hasRoles(roles: string[]): boolean {
    const missingRoles = roles.filter(role => !this.userRoles().includes(role));
    if(missingRoles.length !== 0){
      return false;
    }
    else {
      return true;
    }
  }
  private storeAuthTokens(authResult: AuthResult): void {
    localStorage.setItem(this.accessTokenKey, authResult.accessToken!);
  }
  private clearTokenAndClaims(): void {
    localStorage.removeItem(this.accessTokenKey);
    this.accessToken.set(null);
    this.userRoles.set([]);
    this.tokenExpiration.set(null);
  }
}
