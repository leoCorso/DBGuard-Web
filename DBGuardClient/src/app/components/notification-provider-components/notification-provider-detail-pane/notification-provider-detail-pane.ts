import { DatePipe } from '@angular/common';
import { Component, computed, input, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterModule } from "@angular/router";
import { Button } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { Tag } from 'primeng/tag';
import { Subject } from 'rxjs';
import { NotificationType } from '../../../enums/notification-type';
import { getEnumLabel } from '../../../helpers/enum-helper';
import { EmailProviderDTO, NotificationProviderDTO } from '../../../interfaces/notification-provider-dto';
import { EmailProviderDetailPane } from '../email-provider-detail-pane/email-provider-detail-pane';

@Component({
  selector: 'app-notification-provider-detail-pane',
  imports: [Divider, EmailProviderDetailPane, DatePipe, Button, RouterLink, RouterModule, Tag],
  templateUrl: './notification-provider-detail-pane.html',
  styleUrl: './notification-provider-detail-pane.scss',
})
export class NotificationProviderDetailPane implements OnInit, OnDestroy {
  public notificationProvider = input.required<NotificationProviderDTO>();
  public emailProviderDetails = computed(() => this.notificationProvider() as EmailProviderDTO);
  public getEnumLabel = getEnumLabel;
  public notificationTypes = NotificationType;
  private destroy = new Subject<void>();

  ngOnInit(): void {

  }
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
