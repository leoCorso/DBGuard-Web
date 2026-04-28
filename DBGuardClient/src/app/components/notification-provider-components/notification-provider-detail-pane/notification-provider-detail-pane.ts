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

@Component({
  selector: 'app-notification-provider-detail-pane',
  imports: [Divider, EmailProviderDetailPane, DatePipe, Button, RouterLink, RouterModule],
  templateUrl: './notification-provider-detail-pane.html',
  styleUrl: './notification-provider-detail-pane.scss',
})
export class NotificationProviderDetailPane implements OnInit, OnDestroy {
  public notificationProviderId = input.required<number>();
  private httpClient = inject(HttpClient);
  private entityChangeService = inject(EntityChangeService);
  public providerDetails = signal<NotificationProviderDTO | null>(null);
  public emailProviderDetails = computed(() => this.providerDetails() as EmailProviderDTO);
  public getEnumLabel = getEnumLabel;
  public notificationTypes = NotificationType;
  private destroy = new Subject<void>();

  ngOnInit(): void {
    this.loadDetailInfo();
    this.entityChangeService.providerEdited.pipe(takeUntil(this.destroy)).subscribe({
      next: (id: number) => {
        if(id === this.notificationProviderId()){
          this.loadDetailInfo();
        }
      }
    })
  }
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
  private loadDetailInfo(): void {
    const url = [environment.api.uri, 'NotificationProviders', 'GetNotificationProviderDetail'].join('/');
    const params = new HttpParams().set('id', this.notificationProviderId());
    this.httpClient.get<NotificationProviderDTO>(url, { params: params }).subscribe({
      next: (providerInfo: NotificationProviderDTO) => {
        this.providerDetails.set(providerInfo);
      }
    })
  }
}
