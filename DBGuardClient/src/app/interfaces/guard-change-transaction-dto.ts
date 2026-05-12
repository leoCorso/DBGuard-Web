import { DatabaseEngine } from "../enums/database-engines";
import { GuardOperator } from "../enums/guard-operator";
import { GuardState } from "../enums/guard-state";

export interface GuardChangeTransactionDTO {
    id: number,
    timestamp: Date,
    guardId?: number,
    guardState: GuardState,
    previousGuardState: GuardState,
    triggerQuery: string,
    triggerOperator: GuardOperator,
    triggerValue: number,
    triggeredValue?: number,
    databaseConnectionId?: number,
    databaseConnectionEndpoint: string,
    databaseName: string,
    databaseConnectionEngine: DatabaseEngine,
    databaseConnectionUsername?: string,
    message?: string
}
export interface GuardChangeItemDTO {
    month: string,
    guardState: GuardState,
    count: number
}