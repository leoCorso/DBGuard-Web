import { Component, inject, OnInit, signal } from '@angular/core';
import { NotificationProviderDetailPane } from '../notification-provider-detail-pane/notification-provider-detail-pane';
import { ActivatedRoute, Router } from '@angular/router';
import { Card } from 'primeng/card';
import { GuardNotificationsTable } from '../../guard-components/guard-notification-components/guard-notifications-table/guard-notifications-table';
import { Button } from 'primeng/button';
import { ButtonGroup } from 'primeng/buttongroup';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { CreateNotificationProvider } from '../create-notification-provider/create-notification-provider';
import { environment } from '../../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-notification-provider-detail-webpage',
  imports: [NotificationProviderDetailPane, Card, GuardNotificationsTable, Button, ButtonGroup, ConfirmPopup],
  templateUrl: './notification-provider-detail-webpage.html',
  styleUrl: './notification-provider-detail-webpage.scss',
})
export class NotificationProviderDetailWebpage implements OnInit {
  public providerId = signal<number | null>(null);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private dialogService = inject(DialogService);
  private httpClient = inject(HttpClient);
  public authService = inject(AuthService);

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if(id === null){
      this.router.navigate(['/providers/view-all']);
    }
    this.providerId.set(parseInt(id!));
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
    const url = [environment.api.uri, 'NotificationProviders', 'DeleteProvider'].join('/');
    const params = new HttpParams().set('providerId', this.providerId()!);
    this.httpClient.delete(url, { params: params }).subscribe(() => {
      this.router.navigate(['/providers/view-all']);
    });
  }
  public editProvider(): void {
    this.dialogService.open(CreateNotificationProvider, {
      header: 'Edit provider',
      draggable: true,
      closable: true,
      maximizable: true,
      inputValues: {
        notificationProviderIdToEdit: this.providerId()
      }
    });
  }
}
