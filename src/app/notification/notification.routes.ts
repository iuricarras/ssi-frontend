import { Routes } from "@angular/router";
import { authGuard } from "../auth/guard/AuthGuard";
import { NotificationComponent } from "./components/notification/notification";

export const NOTIFICATION_ROUTES: Routes = [
    { 
        path: '', 
        component: NotificationComponent, 
        canActivate: [authGuard] 
    },
];