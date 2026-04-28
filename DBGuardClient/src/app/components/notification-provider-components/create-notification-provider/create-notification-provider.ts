import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { CreateEmailNotificationProviderDTO, CreateNotificationProviderDTO, NotificationProviderDTO } from '../../../interfaces/notification-provider-dto';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NotificationType } from '../../../enums/notification-type';
import { enumToOptions } from '../../../helper-functions/enum-helper';
import { Select } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { EmailProviderForm } from './email-provider-form/email-provider-form';
import { environment } from '../../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { isEmailProvider } from '../../../helper-functions/type-guards';
import { EntityChangeService } from '../../../services/entity-change-service';

@Component({
  selector: 'app-create-notification-provider',
  imports: [Select, FloatLabel, ReactiveFormsModule, EmailProviderForm],
  templateUrl: './create-notification-provider.html',
  styleUrl: './create-notification-provider.scss',
})
export class CreateNotificationProvider implements OnInit {
  public notificationProviderToEdit = signal<CreateNotificationProviderDTO | null>(null);
  public notificationProviderIdToEdit = input<number>();
  public emailProviderToEdit = computed<CreateEmailNotificationProviderDTO>(() => this.notificationProviderToEdit() as CreateEmailNotificationProviderDTO);
  public notificationProviderType = new FormControl<NotificationType | null>(null);
  public providers = enumToOptions(NotificationType);
  private httpClient = inject(HttpClient);
  private dialogRef = inject(DynamicDialogRef<NotificationProviderDTO>);
  private entityChangeService = inject(EntityChangeService);

  ngOnInit(): void {
    if(this.notificationProviderIdToEdit()){
      this.getProviderToEdit();
    }
  }
  public saveProvider(provider: CreateNotificationProviderDTO): void {
    const url = [environment.api.uri, 'NotificationProviders'];
    this.notificationProviderToEdit() ? url.push('PutNotificationProvider') : url.push('PostNotificationProvider');
    const urlString = url.join('/');
    const request = this.notificationProviderToEdit() ? this.httpClient.put<NotificationProviderDTO>(urlString, provider) : this.httpClient.post<NotificationProviderDTO>(urlString, provider);
    request.subscribe({
      next: (newProvider: NotificationProviderDTO) => {
        if(this.notificationProviderToEdit()){
          this.entityChangeService.providerEdited.next(newProvider.id);
        }
        else {
          this.entityChangeService.providerCreated.next(newProvider.id);
        }
        this.dialogRef.close(newProvider);
      }
    })
  }
  private getProviderToEdit(): void {
    const url = [environment.api.uri, 'NotificationProviders', 'GetProviderToEdit'].join('/');
    const params = new HttpParams().set('providerId', this.notificationProviderIdToEdit()!);
    this.httpClient.get<CreateNotificationProviderDTO>(url, { params: params }).subscribe({
      next: (providerToEdit : CreateNotificationProviderDTO) => {
        this.notificationProviderToEdit.set(providerToEdit);
        switch(this.notificationProviderToEdit()?.providerType){
          case NotificationType.Email:
            this.notificationProviderType.patchValue(NotificationType.Email);
            break;
        }
        this.notificationProviderType.disable();
      }
    })
  }
}
