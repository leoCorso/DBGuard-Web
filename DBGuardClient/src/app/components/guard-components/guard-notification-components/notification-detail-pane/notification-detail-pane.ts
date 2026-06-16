import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Button } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { NotificationType } from '../../../../enums/notification-type';
import { getEnumLabel } from '../../../../helpers/enum-helper';
import { EmailNotificationDetailDTO, HttpNotificationDetailDTO, NotificationDetailDTO } from '../../../../interfaces/notification-dto';
import { EmailNotificationDetailPane } from '../email-notification-detail-pane/email-notification-detail-pane';
import { HttpNotificationDetailPane } from '../http-notification-detail-pane/http-notification-detail-pane';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-notification-detail-pane',
  imports: [Divider, EmailNotificationDetailPane, HttpNotificationDetailPane, Button, DatePipe, RouterModule, Tag],
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
