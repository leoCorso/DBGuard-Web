import { Component, computed, input } from '@angular/core';
import { EmailNotificationDetailDTO, HttpNotificationDetailDTO, NotificationDetailDTO } from '../../../../interfaces/notification-dto';
import { Button } from 'primeng/button';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationType } from '../../../../enums/notification-type';
import { getEnumLabel } from '../../../../helper-functions/enum-helper';
import { EmailNotificationDetailPane } from '../email-notification-detail-pane/email-notification-detail-pane';
import { Card } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { HttpNotificationDetailPane } from '../http-notification-detail-pane/http-notification-detail-pane';

@Component({
  selector: 'app-notification-detail-pane',
  imports: [Divider, EmailNotificationDetailPane, HttpNotificationDetailPane, Button, DatePipe, RouterModule, Card],
  templateUrl: './notification-detail-pane.html',
  styleUrl: './notification-detail-pane.scss',
})
export class NotificationDetailPane {
    public notificationDetail = input.required<NotificationDetailDTO>();
    public emailNotificationDetail = computed<EmailNotificationDetailDTO | null>(() => this.notificationDetail() as EmailNotificationDetailDTO | null);
    public httpNotificationDetail = computed<HttpNotificationDetailDTO | null>(() => this.notificationDetail() as HttpNotificationDetailDTO | null);
    public getEnumLabel = getEnumLabel;
    public notificationTypes = NotificationType;
}
