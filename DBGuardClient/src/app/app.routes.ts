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
        canActivate: [loggedInGuard]
    },
    {
        path: 'login',
        component: LoginWebpage,
        canActivate: [notLoggedInGuard]
    },
    {
        path: 'guards',
        component: GuardsSectionWrapper,
        canActivate: [loggedInGuard],
        children: [
            {
                path: 'view-all',
                component: ViewGuardsWebpage
            },
            {
                path: 'detail/:id',
                component: GuardDetailWebpage
            },
            {
                path: 'change-history',
                component: GuardsChangeHistoryWebpage
            },
            {
                path: 'history-detail/:id',
                component: GuardChangeDetailWebpage
            },
            {
                path: 'notification-transactions',
                component: NotificationTransactionsWebpage
            },
            {
                path: 'notification-transaction-detail/:id',
                component: NotificationTransactionDetailWebpage
            },
            {
                path: 'configured-notifications',
                component: GuardNotificationsWebpage
            },
            {
                path: 'notification-config-detail/:id',
                component: NotificationDetailWebpage
            }
        ],
    },
    {
        path: 'providers',
        component: NotificationProvidersWrapper,
        canActivate: [loggedInGuard],
        children: [
            {
                path: 'view-all',
                component: NotificationProvidersWebpage
            },
            {
                path: 'detail/:id',
                component: NotificationProviderDetailWebpage
            }
        ]
    },
    {
        path: 'db-connections',
        component: DbConnectionsWrapper,
        canActivate: [loggedInGuard],
        children: [
            {
                path: 'view-all',
                component: DbConnectionsWebpage
            },
            {
                path: 'detail/:id',
                component: DbConnectionsDetailWebpage
            }
        ]
    },
    {
        path: 'users',
        component: UsersWrapper,
        canActivate: [loggedInGuard, isAdminGuardGuard],
        children: [
            {
                path: 'view-all',
                component: UsersWebpage
            },
            {
                path: 'detail/:id',
                component: UserDetailsWebpage
            }
        ]
    },
    {
        path: 'settings',
        component: SettingsWebpage,
        canActivate: [loggedInGuard]
    }
];
