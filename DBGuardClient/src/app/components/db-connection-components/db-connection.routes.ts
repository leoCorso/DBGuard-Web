import { Route } from "@angular/router";
import { DbConnectionsDetailWebpage } from "./db-connections-detail-webpage/db-connections-detail-webpage";
import { DbConnectionsWebpage } from "./db-connections-webpage/db-connections-webpage";

export const DB_CONNECTION_ROUTES: Route[] = [
    {
        path: 'view-all',
        component: DbConnectionsWebpage,
        title: 'DBGuard - View database connections'
    },
    {
        path: 'detail/:id',
        component: DbConnectionsDetailWebpage,
        title: 'DBGuard - Database connection details'
    }
]