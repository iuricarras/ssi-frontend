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
  selector: 'app-accrediting-agency-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './accrediting-agency-login.html',
  styleUrl: './accrediting-agency-login.css'
})
export class AccreditingAgencyLogin implements OnInit {

  public message: string | null = null;
  public errorMessage: string | null = null;

  public isNonceVisible: boolean = false;

  public challengeId: string | null = null;
  public nonce: string | null = null;
  public currentEmail: string | null = null;

  emailForm = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email])
  });

  signatureForm = new FormGroup({
    signature: new FormControl("", [Validators.required])
  });

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: () => this.router.navigateByUrl("/auth/main-page"),
      error: () => {}
    });
  }

  startSignatureLogin(): void {
    const email = this.emailForm.get("email")?.value;
    this.message = null;
    this.errorMessage = null;

    if (!email) {
      this.errorMessage = "Por favor, insira um e-mail válido.";
      return;
    }

    try {
      this.authService.startSignature(email).subscribe({
        next: (response: HttpResponse<any>) => {
          const body = response.body;

          if (response.status === 200 && body?.challenge_id && body?.nonce) {
            this.currentEmail = email;
            this.challengeId = body.challenge_id;
            this.nonce = body.nonce;
            this.isNonceVisible = true;
            this.message = "Desafio iniciado. Assine o nonce com a sua chave privada.";

          } else {
            this.errorMessage = "Erro ao iniciar o processo de assinatura.";
          }
        },
        error: () => {
          this.errorMessage = "Erro ao iniciar o processo de assinatura.";
        }
      });
    } catch {
      this.errorMessage = "Erro inesperado durante a autenticação.";
    }
  }

  verifySignatureLogin(): void {
    const signature = this.signatureForm.get("signature")?.value;

    this.message = null;
    this.errorMessage = null;

    if (!signature) {
      this.errorMessage = "Por favor, insira a assinatura digital.";
      return;
    }

    if (!this.currentEmail || !this.challengeId) {
      this.errorMessage = "Erro interno: challenge não encontrado.";
      return;
    }

    try {
      this.authService.verifySignature(this.currentEmail, this.challengeId, signature).subscribe({
        next: (response: HttpResponse<any>) => {

          if (response.status === 200 && response.body?.ok === true) {
            this.message = "Assinatura validada. Autenticação concluída.";
            setTimeout(() => this.router.navigateByUrl("/auth/main-page"), 1000);
          } else {
            this.errorMessage = "Assinatura inválida.";
          }
        },
        error: () => {
          this.errorMessage = "Assinatura inválida ou challenge expirado.";
        }
      });

    } catch {
      this.errorMessage = "Erro inesperado ao verificar assinatura.";
    }
  }
}
