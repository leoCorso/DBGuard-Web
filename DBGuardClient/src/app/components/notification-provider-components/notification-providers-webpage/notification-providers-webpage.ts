import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NotificationProvidersTable } from '../notification-providers-table/notification-providers-table';

@Component({
  selector: 'app-notification-providers-webpage',
  imports: [NotificationProvidersTable],
  templateUrl: './notification-providers-webpage.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './notification-providers-webpage.scss',
})
export class NotificationProvidersWebpage {}
