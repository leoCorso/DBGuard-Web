import { Routes } from '@angular/router';
import { DashboardWebpage } from './components/dashboard-components/dashboard-webpage/dashboard-webpage';
import { DbConnectionsDetailWebpage } from './components/db-connection-components/db-connections-detail-webpage/db-connections-detail-webpage';
import { DbConnectionsWebpage } from './components/db-connection-components/db-connections-webpage/db-connections-webpage';
import { DbConnectionsWrapper } from './components/db-connection-components/db-connections-wrapper/db-connections-wrapper';
import { GuardChangeDetailWebpage } from './components/guard-components/guard-change-detail-webpage/guard-change-detail-webpage';
import { GuardDetailWebpage } from './components/guard-components/guard-detail-webpage/guard-detail-webpage';
import { GuardNotificationsWebpage } from './components/guard-components/guard-notification-components/guard-notifications-webpage/guard-notifications-webpage';
import { NotificationDetailWebpage } from './components/guard-components/guard-notification-components/notification-detail-webpage/notification-detail-webpage';
import { NotificationTransactionDetailWebpage } from './components/guard-components/guard-notification-components/notification-transaction-detail-webpage/notification-transaction-detail-webpage';
import { NotificationTransactionsWebpage } from './components/guard-components/guard-notification-components/notification-transactions-webpage/notification-transactions-webpage';
import { GuardsChangeHistoryWebpage } from './components/guard-components/guards-change-history-webpage/guards-change-history-webpage';
import { GuardsSectionWrapper } from './components/guard-components/guards-section-wrapper/guards-section-wrapper';
import { ViewGuardsWebpage } from './components/guard-components/view-guards-webpage/view-guards-webpage';
import { LoginWebpage } from './components/login-webpage/login-webpage';
import { NotificationProviderDetailWebpage } from './components/notification-provider-components/notification-provider-detail-webpage/notification-provider-detail-webpage';
import { NotificationProvidersWebpage } from './components/notification-provider-components/notification-providers-webpage/notification-providers-webpage';
import { NotificationProvidersWrapper } from './components/notification-provider-components/notification-providers-wrapper/notification-providers-wrapper';
import { SettingsWebpage } from './components/setting-components/settings-webpage/settings-webpage';
import { UserDetailsWebpage } from './components/user-components/user-details-webpage/user-details-webpage';
import { UsersWebpage } from './components/user-components/users-webpage/users-webpage';
import { UsersWrapper } from './components/user-components/users-wrapper/users-wrapper';
import { isAdminGuardGuard } from './guards/is-admin-guard-guard';
import { loggedInGuard } from './guards/logged-in-guard';
import { notLoggedInGuard } from './guards/not-logged-in-guard';

export const routes: Routes = [
    {
        path: '',
        component: DashboardWebpage,
        canActivate: [loggedInGuard],
        title: 'DBGuard - Dashboard'
    },
    {
        path: 'login',
        component: LoginWebpage,
        canActivate: [notLoggedInGuard],
        title: 'DBGuard - Login'
    },
    {
        path: 'guards',
        loadComponent: () => import('./components/guard-components/guards-section-wrapper/guards-section-wrapper').then(c => c.GuardsSectionWrapper),
        loadChildren: () => import('./components/guard-components/guard.routes').then(g => g.GUARD_ROUTES),
        canActivate: [loggedInGuard],
    },
    {
        path: 'providers',
        loadComponent: () => import('./components/notification-provider-components/notification-providers-wrapper/notification-providers-wrapper').then(p => p.NotificationProvidersWrapper),
        loadChildren: () => import('./components/notification-provider-components/provider.routes').then(p => p.PROVIDER_ROUTES),
        canActivate: [loggedInGuard],
    },
    {
        path: 'db-connections',
        loadComponent: () => import('./components/db-connection-components/db-connections-wrapper/db-connections-wrapper').then(d => d.DbConnectionsWrapper),
        canActivate: [loggedInGuard],
        loadChildren: () => import('./components/db-connection-components/db-connection.routes').then(d => d.DB_CONNECTION_ROUTES),
    },
    {
        path: 'users',
        loadComponent: () => import('./components/user-components/users-wrapper/users-wrapper').then(u => u.UsersWrapper),
        loadChildren: () => import('./components/user-components/user.routes').then(u => u.USER_ROUTES),
        canActivate: [loggedInGuard, isAdminGuardGuard],
    },
    {
        path: 'settings',
        loadComponent: () => import('./components/setting-components/settings-webpage/settings-webpage').then(s => s.SettingsWebpage),
        canActivate: [loggedInGuard],
        title: 'DBGuard - Settings'
    },
    // Fallback route
    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
    }
];
