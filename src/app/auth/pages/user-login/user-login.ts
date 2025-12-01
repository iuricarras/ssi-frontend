import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from "@angular/forms";
import { HttpResponse } from "@angular/common/http";
import { AuthService } from "../../services/auth.service";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: "app-user-login",
  standalone: true,
  templateUrl: "./user-login.html",
  styleUrls: ["./user-login.css"],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class UserLogin implements OnInit {

  public isCodeVisible: boolean = false;
  public message: string | null = null;
  public errorMessage: string | null = null;
  private currentEmail: string | null = null;
  private challengeId: string | null = null;

  emailForm = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email])
  });

  codeForm = new FormGroup({
    code: new FormControl("", [Validators.required, Validators.pattern(/^\d{6}$/)])
  });

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: () => { this.router.navigateByUrl("/auth/main-page"); },
      error: () => {}
    });
  }

  sendEmail(): void {
    const email = this.emailForm.get("email")?.value;
    this.message = null;
    this.errorMessage = null;

    if (!email) {
      this.errorMessage = "Por favor, insira um e-mail válido.";
      return;
    }
    try {
    this.authService.requestLoginCode(email).subscribe({
      next: (response: HttpResponse<any>) => {
        const body = response.body;
        if (response.status === 200 && body?.challenge_id) {
          this.currentEmail = email;
          this.challengeId = body.challenge_id;
          this.isCodeVisible = true;
          this.message = "Código enviado para o e-mail informado.";
        } else {
          this.errorMessage = "Erro ao enviar código. Tente novamente.";
        }
      },
        error: () => {
          this.errorMessage = "Erro ao enviar código. Tente novamente.";
        }
      });
    } catch {
      this.errorMessage = "Erro inesperado durante o envio do e-mail.";
    }
  }

  verifyCode(): void {
    const code = this.codeForm.get("code")?.value;
    this.message = null;
    this.errorMessage = null;

    if (!code) {
      this.errorMessage = "Por favor, insira o código de verificação.";
      return;
    }
    if (!this.currentEmail || !this.challengeId) {
      this.errorMessage = "Erro interno: dados de autenticação indisponíveis.";
      return;
    }
    try {
      this.authService.verifyLoginCode(this.currentEmail, this.challengeId, code).subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.status === 200) {
            this.message = "Login efetuado com sucesso.";
            setTimeout(() => this.router.navigateByUrl("/auth/main-page"), 1000);
          } else {
            this.errorMessage = "Código inválido. Verifique e tente novamente.";
          }
        },
        error: () => {
          this.errorMessage = "Código inválido. Verifique e tente novamente.";
        }
      });
    } catch {
      this.errorMessage = "Erro inesperado durante a verificação do código.";
    }
  }



  goToRegister(): void {
    this.router.navigateByUrl("register/user-register");
  }

}
