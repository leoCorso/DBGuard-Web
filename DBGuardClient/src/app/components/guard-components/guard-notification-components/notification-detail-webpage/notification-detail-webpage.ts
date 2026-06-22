import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ButtonGroup } from 'primeng/buttongroup';
import { Card } from 'primeng/card';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { finalize } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { withDelayedLoading } from '../../../../custom-operators/delayed-loading';
import { GuardDetailDTO } from '../../../../interfaces/guard-dto';
import { GuardNotificationDTO, NotificationDetailDTO } from '../../../../interfaces/notification-dto';
import { NotificationProviderDTO } from '../../../../interfaces/notification-provider-dto';
import { AuthService } from '../../../../services/auth-service';
import { EntityChangeService } from '../../../../services/entity-change-service';
import { NotificationProviderDetailPane } from '../../../notification-provider-components/notification-provider-detail-pane/notification-provider-detail-pane';
import { CreateGuard } from '../../create-guard/create-guard';
import { GuardDetailPane } from '../../guard-detail-pane/guard-detail-pane';
import { GuardNotificationTransactionsTable } from '../guard-notification-transactions-table/guard-notification-transactions-table';
import { NotificationDetailPane } from '../notification-detail-pane/notification-detail-pane';
import { AnalyticsService } from '../../../../services/analytics-service';

@Component({
  selector: 'app-notification-detail-webpage',
  imports: [NotificationDetailPane, Card, RouterModule, GuardNotificationTransactionsTable, 
    NotificationProviderDetailPane, ButtonGroup, Button, TooltipModule, Toast, ConfirmPopup, ProgressSpinner, GuardDetailPane],
  templateUrl: './notification-detail-webpage.html',
  styleUrl: './notification-detail-webpage.scss',
})
export class NotificationDetailWebpage implements OnInit, OnDestroy {
  private httpClient = inject(HttpClient);
  public authService = inject(AuthService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private dialogService = inject(DialogService);
  public notificationConfigId = signal<number | null>(null);
  public notificationDetail = signal<NotificationDetailDTO | null>(null);
  public loadingNotificationTransaction = signal<boolean>(false);
  public deletingNotification = signal<boolean>(false);
  public testingNotification = signal<boolean>(false);
  public guardDetail = signal<GuardDetailDTO | null>(null);
  private editGuardDialog?: DynamicDialogRef<CreateGuard> | null;
  private entityChangeService = inject(EntityChangeService);
  private analyticsService = inject(AnalyticsService);
  public notificationProvider = signal<NotificationProviderDTO | null>(null);

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
    const url = [environment.api.uri, 'Notifications', 'GetNotificationConfigDetail'].join('/');
    const params = new HttpParams()
      .set('notificationId', this.notificationConfigId()!);

      this.httpClient.get<GuardNotificationDTO>(url, { params: params }).pipe(withDelayedLoading((val) => this.loadingNotificationTransaction.set(val))).subscribe({
        next: (notificationInfo: GuardNotificationDTO) => {
          this.notificationDetail.set(notificationInfo);
          this.getGuardDetails();
          this.loadProviderDetail();
        }
      })
  }
  public editGuardNotification(): void {
    this.analyticsService.logEvent('edit_notification_click', { type: this.notificationDetail()?.notificationType });
    this.editGuardDialog = this.dialogService.open(CreateGuard, {
      header: 'Edit guard',
      draggable: true,
      resizable: true,
      closable: true,
      maximizable: true,
      inputValues: {
        guardToEditId: this.notificationDetail()?.guardId
      }
    });
  }
  public deleteClicked(event: Event): void {
    this.analyticsService.logEvent('delete_notification_click', { type: this.notificationDetail()?.notificationType });
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
    this.deletingNotification.set(true);
    const url = [environment.api.uri, 'Notifications', 'DeleteGuardNotification'].join('/');
    const params = new HttpParams().set('notificationId', this.notificationConfigId()!);
    this.httpClient.delete(url, {params: params}).pipe(finalize(() => this.deletingNotification.set(false))).subscribe({
      next: () => {
        this.router.navigate(['/guards/configured-notifications']);
        this.analyticsService.logEvent('notification_delete_submit', {type: this.notificationDetail()?.notificationType});
      }
    })
  }
  public testNotification(): void {
    this.analyticsService.logEvent('test_notification_click', { type: this.notificationDetail()?.notificationType });
    this.testingNotification.set(true);
    const url = [environment.api.uri, 'Notifications', 'TestGuardNotification'].join('/');
    const params = new HttpParams().set('notificationId', this.notificationConfigId()!);
    this.httpClient.post(url, {}, { params: params }).pipe(finalize(() => this.testingNotification.set(false))).subscribe({
      next: () => {
        this.messageService.add({summary: 'Notification sent', detail: 'The notification was processed and should be received', key: 'notification-toast', severity: 'success'})
      }
    });
  }
  private getGuardDetails(): void {
    // Called if change has a guard id
    const url =   [environment.api.uri, 'Guards', 'GetGuardDetail', this.notificationDetail()!.guardId].join('/');
    this.httpClient.get<GuardDetailDTO>(url).subscribe({
      next: (guardDetail: GuardDetailDTO) => {
        this.guardDetail.set(guardDetail);
      }
    })
  }
  private loadProviderDetail(): void {
    const url = [environment.api.uri, 'NotificationProviders', 'GetNotificationProviderDetail'].join('/');
    const params = new HttpParams().set('id', this.notificationDetail()?.notificationProviderId!);
    this.httpClient.get<NotificationProviderDTO>(url, { params: params }).subscribe({
      next: (providerInfo: NotificationProviderDTO) => {
        this.notificationProvider.set(providerInfo);
      }
    })
  }
}
