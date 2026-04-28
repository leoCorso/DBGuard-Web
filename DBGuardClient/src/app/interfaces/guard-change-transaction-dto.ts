import { DatabaseEngine } from "../enums/database-engines";
import { GuardOperator } from "../enums/guard-operator";
import { GuardState } from "../enums/guard-state";

export interface GuardChangeTransactionDTO {
    id: number,
    timestamp: Date,
    guardId?: number,
    guardState: GuardState,
    previousGuardState: GuardState,
    guardQuery: string,
    guardOperator: GuardOperator,
    guardValue: number,
    databaseConnectionId?: number,
    databaseConnectionEndpoint: string,
    databaseName: string,
    databaseConnectionEngine: DatabaseEngine,
    databaseConnectionUsername: string,
    resultValue?: number,
    message?: string
}