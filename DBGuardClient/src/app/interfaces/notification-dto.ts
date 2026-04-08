import { NotificationType } from "../enums/notification-type";
import { DatabaseConnectionDTO } from "./database-connection-dto";

export interface NotificationProviderDTO {
    id: number,
    notificationType: NotificationType
}
export interface EmailProviderDTO extends NotificationProviderDTO {
    smtpServer: string,
    username: string,
    port: number
}
export interface TextProviderDTO extends NotificationProviderDTO {
    phoneNumber: string
}
export interface CreateGuardNotificationDTO {
    notificationType: NotificationType
    notificationProvider: NotificationProviderDTO,
}
export interface CreateEmailGuardNotificationDTO extends CreateGuardNotificationDTO {
    emailSubject: string,
    emailBody: string,
    toEmails: string[],
    ccEmails: string[],
    bccEmails: string[]
}
export interface CreateTextGuardNotificationDTO extends CreateEmailGuardNotificationDTO {
    phoneNumbers: string[],
    textMessage: string
}
