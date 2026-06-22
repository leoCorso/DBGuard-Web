import { Component, input } from '@angular/core';
import { EmailNotificationTransactionDTO } from '../../../../interfaces/notification-dto';
import { TrackClick } from '../../../../directives/track-click';

@Component({
  selector: 'app-email-transaction-detail-pane',
  imports: [TrackClick],
  templateUrl: './email-transaction-detail-pane.html',
  styleUrl: './email-transaction-detail-pane.scss',
})
export class EmailTransactionDetailPane {
  public emailTransactionInfo = input.required<EmailNotificationTransactionDTO>();
}
