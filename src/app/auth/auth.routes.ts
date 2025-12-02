import { Routes } from "@angular/router";
import { HomeLogin } from "./pages/home-login/home-login";
import { UserLogin } from "./pages/user-login/user-login";
import { AccreditingAgencyLogin } from "./pages/accrediting-agency-login/accrediting-agency-login";
import { MainPage } from "../home/main-page/main-page";
import { authGuard } from "./guard/AuthGuard";
import { UserRegisterComponent } from "../register/components/user-register/user-register";



export const AUTH_ROUTES: Routes = [
    { path: 'home-login', component: HomeLogin },
    { path: 'main-page', component: MainPage, canActivate: [authGuard] },   
    { path: 'user-login', component: UserLogin },
    { path: 'accrediting-agency-login', component: AccreditingAgencyLogin },
    { path: "user-register", component: UserRegisterComponent }


];
