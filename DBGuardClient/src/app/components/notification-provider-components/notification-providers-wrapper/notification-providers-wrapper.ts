import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationProviderToolbar } from '../notification-provider-toolbar/notification-provider-toolbar';
import { DialogService } from 'primeng/dynamicdialog';
import { CreateNotificationProvider } from '../create-notification-provider/create-notification-provider';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-notification-providers-wrapper',
  imports: [RouterOutlet, NotificationProviderToolbar],
  templateUrl: './notification-providers-wrapper.html',
  styleUrl: './notification-providers-wrapper.scss',
})
export class NotificationProvidersWrapper {
  private dialogService = inject(DialogService);
  public authService = inject(AuthService);
  public createNotificationProvider(): void {
    this.dialogService.open(CreateNotificationProvider, {
      header: 'Create notification provider',
      draggable: true,
      closable: true,
      resizable: true,
      maximizable: true
    });
  }
}
