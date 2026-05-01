import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { EmailNotificationDetailPane } from '../email-notification-detail-pane/email-notification-detail-pane';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { DatePipe } from '@angular/common';
import { GuardNotificationTransactionsTable } from '../guard-notification-transactions-table/guard-notification-transactions-table';
import { environment } from '../../../../../environments/environment.development';
import { NotificationType } from '../../../../enums/notification-type';
import { getEnumLabel } from '../../../../helper-functions/enum-helper';
import { NotificationDetailDTO, EmailNotificationDetailDTO, GuardNotificationDTO } from '../../../../interfaces/notification-dto';
import { DbConnectionDetailPane } from '../../../db-connection-components/db-connection-detail-pane/db-connection-detail-pane';
import { NotificationDetailPane } from '../notification-detail-pane/notification-detail-pane';
import { NotificationProviderDetailPane } from '../../../notification-provider-components/notification-provider-detail-pane/notification-provider-detail-pane';
import { ButtonGroup } from 'primeng/buttongroup';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateGuard } from '../../create-guard/create-guard';
import { ProgressSpinner } from 'primeng/progressspinner';
import { EntityChangeService } from '../../../../services/entity-change-service';

@Component({
  selector: 'app-notification-detail-webpage',
  imports: [NotificationDetailPane, Card, RouterModule, GuardNotificationTransactionsTable, NotificationProviderDetailPane, ButtonGroup, Button, TooltipModule, Toast, ConfirmPopup, ProgressSpinner],
  templateUrl: './notification-detail-webpage.html',
  styleUrl: './notification-detail-webpage.scss',
})
export class NotificationDetailWebpage implements OnInit, OnDestroy {
  private httpClient = inject(HttpClient);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private dialogService = inject(DialogService);
  public notificationConfigId = signal<number | null>(null);
  public notificationDetail = signal<NotificationDetailDTO | null>(null);
  public loadingNotificationTransaction = signal<boolean>(true);
  private editGuardDialog?: DynamicDialogRef<CreateGuard> | null;
  private entityChangeService = inject(EntityChangeService);

  ngOnInit(): void {
      const id = this.activatedRoute.snapshot.paramMap.get('id');
      if(!id){
        this.router.navigate(['/guards/configured-notifications']);
      }
      this.notificationConfigId.set(Number(id));
      this.entityChangeService.guardEdited.subscribe(guardId => {
        if(this.notificationDetail()?.guardId === guardId){
          this.loadInitialData();
        }
      })
      this.loadInitialData();
  }
  ngOnDestroy(): void {
    this.editGuardDialog?.close();
  }
  private loadInitialData(): void {
    this.loadingNotificationTransaction.set(true);
    const url = [environment.api.uri, 'Notifications', 'GetNotificationConfigDetail'].join('/');
    const params = new HttpParams()
      .set('notificationId', this.notificationConfigId()!);

      this.httpClient.get<GuardNotificationDTO>(url, { params: params }).subscribe({
        next: (notificationInfo: GuardNotificationDTO) => {
          this.notificationDetail.set(notificationInfo);
          this.loadingNotificationTransaction.set(false);
        }
      })
  }
  public editGuardNotification(): void {
    this.editGuardDialog = this.dialogService.open(CreateGuard, {
      header: 'Edit guard',
      draggable: true,
      resizable: true,
      closable: true,
      maximizable: true,
      inputValues: {
        guardToEditId: this.notificationDetail()?.guardId
      }
    })
  }
  public deleteClicked(event: Event): void {
    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,
      message: 'Are you sure you want to delete the notification for this guard?',
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        outlined: true,
        severity: 'secondary'
      },
      acceptButtonProps: {
        severity: 'danger'
      },
      reject: () => {},
      accept: () => this.deleteNotification()
    })
  }
  private deleteNotification(): void {
    const url = [environment.api.uri, 'Notifications', 'DeleteGuardNotification'].join('/');
    const params = new HttpParams().set('notificationId', this.notificationConfigId()!);
    this.httpClient.delete(url, {params: params}).subscribe({
      next: () => {
        this.router.navigate(['/guards/configured-notifications']);
      }
    })
  }
  public testNotification(): void {
    const url = [environment.api.uri, 'Notifications', 'TestGuardNotification'].join('/');
    const params = new HttpParams().set('notificationId', this.notificationConfigId()!);
    this.httpClient.post(url, {}, { params: params }).subscribe({
      next: () => {
        this.messageService.add({summary: 'Notification sent', detail: 'The notification was processed and should be received', key: 'notification-toast', severity: 'success'})
      }
    });
  }
}
