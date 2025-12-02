import { Routes } from "@angular/router";
import { authGuard } from "../auth/guard/AuthGuard";
import { MainPage } from "./main-page/main-page";


export const HOME_ROUTES: Routes = [
    { path: 'main-page', component: MainPage, canActivate: [authGuard] },   
];
