import { Component, ChangeDetectionStrategy } from '@angular/core';
import { UsersTable } from '../users-table/users-table';

@Component({
  selector: 'app-users-webpage',
  imports: [UsersTable],
  templateUrl: './users-webpage.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './users-webpage.scss',
})
export class UsersWebpage {}
