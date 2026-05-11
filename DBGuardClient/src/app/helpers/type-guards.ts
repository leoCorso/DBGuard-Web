import { NotificationType } from "../enums/notification-type";
import { CreateEmailGuardNotificationDTO, CreateGuardNotificationDTO, CreateGuardNotificationDTOWIndex } from "../interfaces/notification-dto";
import { NotificationProviderDTO, EmailProviderDTO } from "../interfaces/notification-provider-dto";

export function isEmailProvider(n: NotificationProviderDTO): n is EmailProviderDTO {
    return n.providerType === NotificationType.Email;
}

export function isCreateEmailNotificationDTO(n: CreateGuardNotificationDTO): n is CreateEmailGuardNotificationDTO {
    return n.notificationType === NotificationType.Email;
}