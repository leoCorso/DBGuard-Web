import { Component, computed, input } from '@angular/core';
import { EmailNotificationDetailDTO, EmailNotificationTransactionDTO, HttpNotificationTransactionDTO, NotificationTransactionDTO } from '../../../../interfaces/notification-dto';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { getEnumLabel } from '../../../../helper-functions/enum-helper';
import { NotificationType } from '../../../../enums/notification-type';
import { EmailNotificationDetailPane } from '../email-notification-detail-pane/email-notification-detail-pane';
import { EmailTransactionDetailPane } from '../email-transaction-detail-pane/email-transaction-detail-pane';
import { Divider } from 'primeng/divider';
import { HttpTransactionDetailPane } from '../http-transaction-detail-pane/http-transaction-detail-pane';

@Component({
  selector: 'app-notification-transaction-detail-pane',
  imports: [Button, Tag, RouterLink, DatePipe, EmailTransactionDetailPane, HttpTransactionDetailPane, Divider],
  templateUrl: './notification-transaction-detail-pane.html',
  styleUrl: './notification-transaction-detail-pane.scss',
})
export class NotificationTransactionDetailPane {
  public notificationTransactionDetails = input.required<NotificationTransactionDTO>();
  public emailNotificationTransactionDetails = computed<EmailNotificationTransactionDTO>(() => this.notificationTransactionDetails() as EmailNotificationTransactionDTO);
  public httpNotificationTransactionDetails = computed<HttpNotificationTransactionDTO | null>(() => this.notificationTransactionDetails() as HttpNotificationTransactionDTO);
  public getEnumLabel = getEnumLabel;
  public notificationTypes = NotificationType;
}
