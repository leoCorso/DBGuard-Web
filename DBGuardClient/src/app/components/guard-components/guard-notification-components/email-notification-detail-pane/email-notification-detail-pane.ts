import { Component, input } from '@angular/core';
import { EmailNotificationDetailDTO, NotificationDetailDTO } from '../../../../interfaces/notification-dto';

@Component({
  selector: 'app-email-notification-detail-pane',
  imports: [],
  templateUrl: './email-notification-detail-pane.html',
  styleUrl: './email-notification-detail-pane.scss',
})
export class EmailNotificationDetailPane {
  public emailNotificationConfig = input.required<EmailNotificationDetailDTO>();
}
