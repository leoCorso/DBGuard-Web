import { Component, inject, input, signal } from '@angular/core';
import { EmailProviderDTO } from '../../../interfaces/notification-provider-dto';
import { AuthService } from '../../../services/auth-service';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-email-provider-detail-pane',
  imports: [Button],
  templateUrl: './email-provider-detail-pane.html',
  styleUrl: './email-provider-detail-pane.scss',
})
export class EmailProviderDetailPane {
  public authService = inject(AuthService);
  public emailProviderDetails = input.required<EmailProviderDTO>();
  public showPassword = signal<boolean>(false);
}
