import { Routes } from "@angular/router";
import { HomeLogin } from "./pages/home-login/home-login";
import { UserLogin } from "./pages/user-login/user-login";
import { AccreditingAgencyLogin } from "./pages/accrediting-agency-login/accrediting-agency-login";
import { UserRegisterComponent } from "../register/components/user-register/user-register";


/**
 * AUTH_ROUTES
 * Conjunto de rotas responsáveis pela autenticação e registo de utilizadores.
 * Cada entrada define o caminho da URL e o componente que será renderizado.
 */
export const AUTH_ROUTES: Routes = [
    { path: 'home-login', component: HomeLogin },
    { path: 'user-login', component: UserLogin },
    { path: 'accrediting-agency-login', component: AccreditingAgencyLogin },
    { path: "user-register", component: UserRegisterComponent }


];
