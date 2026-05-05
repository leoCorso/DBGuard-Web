import { OutputEmitterRef, InputSignal, output, Component, input } from "@angular/core"
import { NotificationProviderDTO } from "../../../../interfaces/notification-provider-dto"

@Component({
  selector: 'app-create-notification',
  imports: [],
  template: '',
  styles: '',
})
export abstract class CreateNotification<CreateType, CreateTypeWIndex>{
    public notificationAdded = output<CreateType>();
    public notificationEdited = output<CreateTypeWIndex>();
    public cancelForm = output<void>();
    public notificationToEdit = input<CreateTypeWIndex>();
    public notificationProvider = input.required<NotificationProviderDTO>();
    public abstract saveNotification(): void;
}