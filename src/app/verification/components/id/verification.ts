import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { VerificationService } from '../../service/verification.service';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    DatePipe,
    MatIconModule 
  ],
  templateUrl: './verification.html',
  styleUrls: ['./verification.css']
})
export class VerificationComponent implements OnInit {

  verificationId: string = '';
  masterKey: string = '';
  error = '';
  verificationData: any = null;

  constructor(
    private verificationService: VerificationService,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.verificationId = this.route.snapshot.paramMap.get('id') || '';
  }


  /**
   * getVerification()
   * Executa o processo de obtenção de dados de verificação.
   * Primeiro valida se a masterKey foi preenchida.
   * Se estiver vazia, define mensagem de erro e interrompe o processo.
   * Se estiver preenchida:
   *   - Limpa as mensagens de erro anteriores.
   *   - Faz uma requisição PUT para /verify/get-verifications/:id com a masterKey.
   *   - Se a resposta for bem-sucedida, guarda os dados recebidos em verificationData.
   *   - Se houver um erro, define uma mensagem de erro.
   */
  getVerification() {
    if (!this.masterKey.trim()) {
      this.error = 'A chave mestra é obrigatória.';
      return;
    }

    this.error = '';

    this.verificationService.getVerification(this.verificationId, this.masterKey).subscribe({
      next: (res: any) => {
        this.verificationData = res.verification;
      },
      error: err => {
        this.error = err.error?.error || 'Erro ao obter verificação.';
      }
    });
  }
}
