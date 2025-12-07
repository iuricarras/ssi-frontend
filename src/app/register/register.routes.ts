import { Routes } from "@angular/router";
import { ECRegister } from "./components/ec-register/ec-register";
import { UserRegisterComponent } from "./components/user-register/user-register";

/**
 * REGISTER_ROUTES
 * Conjunto de rotas responsáveis pelo registo de utilizadores e entidades credenciadoras.
 * Cada entrada define o caminho da URL e o componente que será renderizado.
 */
export const REGISTER_ROUTES: Routes = [
    { path: 'ec-register', component: ECRegister },
    { path: 'user-register', component: UserRegisterComponent }
];
