import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { environment } from '../../../../environments/environment';
import { withDelayedLoading } from '../../../custom-operators/delayed-loading';
import { NotificationType } from '../../../enums/notification-type';
import { NotificationProviderDTO } from '../../../interfaces/notification-provider-dto';
import { AuthService } from '../../../services/auth-service';
import { GuardNotificationsTable } from '../../guard-components/guard-notification-components/guard-notifications-table/guard-notifications-table';
import { CreateNotificationProvider } from '../create-notification-provider/create-notification-provider';
import { NotificationProviderDetailPane } from '../notification-provider-detail-pane/notification-provider-detail-pane';

@Component({
  selector: 'app-notification-provider-detail-webpage',
  imports: [NotificationProviderDetailPane, Card, GuardNotificationsTable, Button, ButtonGroup, ConfirmPopup, TooltipModule, Toast, ProgressSpinner],
  templateUrl: './notification-provider-detail-webpage.html',
  styleUrl: './notification-provider-detail-webpage.scss',
})
export class NotificationProviderDetailWebpage implements OnInit, OnDestroy {
  public providerId = signal<number | null>(null);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private dialogService = inject(DialogService);
  private httpClient = inject(HttpClient);
  private messageService = inject(MessageService);
  public authService = inject(AuthService);
  private editProviderDialog?: DynamicDialogRef<CreateNotificationProvider> | null;
  public notificationProvider = signal<NotificationProviderDTO | null>(null);
  public notificationTypes = NotificationType;
  public loadingProvider = signal<boolean>(false);
  public deletingProvider = signal<boolean>(false);
  public testingProvider = signal<boolean>(false);

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if(id === null){
      this.router.navigate(['/providers/view-all']);
    }
    this.providerId.set(parseInt(id!));
    this.loadProviderDetail();
  }
  ngOnDestroy(): void {
    this.editProviderDialog?.close();
  }
  public deleteProviderClicked(event: Event): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the provider?',
      target: event.currentTarget as EventTarget,
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger'
      },
      accept: () => this.deleteProvider(),
      reject: () => {return}
    });
  }
  private deleteProvider(): void {
    this.deletingProvider.set(true);
    const url = [environment.api.uri, 'NotificationProviders', 'DeleteProvider'].join('/');
    const params = new HttpParams().set('providerId', this.providerId()!);
    this.httpClient.delete(url, { params: params }).pipe(finalize(() => this.deletingProvider.set(false))).subscribe(() => {
      this.router.navigate(['/providers/view-all']);
    });
  }
  public editProvider(): void {
    this.editProviderDialog = this.dialogService.open(CreateNotificationProvider, {
      header: 'Edit provider',
      draggable: true,
      closable: true,
      maximizable: true,
      inputValues: {
        notificationProviderIdToEdit: this.providerId()
      }
    });
  }
  public testProvider(): void {
    this.testingProvider.set(true);
    const url = [environment.api.uri, 'NotificationProviders', 'TestNotificationProvider'].join('/');
    const params = new HttpParams().set('providerId', this.providerId()!);
    this.httpClient.post(url, {}, { params: params }).pipe(finalize(() => this.testingProvider.set(false))).subscribe({
      next: () => {
        this.messageService.add({summary: 'Provider working', detail: 'The provider is working and can be used to send notifications', key: 'provider-toast', severity: 'success'});
      }
    })
  }
  private loadProviderDetail(): void {
    const url = [environment.api.uri, 'NotificationProviders', 'GetNotificationProviderDetail'].join('/');
    const params = new HttpParams().set('id', this.providerId()!);
    this.httpClient.get<NotificationProviderDTO>(url, { params: params }).pipe(withDelayedLoading((val) => this.loadingProvider.set(val))).subscribe({
      next: (providerInfo: NotificationProviderDTO) => {
        this.notificationProvider.set(providerInfo);
      }
    })
  }
}
