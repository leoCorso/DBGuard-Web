import { HTTPAction } from "../enums/http-action"
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
    password?: string,
    senderEmail: string
}
export interface HTTPProviderDTO extends NotificationProviderDTO {
    httpActionType: HTTPAction
}
export interface CreateNotificationProviderDTO {
    id?: number,
    providerType: NotificationType,
    verifyProvider: boolean
}
export interface CreateEmailNotificationProviderDTO extends CreateNotificationProviderDTO {
    smtpServer: string,
    port: number,
    username: string,
    password: string,
    senderEmail: string
}