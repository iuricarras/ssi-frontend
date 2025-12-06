import { Component, OnInit } from '@angular/core';
import { VerificationService } from '../../service/verification.service';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { AuthService } from '../../../auth/services/auth.service';

// --- Tipagem ---
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

  loadVerifications() {
    this.verificationService.getAllVerifications().subscribe({
      next: (res: any) => {
        // Mapeia cada verificação para extrair o nome correto
        this.verifications = res.all_verifications.map((v: Verification) => {
          let displayName = '';
          if (v.verification_data_type) {
            if (typeof v.verification_data_type === 'string') {
              displayName = v.verification_data_type;
            } else {
              displayName = v.verification_data_type.chave || v.verification_data_type.nome || '';
            }
          }
          return {
            ...v,
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

  timeLeft(expires_at: string): string {
    const expires = new Date(expires_at).getTime();
    const now = Date.now();
    const diff = expires - now;

    if (diff <= 0) return "Expirado";

    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);

    return `${hours}h ${minutes}m restantes`;
  }

  openVerification(id: string, accepted: boolean) {
    if (!accepted) return;
    this.router.navigate(['/verification', id]);
  }

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
