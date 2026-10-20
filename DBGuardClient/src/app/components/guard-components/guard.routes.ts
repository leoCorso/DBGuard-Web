import { Route } from "@angular/router";
import { GuardChangeDetailWebpage } from "./guard-change-detail-webpage/guard-change-detail-webpage";
import { GuardDetailWebpage } from "./guard-detail-webpage/guard-detail-webpage";
import { GuardNotificationsWebpage } from "./guard-notification-components/guard-notifications-webpage/guard-notifications-webpage";
import { NotificationDetailWebpage } from "./guard-notification-components/notification-detail-webpage/notification-detail-webpage";
import { NotificationTransactionDetailWebpage } from "./guard-notification-components/notification-transaction-detail-webpage/notification-transaction-detail-webpage";
import { NotificationTransactionsWebpage } from "./guard-notification-components/notification-transactions-webpage/notification-transactions-webpage";
import { GuardsChangeHistoryWebpage } from "./guards-change-history-webpage/guards-change-history-webpage";
import { ViewGuardsWebpage } from "./view-guards-webpage/view-guards-webpage";

export const GUARD_ROUTES: Route[] = [
    {
        path: 'view-all',
        component: ViewGuardsWebpage,
        title: 'DBGuard - View guards'
    },
    {
        path: 'detail/:id',
        component: GuardDetailWebpage,
        title: 'DBGuard - Guard detail'
    },
    {
        path: 'change-history',
        component: GuardsChangeHistoryWebpage,
        title: 'DBGuard - View guard changes'
    },
    {
        path: 'history-detail/:id',
        component: GuardChangeDetailWebpage,
        title: 'DBGuard - Guard change detail'
    },
    {
        path: 'notification-transactions',
        component: NotificationTransactionsWebpage,
        title: 'DBGuard - Notification transactions'
    },
    {
        path: 'notification-transaction-detail/:id',
        component: NotificationTransactionDetailWebpage,
        title: 'DBGuard - Notification transaction detail'
    },
    {
        path: 'configured-notifications',
        component: GuardNotificationsWebpage,
        title: 'DBGuard - Configured notifications'
    },
    {
        path: 'notification-config-detail/:id',
        component: NotificationDetailWebpage,
        title: 'DBGuard - Notification details'
    }
]