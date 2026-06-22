import { Component, DestroyRef, inject, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthService } from '../../../services/auth-service';
import { CreateNotificationProvider } from '../create-notification-provider/create-notification-provider';
import { NotificationProviderToolbar } from '../notification-provider-toolbar/notification-provider-toolbar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationProviderDTO } from '../../../interfaces/notification-provider-dto';
import { AnalyticsService } from '../../../services/analytics-service';

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
  private destroyRef = inject(DestroyRef);
  private analyticsService = inject(AnalyticsService);

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
    this.createProviderDialog?.onClose.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (provider: NotificationProviderDTO | null) => {
        if(!provider){
          this.analyticsService.logEvent('create_provider_cancelled');
        }
      }
    })
  }
}
