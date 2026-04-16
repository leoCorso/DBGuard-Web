import { DatabaseEngine } from "../enums/database-engines";
import { GuardOperator } from "../enums/guard-operator";
import { GuardState } from "../enums/guard-state";
import { NotificationType } from "../enums/notification-type";
import { DatabaseConnectionDTO } from "./database-connection-dto";
import { CreateGuardNotificationDTO } from "./notification-dto";
import { NotificationProviderDTO } from "./notification-provider-dto";

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

export interface GuardDTO {
    id: number,
    guardName?: string,
    guardDescriptio?: string
}
export interface GuardView {
    id: number,
    guardName?: string,
    createDate: Date,
    lastRun: Date,
    createdByUserId: string,
    userName: string,
    countColumn: string,
    triggerOperator: GuardOperator,
    triggerValue: number,
    databaseConnectionId: number,
    endPoint: string,
    databaseEngine: DatabaseEngine,
    databaseName: string,
    guardState: GuardState,
    isActive: boolean,
    totalErrors: number,
    totalTriggers: number,
    runPeriodInMinutes: number
}

export interface GuardDetailDTO {
    id: number,
    guardName?: string,
    guardDescription?: string,
    createDate: Date,
    lastRun?: Date,
    lastEditedDate: Date,
    createdByUserId: string,
    userName: string,
    triggerQuery: string,
    countColumn: string,
    triggerOperator: GuardOperator,
    triggerValue: number,
    guardState: GuardState,
    isActive: boolean,
    notifyOnClear: boolean,
    notifyOnError: boolean,
    notifyOnTrigger: boolean,
    totalErrors: number,
    totalTriggers: number,
    runPeriodInMinutes: number
}