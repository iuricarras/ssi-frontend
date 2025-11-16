import { Routes } from "@angular/router";
import { HomeLogin } from "./components/home-login/home-login";
import { UserLogin } from "./components/user-login/user-login";
import { AccreditingAgencyLogin } from "./components/accrediting-agency-login/accrediting-agency-login";


export const AUTH_ROUTES: Routes = [
    { path: 'home-login', component: HomeLogin },    
    { path: 'user-login', component: UserLogin },
    { path: 'accrediting-agency-login', component: AccreditingAgencyLogin }
];
