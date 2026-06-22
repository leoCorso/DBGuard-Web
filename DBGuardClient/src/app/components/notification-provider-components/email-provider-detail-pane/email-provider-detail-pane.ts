import { Component, inject, input, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { EmailProviderDTO } from '../../../interfaces/notification-provider-dto';
import { AuthService } from '../../../services/auth-service';
import { TrackClick } from '../../../directives/track-click';
import { AnalyticsService } from '../../../services/analytics-service';

@Component({
  selector: 'app-email-provider-detail-pane',
  imports: [Button, TrackClick],
  templateUrl: './email-provider-detail-pane.html',
  styleUrl: './email-provider-detail-pane.scss',
})
export class EmailProviderDetailPane {
  public authService = inject(AuthService);
  public emailProviderDetails = input.required<EmailProviderDTO>();
  public showPassword = signal<boolean>(false);
  private analyticsService = inject(AnalyticsService);
  public toggleShowPassword(): void {
    this.showPassword.set(!this.showPassword())
    this.analyticsService.logEvent('toggle_smtp_password', { visible: this.showPassword()});
  }
}
