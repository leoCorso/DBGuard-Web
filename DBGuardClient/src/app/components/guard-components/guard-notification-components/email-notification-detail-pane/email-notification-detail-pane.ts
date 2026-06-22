import { Component, input } from '@angular/core';
import { EmailNotificationDetailDTO } from '../../../../interfaces/notification-dto';
import { TrackClick } from '../../../../directives/track-click';

@Component({
  selector: 'app-email-notification-detail-pane',
  imports: [TrackClick],
  templateUrl: './email-notification-detail-pane.html',
  styleUrl: './email-notification-detail-pane.scss',
})
export class EmailNotificationDetailPane {
  public emailNotificationConfig = input.required<EmailNotificationDetailDTO>();
}
