import { Routes } from '@angular/router';
import { HomeWebpage } from './components/home-webpage/home-webpage';
import { loggedInGuard } from './guards/logged-in-guard';
import { LoginWebpage } from './components/login-webpage/login-webpage';
import { notLoggedInGuard } from './guards/not-logged-in-guard';
import { GuardsSectionWrapper } from './components/guard-components/guards-section-wrapper/guards-section-wrapper';
import { ViewGuardsWebpage } from './components/guard-components/view-guards-webpage/view-guards-webpage';
import { GuardDetailWebpage } from './components/guard-components/guard-detail-webpage/guard-detail-webpage';
import { DbConnectionsWebpage } from './components/db-connection-components/db-connections-webpage/db-connections-webpage';
import { GuardsChangeHistoryWebpage } from './components/guard-components/guards-change-history-webpage/guards-change-history-webpage';
import { NotificationTransactionsWebpage } from './components/guard-components/guard-notification-components/notification-transactions-webpage/notification-transactions-webpage';
import { GuardNotificationsWebpage } from './components/guard-components/guard-notification-components/guard-notifications-webpage/guard-notifications-webpage';
import { GuardChangeDetailWebpage } from './components/guard-components/guard-change-detail-webpage/guard-change-detail-webpage';
import { NotificationDetailWebpage } from './components/guard-components/guard-notification-components/notification-detail-webpage/notification-detail-webpage';

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
                path: 'configured-notifications',
                component: GuardNotificationsWebpage
            },
            {
                path: 'notification-config-detail/:id',
                component: NotificationDetailWebpage
            }
        ]
    },
    {
        path: 'db-connections',
        component: DbConnectionsWebpage,
        canActivate: [loggedInGuard]
    }
];
