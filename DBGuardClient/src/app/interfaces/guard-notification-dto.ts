import { NotificationType } from "../enums/notification-type";

export interface GuardNotificationDTO {
    id: number,
    guardId: number,
    notificationType: NotificationType,
    createDate: Date,
    lastEdited: Date,
    notificationProviderId: number,
}