import { Component, inject, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationProviderToolbar } from '../notification-provider-toolbar/notification-provider-toolbar';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateNotificationProvider } from '../create-notification-provider/create-notification-provider';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-notification-providers-wrapper',
  imports: [RouterOutlet, NotificationProviderToolbar],
  templateUrl: './notification-providers-wrapper.html',
  styleUrl: './notification-providers-wrapper.scss',
})
export class NotificationProvidersWrapper implements OnDestroy {
  private dialogService = inject(DialogService);
  public authService = inject(AuthService);
  private createProviderDialog?: DynamicDialogRef<CreateNotificationProvider> | null;
  ngOnDestroy(): void {
    this.createProviderDialog?.close();
  }
  public createNotificationProvider(): void {
    this.createProviderDialog = this.dialogService.open(CreateNotificationProvider, {
      header: 'Create notification provider',
      draggable: true,
      closable: true,
      resizable: true,
      maximizable: true
    });
  }
}
