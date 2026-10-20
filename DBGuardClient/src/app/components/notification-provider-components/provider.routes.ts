import { Route } from "@angular/router";
import { NotificationProviderDetailWebpage } from "./notification-provider-detail-webpage/notification-provider-detail-webpage";
import { NotificationProvidersWebpage } from "./notification-providers-webpage/notification-providers-webpage";

export const PROVIDER_ROUTES: Route[] = [
    {
        path: 'view-all',
        component: NotificationProvidersWebpage,
        title: 'DBGuard - View notification providers'
    },
    {
        path: 'detail/:id',
        component: NotificationProviderDetailWebpage,
        title: 'DBGuard - Notification details'
    }
]