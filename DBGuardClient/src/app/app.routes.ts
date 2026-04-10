import { Routes } from '@angular/router';
import { HomeWebpage } from './components/home-webpage/home-webpage';
import { loggedInGuard } from './guards/logged-in-guard';
import { LoginWebpage } from './components/login-webpage/login-webpage';
import { notLoggedInGuard } from './guards/not-logged-in-guard';
import { GuardsWebpage } from './components/guards-webpage/guards-webpage';
import { ViewGuards } from './components/guards-webpage/view-guards/view-guards';
import { GuardDetail } from './components/guards-webpage/guard-detail/guard-detail';
import { DbConnectionsWebpage } from './components/db-connections-webpage/db-connections-webpage';

export const routes: Routes = [
    {
        path: '',
        component: HomeWebpage,
        canActivate: [loggedInGuard]
    },
    {
        path: 'login',
        component: LoginWebpage,
        canActivate: [notLoggedInGuard]
    },
    {
        path: 'guards',
        component: GuardsWebpage,
        canActivate: [loggedInGuard],
        children: [
            {
                path: 'view-guards',
                component: ViewGuards
            },
            {
                path: 'guard-detail/:id',
                component: GuardDetail
            }
        ]
    },
    {
        path: 'db-connections',
        component: DbConnectionsWebpage,
        canActivate: [loggedInGuard]
    }
];
