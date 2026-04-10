import { DatabaseEngine } from "../enums/database-engines";

export interface DatabaseConnectionDTO {
    id?: number,
    endpoint: string,
    databaseEngine: DatabaseEngine,
    databaseName: string,
    username?: string,
}

export interface CreateDatabaseConnectionDTO {
    id?: number,
    endpoint: string,
    databaseEngine: DatabaseEngine,
    databaseName: string,
    username?: string,
    password?: string
}
