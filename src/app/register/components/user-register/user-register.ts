import { Component } from "@angular/core";
import { FormsModule, NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { RegisterService } from "../../services/register.service";

export interface UserRegistrationData {
  username: string;
  email: string;
  nome: string;
}

@Component({
  selector: "app-user-register",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: "./user-register.html",
  styleUrl: "./user-register.css"
})
export class UserRegisterComponent {

  userData: UserRegistrationData = {
    username: "",
    email: "",
    nome: ""
  };

  constructor(
    private registerService: RegisterService,
    private router: Router
  ) {}


  /**
   * onSubmit(form)
   * Executa o processo de registo de um novo utilizador.
   * Primeiro valida se o formulário está corretamente preenchido.
   *   - Se não estiver válido, mostra um alerta a pedir para preencher os campos obrigatórios.
   * Se estiver válido:
   *   - Chama registerService.registerUser() com os dados inseridos (username, email, nome).
   *   - Se a resposta for bem-sucedida, mostra um alerta de sucesso e redireciona para /auth/user-login.
   *   - Se houver um erro, mostra um alerta com a mensagem de erro.
   */
  onSubmit(form: NgForm) {
    if (!form.valid) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    this.registerService.registerUser(this.userData).subscribe({
      next: () => {
        alert("Registo efetuado com sucesso!");
        this.router.navigateByUrl("/auth/user-login");
      },
      error: (err) => {
        console.error("Erro de registo:", err);
        alert("Erro ao registar: " + (err.error?.error || "Erro desconhecido"));
      }
    });
  }


  /**
   * goToLogin()
   * Redireciona o utilizador para a página de login.
   * Caminho: /auth/user-login
   */
  goToLogin() {
    this.router.navigateByUrl("/auth/user-login");
  }
}
