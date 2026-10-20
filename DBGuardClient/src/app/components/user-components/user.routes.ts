import { Route } from "@angular/router";
import { UserDetailsWebpage } from "./user-details-webpage/user-details-webpage";
import { UsersWebpage } from "./users-webpage/users-webpage";

export const USER_ROUTES: Route[] = [
    {
        path: 'view-all',
        component: UsersWebpage,
        title: 'DBGuard - View users'
    },
    {
        path: 'detail/:id',
        component: UserDetailsWebpage,
        title: 'DBGuard - User details'
    }
]