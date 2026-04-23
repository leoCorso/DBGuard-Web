import { Component } from '@angular/core';
import { GuardNotificationTransactionsTable } from '../guard-notification-transactions-table/guard-notification-transactions-table';

@Component({
  selector: 'app-notification-transactions-webpage',
  imports: [GuardNotificationTransactionsTable],
  templateUrl: './notification-transactions-webpage.html',
  styleUrl: './notification-transactions-webpage.scss',
})
export class NotificationTransactionsWebpage {
  
}
