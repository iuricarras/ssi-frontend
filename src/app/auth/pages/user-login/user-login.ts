import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from "@angular/forms";
import { HttpResponse } from "@angular/common/http";
import { AuthService } from "../../services/auth.service";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";


/**
 * Componente responsável pelo login de utilizadores via código OneTimePassword.
 *
 * Objetivo:
 * Permitir que o utilizador insira o e-mail e receba um código de verificação.
 * Validar o código OTP e autenticar o utilizador.
 * Redirecionar para a página principal em caso de sucesso.
 * Disponibilizar navegação para a página de registo.
 */
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
  public enviando: boolean = false;

  emailForm = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email])
  });

  codeForm = new FormGroup({
    code: new FormControl("", [Validators.required, Validators.pattern(/^\d{6}$/)])
  });

  /* Parâmetros (Construtor):
  * - authService: serviço de autenticação que comunica com a API.
  * - router: serviço Angular para navegação entre páginas.
  */
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}


  /**
   * ngOnInit()
   * Executado ao inicializar o componente.
   * Verifica se já existe sessão ativa através de authService.me().
   * Se sim, redireciona para /home/main-page, se não, mantém o utilizador na página de login.
   */
  ngOnInit(): void {
    this.authService.me().subscribe({
      next: () => { this.router.navigateByUrl("/home/main-page"); },
      error: () => {}
    });
  }


  /**
   * sendEmail()
   * Inicia o processo de envio do código OTP.
   * Valida se o e-mail foi preenchido corretamente.
   * Chama authService.requestLoginCode(email) para pedir o código.
   * Se a resposta for válida (status 200 e challenge_id presente):
   *   -Guarda currentEmail e challengeId.
   *   -Exibe o campo de código (isCodeVisible = true).
   *   -Mostra mensagem de sucesso.
   * Caso contrário, mostra mensagem de erro.
   * Em caso de exceção, mostra erro inesperado.
   */
  sendEmail(): void {
    this.enviando = true;
    const email = this.emailForm.get("email")?.value;
    this.message = null;
    this.errorMessage = null;

    if (!email) {
      this.errorMessage = "Por favor, insira um e-mail válido.";
      this.enviando = false;
      return;
    }
    try {
    this.authService.requestLoginCode(email).subscribe({
      next: (response: HttpResponse<any>) => {
        this.enviando = false;
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
          this.enviando = false;
        }
      });
    } catch {
      this.errorMessage = "Erro inesperado durante o envio do e-mail.";
      this.enviando = false;
    }
  }


  /**
   * verifyCode()
   * Valida se o código foi preenchido e se existem dados de autenticação (currentEmail, challengeId).
   * Chama authService.verifyLoginCode(email, challengeId, code) para verificar o OTP.
   * Se resposta for válida (status 200):
   *   - Cria hmacCode com email.session_nonce.
   *   - Armazena no localStorage.
   *   - Mostra mensagem de sucesso.
   *   - Redireciona para /home/main-page após 1 segundo.
   * Caso contrário, mostra mensagem de erro.
   * Em caso de exceção, mostra erro inesperado.
   */
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
            console.log('Login response:', response);
            var hmacCode = this.currentEmail + "." + response.body.session_nonce;
            localStorage.setItem("hmacCode", hmacCode);
            this.message = "Login efetuado com sucesso.";
            setTimeout(() => this.router.navigateByUrl("/home/main-page"), 1000);
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


  /**
   * goToRegister(): Redireciona o utilizador para a página de registo.
   */
  goToRegister(): void {
    this.router.navigateByUrl("register/user-register");
  }

}
