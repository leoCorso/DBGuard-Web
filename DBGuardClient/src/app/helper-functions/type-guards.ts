import { NotificationType } from "../enums/notification-type";
import { CreateEmailGuardNotificationDTO, CreateGuardNotificationDTO } from "../interfaces/notification-dto";
import { NotificationProviderDTO, EmailProviderDTO, TextProviderDTO } from "../interfaces/notification-provider-dto";

export function isEmailProvider(n: NotificationProviderDTO): n is EmailProviderDTO {
    return n.providerType === NotificationType.Email;
}

export function isTextProvider(n: NotificationProviderDTO): n is TextProviderDTO {
    return n.providerType === NotificationType.Text;
}

export function isCreateEmailNotificationDTO(n: CreateGuardNotificationDTO): n is CreateEmailGuardNotificationDTO {
    return n.notificationType === NotificationType.Email;
}