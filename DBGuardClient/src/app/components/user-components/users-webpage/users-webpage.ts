import { Component } from '@angular/core';
import { UsersTable } from '../users-table/users-table';

@Component({
  selector: 'app-users-webpage',
  imports: [UsersTable],
  templateUrl: './users-webpage.html',
  styleUrl: './users-webpage.scss',
})
export class UsersWebpage {}
