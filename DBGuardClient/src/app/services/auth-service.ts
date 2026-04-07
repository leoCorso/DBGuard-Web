import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, OnDestroy, OnInit, signal } from '@angular/core';
import { LoginRequest } from '../interfaces/login-request';
import { LoginResult } from '../interfaces/login-result';
import { environment } from '../../environments/environment.development';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

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

  public initUser(): void {
    const token = localStorage.getItem(this.accessTokenKey);
    if(token && AuthService.tokenValid(token)){
      this.loggedIn.set(true);
    }
  }
  public login(username: string, password: string): void {
    this.loggingIn.set(true);
    const loginRequest: LoginRequest = {
      username: username,
      password: password
    };
    const url = [environment.api.uri, 'user', 'login'].join('/');
    this.httpClient.post<LoginResult>(url, loginRequest).subscribe({
      next: (loginResult: LoginResult) => {
        if(loginResult.success){ // Valid login
          this.handleValidLogin(loginResult);
        }
        else {
          this.loginError.set(loginResult.message);
          this.handleLogout();
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
    this.handleLogout();
  }
  public getToken(): string | null {
    const token = localStorage.getItem(this.accessTokenKey);
    return token;
  }
  private handleValidLogin(loginResult: LoginResult): void {
    this.loggedIn.set(true);
    localStorage.setItem(this.accessTokenKey, loginResult.token!);
  }
  private handleLogout(): void {
    this.loggedIn.set(false);
    const storedToken = localStorage.getItem(this.accessTokenKey);
    if(storedToken){
      localStorage.removeItem(this.accessTokenKey);
    }
    this.router.navigate(['login']);
  }
  private static tokenValid(token: string): boolean {
    const tokenClaims = AuthService.decodeToken(token);
    const tokenExpiration = new Date(tokenClaims['exp'] * 1000);
      if (tokenExpiration == null || tokenExpiration.getTime() < Date.now()) {
        return false;
      }
      return true;
  }
  private static decodeToken(token: string): any {
    try {
      // Split the token into parts
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT token');
      }

      // Decode the payload (second part)
      const payload = parts[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    }
    catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }
}
