import { Routes } from "@angular/router";
import { authGuard } from "../auth/guard/AuthGuard";
import { MainPage } from "./main-page/main-page";

/**
 * HOME_ROUTES
 * Conjunto de rotas principais da aplicação.
 * Define o caminho para a página inicial (main-page),
 * Se o utilizador estiver autenticado, a página é carregada normalmente.
 * Se não estiver autenticado, o guard bloqueia o acesso e redireciona
 */
export const HOME_ROUTES: Routes = [
    { path: 'main-page', component: MainPage, canActivate: [authGuard] },   
];
