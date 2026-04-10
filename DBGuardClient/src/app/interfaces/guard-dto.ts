import { GuardOperator } from "../enums/guard-operator";
import { NotificationType } from "../enums/notification-type";
import { DatabaseConnectionDTO } from "./database-connection-dto";
import { CreateGuardNotificationDTO, EmailProviderDTO, NotificationProviderDTO, TextProviderDTO } from "./notification-dto";

export interface CreateGuardDTO {
    id?: number,
    guardName?: string,
    guardDescription?: string,
    triggerQuery: string,
    countColumn: string,
    triggerOperator: GuardOperator
    triggerValue: number,
    databaseConnection: DatabaseConnectionDTO,
    notifyOnClear: boolean,
    notifyOnError: boolean,
    notifyOnTrigger: boolean,
    runPeriodInMinutes: number,
    notifications: CreateGuardNotificationDTO[]
}

export interface CreateGuardReferenceData {
    databaseConnections: DatabaseConnectionDTO[],
    notificationProviders: NotificationProviderDTO[]
}