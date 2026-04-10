import { Component, input } from '@angular/core';
import { CreateEmailGuardNotificationDTO } from '../../../../../interfaces/notification-dto';

@Component({
  selector: 'app-view-email-notification-detail',
  imports: [],
  templateUrl: './view-email-notification-detail.html',
  styleUrl: './view-email-notification-detail.scss',
})
export class ViewEmailNotificationDetail {
  public emailDetail = input.required<CreateEmailGuardNotificationDTO>();
}
