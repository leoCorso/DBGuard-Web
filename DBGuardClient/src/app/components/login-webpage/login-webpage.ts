import { Component, effect, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Image } from 'primeng/image';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { AuthService } from '../../services/auth-service';
import { ActivatedRoute, Router } from '@angular/router';
import { Message } from 'primeng/message';

@Component({
  selector: 'app-login-webpage',
  imports: [ReactiveFormsModule, InputGroup, InputText, InputGroupAddon, Password, Card, Button, Image, Message],
  templateUrl: './login-webpage.html',
  styleUrl: './login-webpage.scss',
})
export class LoginWebpage implements OnInit {
  public authService = inject(AuthService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  public returnUrl?: string;

  constructor(){
    effect(() => {
      const loggedIn = this.authService.loggedIn();
      if(loggedIn){
        const returnUrl = this.returnUrl ? this.returnUrl : '';
        this.router.navigate([returnUrl]);
      }
    });
  }
  ngOnInit(): void {
    this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] ?? '/';
  }
  public loginForm = new FormGroup({
    username: new FormControl<string | null>(null, [Validators.required]),
    password: new FormControl<string | null>(null, [Validators.required])
  });

  public loginClicked(): void {
    const username = this.loginForm.get('username')?.value
    const password = this.loginForm.get('password')?.value;
    if(!username || !password){
      return;
    }
    this.authService.login(username, password).subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
      }
    })
  }
}
