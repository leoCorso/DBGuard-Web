import { NotificationType } from "../enums/notification-type";
import { NotificationProviderDTO } from "./notification-provider-dto";

export interface CreateGuardNotificationDTO {
    id?: number,
    notificationType: NotificationType
    notificationProvider: NotificationProviderDTO,
    guardId?: number
}
export interface CreateGuardNotificationDTOWIndex extends CreateGuardNotificationDTO { // WIndex includes index for ui edit to work
    index: number
}
export interface CreateEmailGuardNotificationDTO extends CreateGuardNotificationDTO {
    emailSubject: string,
    emailBody: string,
    emails: string[], // [type:email;type:email]
}
export interface CreateEmailGuardNotificationDTOWIndex extends CreateEmailGuardNotificationDTO {
    index: number
}

export interface CreateTextGuardNotificationDTO extends CreateGuardNotificationDTO {
    phoneNumbers: string[],
    textMessage: string
}
export interface CreateTextGuardNotificationDTOWIndex {
    index: number
}
export interface NotificationFormItem {
    id?: number,
    index?: number
}
export interface EmailNotificationFormInfo extends NotificationFormItem {
    emailSubject: string,
    emailBody: string,
    emails: string[], // [type:email;type:email]
}
export interface NotificationTransactionDTO {
    id: number,
    timestamp: Date,
    guardId?: number,
    guardNotificationId?: number,
    notificationType: NotificationType,
    guardChangeTransactionId: number,
    successful: boolean,
    errorMessage?: string
}
export interface EmailNotificationTransactionDTO extends NotificationTransactionDTO {
    emailSubject: string,
    emailBody: string,
    toEmails: string[],
    ccEmails: string[],
    bccEmails: string[]
}
export interface NotificationDetailDTO {
    id: number,
    guardId: number,
    notificationType: NotificationType,
    notificationProviderId: number,
    createDate: Date,
    lastEdited: Date,
    createdByUserId: string,
    createdByUsername: string
}
export interface EmailNotificationDetailDTO extends NotificationDetailDTO {
    emailSubject?: string,
    emailBody?: string,
    toEmails: string[],
    ccEmails: string[],
    bccEmails: string[]
}
export interface GuardNotificationDTO {
    id: number,
    guardId: number,
    notificationType: NotificationType,
    createDate: Date,
    lastEdited: Date,
    notificationProviderId: number,
    createdByUserId: string,
    createdByUsername: string
}