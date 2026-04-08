import { NotificationType } from "../enums/notification-type";
import { EmailProviderDTO, NotificationProviderDTO, TextProviderDTO } from "../interfaces/notification-dto";

export function isEmailProvider(n: NotificationProviderDTO): n is EmailProviderDTO {
    return n.notificationType === NotificationType.Email;
}
export function isTextProvider(n: NotificationProviderDTO): n is TextProviderDTO {
    return n.notificationType === NotificationType.Text;
}
