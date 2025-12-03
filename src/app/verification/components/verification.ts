import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    DatePipe
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
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.verificationId = this.route.snapshot.paramMap.get('id') || '';
  }

  getVerification() {
    if (!this.masterKey.trim()) {
      this.error = 'A chave mestra é obrigatória.';
      return;
    }

    this.error = '';

    this.http.put(`http://localhost:5000/verify/get-verifications/${this.verificationId}`, {
      masterKey: this.masterKey
    }).subscribe({
      next: (res: any) => {
        this.verificationData = res.verification;
      },
      error: err => {
        this.error = err.error?.error || 'Erro ao obter verificação.';
      }
    });
  }
}
