import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, computed, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { EmailProviderDTO, NotificationProviderDTO } from '../../../interfaces/notification-provider-dto';
import { environment } from '../../../../environments/environment.development';
import { getEnumLabel } from '../../../helper-functions/enum-helper';
import { NotificationType } from '../../../enums/notification-type';
import { DatePipe } from '@angular/common';
import { Button } from 'primeng/button';
import { RouterLink, RouterModule } from "@angular/router";
import { EmailProviderDetailPane } from '../email-provider-detail-pane/email-provider-detail-pane';
import { Divider } from 'primeng/divider';
import { EntityChangeService } from '../../../services/entity-change-service';
import { merge, Subject, takeUntil } from 'rxjs';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-notification-provider-detail-pane',
  imports: [Divider, EmailProviderDetailPane, DatePipe, Button, RouterLink, RouterModule, ProgressSpinner, Tag],
  templateUrl: './notification-provider-detail-pane.html',
  styleUrl: './notification-provider-detail-pane.scss',
})
export class NotificationProviderDetailPane implements OnInit, OnDestroy {
  public notificationProvider = input.required<NotificationProviderDTO>();
  private entityChangeService = inject(EntityChangeService);
  public emailProviderDetails = computed(() => this.notificationProvider() as EmailProviderDTO);
  public getEnumLabel = getEnumLabel;
  public notificationTypes = NotificationType;
  private destroy = new Subject<void>();
  public loadingProvider = signal<boolean>(false);

  ngOnInit(): void {

  }
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
