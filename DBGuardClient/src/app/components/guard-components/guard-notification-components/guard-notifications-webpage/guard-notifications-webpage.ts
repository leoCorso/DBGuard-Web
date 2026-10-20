import { Component, ChangeDetectionStrategy } from '@angular/core';
import { GuardNotificationsTable } from '../guard-notifications-table/guard-notifications-table';

@Component({
  selector: 'app-guard-notifications-webpage',
  imports: [GuardNotificationsTable],
  templateUrl: './guard-notifications-webpage.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './guard-notifications-webpage.scss',
})
export class GuardNotificationsWebpage {}
