import { Component, input } from '@angular/core';
import { EmailNotificationTransactionDTO } from '../../../../interfaces/notification-dto';

@Component({
  selector: 'app-email-transaction-detail-pane',
  imports: [],
  templateUrl: './email-transaction-detail-pane.html',
  styleUrl: './email-transaction-detail-pane.scss',
})
export class EmailTransactionDetailPane {
  public emailTransactionInfo = input.required<EmailNotificationTransactionDTO>();
}
