import { DatabaseEngine } from "../enums/database-engines";

export interface DatabaseConnectionDTO {
    id?: number,
    endpoint: string,
    databaseEngine: DatabaseEngine,
    databaseName: string,
    username?: string,
    password?: string
}

export interface CreateDatabaseConnectionDTO {
    id?: number,
    endpoint: string,
    databaseEngine: DatabaseEngine,
    databaseName: string,
    username?: string,
    password?: string
}