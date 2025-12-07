import { Component, OnInit } from '@angular/core';
import { VerificationService } from '../../service/verification.service';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { AuthService } from '../../../auth/services/auth.service';

// Tipagem 
type VerificationDataType = { chave?: string; nome?: string } | string;

interface Verification {
  verification_id: string;
  verification_user_id: string;
  verification_data_type: VerificationDataType;
  accepted: boolean;
  created_at: string;
  expires_at: string;
  verification_data_type_display?: string;
}

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgFor,
    RouterLink,
    MatIconModule
  ],
  templateUrl: './pedidos.html',
  styleUrls: ['./pedidos.css'],
})
export class PedidosComponent implements OnInit {

  verifications: Verification[] = [];
  loading = true;
  error = '';

  constructor(
    private verificationService: VerificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadVerifications();
  }


  /**
   * loadVerifications()
   * Carrega todas as verificações (pedidos) através do VerificationService.
   * Faz um request à API para obter a lista de verificações.
   * Para cada verificação recebida:
   *   - Extrai o nome ou chave de verification_data_type.
   *   - Cria uma propriedade adicional (verification_data_type_display) para mostrar no UI.
   * Se a requisição for bem-sucedida, atualiza verifications termina o loading.
   * Se ocorrer erro, define mensagem de erro e também desativa o loading.
   */
  loadVerifications() {
    this.verificationService.getAllVerifications().subscribe({
      next: (res: any) => {
        // Mapeia cada verificação para extrair o nome correto
        // A resposta do backend vem no formato: { data: [...], hmac: "..." }
        this.verifications = res.data.map((v: Verification) => {
          let displayName = '';
          if (v.verification_data_type) {
            if (typeof v.verification_data_type === 'string') { // Caso seja uma string, usa diretamente como nome
              displayName = v.verification_data_type;
            } else {  
              // Caso seja um objeto, tenta usar a chave ou o nome
              displayName = v.verification_data_type.chave || v.verification_data_type.nome || ''; 
            }
          }
          return {
            ...v,  // Return do objeto original da verificação
            verification_data_type_display: displayName
          };
        });
        this.loading = false;
      },
      error: err => {
        this.error = err.error?.error || 'Erro ao carregar pedidos.';
        this.loading = false;
      }
    });
  }


  /**
   * timeLeft(expires_at)
   * Calcula o tempo restante até a expiração de uma verificação.
   * Converte expires_at em timestamp.
   * Calcula a diferença entre a data de expiração e o momento atual.
   * Se já expirou, retorna "Expirado".
   * Caso contrário, retorna uma string com horas e minutos restantes.
   */
  timeLeft(expires_at: string): string {
    const expires = new Date(expires_at).getTime();
    const now = Date.now();
    const diff = expires - now;

    if (diff <= 0) return "Expirado";

    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);

    return `${hours}h ${minutes}m restantes`;
  }


   /**
   * openVerification(id, accepted)
   * Abre uma verificação específica.
   * Só permite navegação se accepted = true (verificação aceite).
   * Redireciona para /verification/:id.
   */
  openVerification(id: string, accepted: boolean) {
    if (!accepted) return;
    this.router.navigate(['/verification', id]);
  }


  /**
   * onLogout()
   * Faz logout do utilizador chamando AuthService.logout().
   * Se a operação for bem-sucedida, redireciona para /auth/home-login.
   * Se houver um erro, mostra no terminal e redireciona para /auth/home-login.
   */
  public onLogout(): void {
    this.authService.logout().subscribe({
      next: (): void => {
        this.router.navigateByUrl('/auth/home-login');
      },
      error: (err: unknown): void => {
        console.error(err);
        this.router.navigateByUrl('/auth/home-login');
      }
    });
  }
}
