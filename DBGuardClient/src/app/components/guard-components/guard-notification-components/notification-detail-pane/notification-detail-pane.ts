import { Component, computed, input } from '@angular/core';
import { EmailNotificationDetailDTO, NotificationDetailDTO } from '../../../../interfaces/notification-dto';
import { Button } from 'primeng/button';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationType } from '../../../../enums/notification-type';
import { getEnumLabel } from '../../../../helper-functions/enum-helper';
import { EmailNotificationDetailPane } from '../email-notification-detail-pane/email-notification-detail-pane';
import { Card } from 'primeng/card';
import { Divider } from 'primeng/divider';

@Component({
  selector: 'app-notification-detail-pane',
  imports: [Divider, EmailNotificationDetailPane, Button, DatePipe, RouterModule, Card],
  templateUrl: './notification-detail-pane.html',
  styleUrl: './notification-detail-pane.scss',
})
export class NotificationDetailPane {
    public notificationDetail = input.required<NotificationDetailDTO>();
    public emailNotificationDetail = computed(() => this.notificationDetail() as EmailNotificationDetailDTO | null);
    public getEnumLabel = getEnumLabel;
    public notificationTypes = NotificationType;
}
