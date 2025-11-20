import { Routes } from "@angular/router";
import { Carteira } from "./components/carteira";
import { authGuard } from "../auth/guard/AuthGuard";


export const CARTEIRA_ROUTES: Routes = [
    // { path: '', component: Carteira}
    { path: '', component: Carteira, canActivate: [authGuard]}
];
