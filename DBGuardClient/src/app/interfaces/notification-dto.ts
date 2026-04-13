import { NotificationType } from "../enums/notification-type";
import { NotificationProviderDTO } from "./notification-provider-dto";

export interface CreateGuardNotificationDTO {
    id?: number,
    notificationType: NotificationType
    notificationProvider: NotificationProviderDTO,
}
export interface CreateEmailGuardNotificationDTO extends CreateGuardNotificationDTO {
    emailSubject: string,
    emailBody: string,
    emails: string[], // [type:email;type:email]
}

export interface CreateTextGuardNotificationDTO extends CreateGuardNotificationDTO {
    phoneNumbers: string[],
    textMessage: string
}
export interface EmailMessage {
    emailSubject: string,
    emailBody: string,
    emails: string[], // [type:email;type:email]
}