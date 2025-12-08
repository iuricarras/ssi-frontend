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
  dadosCarteira: any[] = [];

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
        console.log(this.verificationData);
        this.dadosCarteira = this.processarDadosCarteira(this.verificationData);
        console.log(this.dadosCarteira);
      },
      error: err => {
        this.error = err.error?.error || 'Erro ao obter verificação.';
      }
    });
  }


  /**
   * processarDadosCarteira()
   * 
   * Processa os dados da carteira de identidade. 
   * Neste contexto é utilizador para processar os dados solicitados que vem do backend para exibição.
   * Se o tipo for 'personalData', extrai o valor correspondente à chave especificada.
   * Se o tipo for 'certificate', agrupa os dados em um objeto de certificado.
   * 
   * @param carteiraData - Os dados da carteira a serem processados.
   * @returns Uma lista de objetos representando os dados pessoais e certificados.
   */
  private processarDadosCarteira(carteiraData: any): any[] {
    const dados: any[] = [];

    if (carteiraData.verification_data && carteiraData.verification_data_type) {
      try {
        const jsonString = carteiraData.verification_data.replace(/'/g, '"');
        const parsedData = JSON.parse(jsonString);

        const infoType = carteiraData.verification_data_type;

        if (infoType.tipo === 'personalData') {
          const key = infoType.chave;
          const value = parsedData[key];
          
          if (value) {
            dados.push({
              tipo: 'personalData',
              chave: key,
              valor: value
            });
          }
        } else if (infoType.tipo === 'certificate') {
          const certificadoAgrupado: any = {
            tipo: 'certificate',
            nome: infoType.nome,
            campos: []
          };

          Object.keys(parsedData).forEach(key => {
            const value = parsedData[key];
            if (key !== 'nome' && value && value !== null && value !== '') {
              certificadoAgrupado.campos.push({
                chave: key,
                valor: value
              });
            }
          });

          if (certificadoAgrupado.campos.length > 0) {
            dados.push(certificadoAgrupado);
          }
        }

      } catch (error) {
        console.error('Erro ao processar dados da carteira:', error);
      }
    }

    return dados;
  }

  getDadosPessoais(): any[] {
    return this.dadosCarteira.filter(dado => dado.tipo === 'personalData');
  }

  getCertificados(): any[] {
    return this.dadosCarteira.filter(dado => dado.tipo === 'certificate');
  }

}
