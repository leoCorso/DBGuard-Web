import { Component, inject, input } from '@angular/core';
import { CreateEmailNotificationProviderDTO, CreateNotificationProviderDTO, NotificationProviderDTO } from '../../../interfaces/notification-provider-dto';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NotificationType } from '../../../enums/notification-type';
import { enumToOptions } from '../../../helper-functions/enum-helper';
import { Select } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { EmailProviderForm } from './email-provider-form/email-provider-form';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { isEmailProvider } from '../../../helper-functions/type-guards';

@Component({
  selector: 'app-create-notification-provider',
  imports: [Select, FloatLabel, ReactiveFormsModule, EmailProviderForm],
  templateUrl: './create-notification-provider.html',
  styleUrl: './create-notification-provider.scss',
})
export class CreateNotificationProvider {
  public notificationProviderToEdit = input<NotificationProviderDTO>();
  public notificationProviderType = new FormControl<NotificationType | null>(null);
  public providers = enumToOptions(NotificationType);
  private httpClient = inject(HttpClient);
  private dialogRef = inject(DynamicDialogRef<NotificationProviderDTO>);

  public createProvider(provider: CreateNotificationProviderDTO): void {
    const url = [environment.api.uri, 'NotificationProviders'];
    this.notificationProviderToEdit() ? url.push('PutNotificationProvider') : url.push('PostNotificationProvider');
    const urlString = url.join('/');
    const request = this.notificationProviderToEdit() ? this.httpClient.put<NotificationProviderDTO>(urlString, provider) : this.httpClient.post<NotificationProviderDTO>(urlString, provider);
    request.subscribe({
      next: (newProvider: NotificationProviderDTO) => {
        this.dialogRef.close(newProvider);
      }
    })
  }
}
