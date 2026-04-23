import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { EmailNotificationDetailPane } from '../email-notification-detail-pane/email-notification-detail-pane';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { DatePipe } from '@angular/common';
import { GuardNotificationTransactionsTable } from '../guard-notification-transactions-table/guard-notification-transactions-table';
import { environment } from '../../../../../environments/environment.development';
import { NotificationType } from '../../../../enums/notification-type';
import { getEnumLabel } from '../../../../helper-functions/enum-helper';
import { GuardNotificationDTO } from '../../../../interfaces/guard-notification-dto';
import { NotificationDetailDTO, EmailNotificationDetailDTO } from '../../../../interfaces/notification-dto';
import { GuardDbConnectionDetailPane } from '../../../db-connection-components/guard-db-connection-detail-pane/guard-db-connection-detail-pane';
import { NotificationDetailPane } from '../notification-detail-pane/notification-detail-pane';
import { NotificationProviderDetailPane } from '../../../notification-provider-components/notification-provider-detail-pane/notification-provider-detail-pane';

@Component({
  selector: 'app-notification-detail-webpage',
  imports: [NotificationDetailPane, Card, RouterModule, GuardNotificationTransactionsTable, NotificationProviderDetailPane],
  templateUrl: './notification-detail-webpage.html',
  styleUrl: './notification-detail-webpage.scss',
})
export class NotificationDetailWebpage implements OnInit {
  private httpClient = inject(HttpClient);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  public notificationConfigId = signal<number | null>(null);
  public notificationDetail = signal<NotificationDetailDTO | null>(null);

  ngOnInit(): void {
      const id = this.activatedRoute.snapshot.paramMap.get('id');
      if(!id){
        this.router.navigate(['/guards/configured-notifications']);
      }
      this.notificationConfigId.set(Number(id));
      this.loadInitialData();
  }
  private loadInitialData(): void {
    const url = [environment.api.uri, 'Notifications', 'GetNotificationConfigDetail'].join('/');
    const params = new HttpParams()
      .set('id', this.notificationConfigId()!);

      this.httpClient.get<GuardNotificationDTO>(url, { params: params }).subscribe({
        next: (notificationInfo: GuardNotificationDTO) => {
          this.notificationDetail.set(notificationInfo);
        }
      })
  }
}
