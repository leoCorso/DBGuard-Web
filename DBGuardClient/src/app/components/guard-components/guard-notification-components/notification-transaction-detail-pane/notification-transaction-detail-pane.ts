import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { Tag } from 'primeng/tag';
import { NotificationType } from '../../../../enums/notification-type';
import { getEnumLabel } from '../../../../helpers/enum-helper';
import { EmailNotificationTransactionDTO, HttpNotificationTransactionDTO, NotificationTransactionDTO } from '../../../../interfaces/notification-dto';
import { EmailTransactionDetailPane } from '../email-transaction-detail-pane/email-transaction-detail-pane';
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
