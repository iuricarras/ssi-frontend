import { Routes } from "@angular/router";
import { ECRegister } from "./components/ec-register/ec-register";
import { UserRegisterComponent } from "./components/user-register/user-register";


export const REGISTER_ROUTES: Routes = [
    { path: 'ec-register', component: ECRegister },
    { path: 'user-register', component: UserRegisterComponent }
];
