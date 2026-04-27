import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toolbar } from 'primeng/toolbar';
import { UsersToolbar } from '../users-toolbar/users-toolbar';

@Component({
  selector: 'app-users-wrapper',
  imports: [RouterOutlet, UsersToolbar],
  templateUrl: './users-wrapper.html',
  styleUrl: './users-wrapper.scss',
})
export class UsersWrapper {}
