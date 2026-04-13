import { NotificationType } from "../enums/notification-type";
import { NotificationProviderDTO, EmailProviderDTO, TextProviderDTO } from "../interfaces/notification-provider-dto";

export function isEmailProvider(n: NotificationProviderDTO): n is EmailProviderDTO {
    return n.providerType === NotificationType.Email;
}

export function isTextProvider(n: NotificationProviderDTO): n is TextProviderDTO {
    return n.providerType === NotificationType.Text;
}
