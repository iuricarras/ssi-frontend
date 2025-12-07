import { Routes } from "@angular/router";
import { Carteira } from "./components/pessoal/carteira";
import { CarteiraUser } from "./components/user/carteira-user";
import { authGuard } from "../auth/guard/AuthGuard";

/**
 * CARTEIRA_ROUTES
 * Conjunto de rotas responsáveis pela navegação no módulo de Carteira.
 * Todas as rotas estão protegidas pelo authGuard, apenas utilizadores autenticados podem aceder.
 */
export const CARTEIRA_ROUTES: Routes = [
    { path: 'public/:username', component: CarteiraUser, canActivate: [authGuard]},
    { path: '', component: Carteira, canActivate: [authGuard]}
];
