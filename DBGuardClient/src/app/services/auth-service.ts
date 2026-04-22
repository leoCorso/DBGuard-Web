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
  private refreshTokenKey = 'refresh_token';
  private userIdKey = 'user-id';

  private userRoles = signal<string[]>([]);
  private tokenExpiration = signal<number | null>(null);
  private accessToken = signal<string | null>(null);
  private rolesKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

  public initUser(): void {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    const userId = this.getUserId();

    if(accessToken){
      this.accessToken.set(accessToken);
      this.decodeToken(accessToken);
      this.loggedIn.set(true);

    }
    else if(!this.tokenValid() && userId && refreshToken){ // If access token is invalid or missing but we have refresh token, try to refresh
      this.refreshToken();
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
    const url = [environment.api.uri, 'User', 'LogOut'].join('/');
    this.httpClient.post<void>(url, {userId: this.getUserId()}).subscribe();

    this.loggedIn.set(false);  
    this.clearAuthTokens();
    this.router.navigate(['login']);
  }
  public refreshToken(): Observable<AuthResult> {
    const url = [environment.api.uri, 'User', 'ProcessUserRefreshToken'].join('/');
    return this.httpClient.post<AuthResult>(url, {userId: this.getUserId(), refreshToken: this.getRefreshToken()}).pipe(tap(response => this.storeAuthTokens(response),
      catchError(err => {
          this.logout();
          return throwError(err);
      })))
  }
  public getAccessToken = () => localStorage.getItem(this.accessTokenKey);
  public getRefreshToken = () => localStorage.getItem(this.refreshTokenKey);
  public getUserId = () => localStorage.getItem(this.userIdKey);

  private handleValidLogin(loginResult: AuthResult): void {
    this.loggedIn.set(true);
    this.storeAuthTokens(loginResult);
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
    localStorage.setItem(this.refreshTokenKey, authResult.refreshToken!);
    localStorage.setItem(this.userIdKey, authResult.userId!);
  }
  private clearAuthTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userIdKey);
  }
}
