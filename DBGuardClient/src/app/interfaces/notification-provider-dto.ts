import { NotificationType } from "../enums/notification-type"

export interface NotificationProviderDTO {
    id: number,
    providerType: NotificationType,
    createDate: Date,
    lastEdited: Date,
    createdByUserId: string,
    createdByUsername: string
}
export interface EmailProviderDTO extends NotificationProviderDTO {
    smtpServer: string,
    username: string,
    port: number,
    password?: string
}
export interface TextProviderDTO extends NotificationProviderDTO {
    phoneNumber: string
}
export interface CreateNotificationProviderDTO {
    id?: number,
    providerType: NotificationType
}
export interface CreateEmailNotificationProviderDTO extends CreateNotificationProviderDTO {
    smtpServer: string,
    port: number,
    username: string,
    password: string
}