import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, OnDestroy, OnInit, signal } from '@angular/core';
import { LoginRequest } from '../interfaces/login-request';
import { AuthResult } from '../interfaces/login-result';
import { environment } from '../../environments/environment.development';
import { Router } from '@angular/router';
import { EMPTY, finalize, Observable, tap } from 'rxjs';
import { InactivityService } from './inactivity-service';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpClient = inject(HttpClient);
  private router = inject(Router);
  private inactivityService = inject(InactivityService);

  public loggedIn = signal<boolean>(false);
  public loginError = signal<string | undefined>(undefined);
  public defaultAdminError = signal<string | null>(null);
  public loggingIn = signal<boolean>(false);
  public refreshingToken = signal<boolean>(false);

  private accessTokenKey = 'access_token';
  private accessTokenExpKey = 'access_token_exp';
  private userNameKey = 'user-name';
  private rolesKey=  'user-roles';

  private userRoles: string[] = [];
  private userName?: string;
  private messageService = inject(MessageService);

  public getAccessToken = () => localStorage.getItem(this.accessTokenKey);
  public getUsername = () => localStorage.getItem(this.userNameKey);
  public getRoles = () => {
    const rolesString = localStorage.getItem(this.rolesKey);
    if(rolesString){
      return rolesString.split(',');
    }
    return [];
  }

  constructor(){
    this.inactivityService.onTimeout$.subscribe(() => {
      if(this.loggedIn()){
        this.logout().pipe(finalize(() => this.inactivityService.stop())).subscribe();
        this.messageService.add({summary: 'Logged out', detail: 'You were logged out due to inactivity', severity: 'error', key: 'request-error', sticky: true})
      }
    });
  }
  public initUser(): void {
    const hasToken = localStorage.getItem(this.accessTokenKey);
    if(hasToken){
      this.loggedIn.set(true);
      this.inactivityService.start();
    }
    if(hasToken && this.tokenInvalid()) {
      this.refreshToken();
    }
  }

  public login(username: string, password: string): Observable<AuthResult> {
    this.loggingIn.set(true);
    const loginRequest: LoginRequest = {
      username: username,
      password: password
    };
    const url = [environment.api.uri, 'User', 'Login'].join('/');
    return this.httpClient.post<AuthResult>(url, loginRequest, { withCredentials: true })
    .pipe(
      tap(authResponse => {
        if(authResponse.success){
          this.loggedIn.set(true);
          this.loginError.set(undefined);
          this.storeClaims(authResponse);

          if(this.userName === 'admin'){
            this.defaultAdminError.set("You're using the default admin account. For best security practices, please create a new admin account and delete this default.");
          }
          this.inactivityService.start();
        }
        else {
          this.loginError.set(authResponse.message);
        }
      }),
      finalize(() => this.loggingIn.set(false)));
  }
  public logout(): Observable<void> {
    const url = [environment.api.uri, 'User', 'LogOut'].join('/');
    return this.httpClient.post<void>(url, {}, { withCredentials: true }).pipe(
      finalize(() => {
        this.clearClaims();
        this.loggedIn.set(false);
        this.router.navigate(['login']);
        this.inactivityService.stop();
      })
    );
  }
  public refreshToken(): Observable<AuthResult> {
    if(this.refreshingToken()){
      return EMPTY;
    }
    this.refreshingToken.set(true);
    const url = [environment.api.uri, 'User', 'RefreshToken'].join('/');
    return this.httpClient.post<AuthResult>(url, {}, { withCredentials: true }).pipe(tap(authResponse => {
      if(authResponse.success){
        this.loggedIn.set(true);
        this.storeClaims(authResponse);
      }
      else {
        this.loggedIn.set(false);
        this.clearClaims();
      }
      this.refreshingToken.set(false);
    }));
  }
  private storeClaims(authInfo: AuthResult): void {
    localStorage.setItem(this.accessTokenKey, authInfo.accessToken!);
    localStorage.setItem(this.accessTokenExpKey, new Date(authInfo.expiration!).toISOString());
    localStorage.setItem(this.userNameKey, authInfo.username!);
    localStorage.setItem(this.rolesKey, authInfo.roles.join(','));
    this.userName = authInfo.username;
    this.userRoles = authInfo.roles;
  }
  public tokenInvalid(): boolean {
    const tokenExpiration = localStorage.getItem(this.accessTokenKey);
    if(!tokenExpiration || new Date(tokenExpiration) < new Date()){
      return  true;
    }
    return false;
  }
  private clearClaims(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.accessTokenExpKey);
    localStorage.removeItem(this.userNameKey);
    localStorage.removeItem(this.rolesKey);
  }
  public hasRoles(roles: string[]): boolean {
    const missingRoles = roles.filter(role => !this.getRoles().includes(role));
    if(missingRoles.length !== 0){
      return false;
    }
    else {
      return true;
    }
  }
}
