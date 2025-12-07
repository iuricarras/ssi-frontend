import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; 
import { NgxMaskDirective } from 'ngx-mask';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatSelectModule } from "@angular/material/select";
import { Router } from "@angular/router";
import { RegisterService } from "../../services/register.service";
import { HttpResponse } from "@angular/common/http";
import { MatIconModule } from '@angular/material/icon';

export interface ECRegistrationData {
  name: string;
  tipo: string;
  tipoOutro: string;
  nif: number | null;
  email: string;
  tel: string;
  authenticationKey: string; // para autenticação
  certificate: string; // para assinaturas
}

@Component({
  selector: 'app-ec-register',
  standalone: true,
  imports: [
    FormsModule, 
    NgxMaskDirective, 
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './ec-register.html',
  styleUrl: './ec-register.css'
})

export class ECRegister implements OnInit {
  //Estrutura que guarda os dados de registo da entidade credenciadora
  ecData: ECRegistrationData = {
      name: '',
      tipo: '',
      tipoOutro: '',
      nif: null,
      email: '',
      tel: '',
      authenticationKey: '',
      certificate: ''
  };

  areFilesUploaded: { auth: boolean, cert: boolean } = { auth: false, cert: false };

  constructor(
    private registerService: RegisterService,
    private router: Router
  ) {}

  ngOnInit(): void {}


  /**
   * handleFileUpload(event, keyName)
   * Processa o upload de ficheiros .pem para autenticação e certificado.
   * Valida a extensão do ficheiro (deve ser .pem).
   * Lê o conteúdo do ficheiro e remove quebras de linha.
   * Guarda o conteúdo em ecData.certificate ou ecData.authenticationKey.
   * Se a extensão for inválida, mostra alerta.
   */
  handleFileUpload(event: Event, keyName: keyof ECRegistrationData): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileName = file.name;
      const reader = new FileReader();

      if (!fileName.toLowerCase().endsWith('.pem')) {
        alert('Erro: O ficheiro deve ter a extensão .pem.');
        if (keyName === 'certificate') {
          this.ecData.certificate = ''
        } else if (keyName === 'authenticationKey') {
          this.ecData.authenticationKey = ''
        }
      } else {
        reader.onload = () => {
          let fileContent = reader.result as string;
          fileContent = fileContent.replace(/[\r\n]+/g, '');

          if (keyName === 'certificate') {
            this.ecData.certificate = fileContent;
          } else if (keyName === 'authenticationKey') {
            this.ecData.authenticationKey = fileContent;
          }
        };
        reader.readAsText(file);
      }

    } else {
      console.log('Nenhum ficheiro selecionado.');
    }
  }


  /**
   * onSubmit(form)
   * Submete o formulário de registo da EC.
   * Valida se as chaves foram carregadas.
   * Se o formulário for válido, chama registerService.registerEC().
   * Se obtiver sucesso, mostra alerta e redireciona para login.
   * Se não, mostra alerta de erro.
   */
  onSubmit(form: NgForm) {
    if (this.ecData.authenticationKey == '' || this.ecData.certificate == ''){
      alert('Erro: Por favor, verifique se as Chaves foram carregadas corretamente.');
    }
    else if (form.valid) { 
      try {
        this.registerService.registerEC(this.ecData).subscribe({
          next: (response: HttpResponse<any>) => {
            if (response.status === 201 || response.status === 200) { 
              alert('Registo efetuado com sucesso!');
              setTimeout(() => this.router.navigateByUrl("login"), 1000); 
            } else {
              alert('Erro no registo. Por favor, tente novamente.');
            }
          },
          error: (err) => {
            console.error('Erro de registo:', err);
            alert('Erro ao registar: ' + (err.error?.error || 'Erro de comunicação com o servidor.')); 
          }
        });
      } catch (e) {
        console.error('Erro inesperado:', e);
        alert('Erro inesperado durante o registo.');
      }
    } else {
      alert('Erro: Por favor, preencha todos os campos obrigatórios.');
    }
  }


  /**
   * goToLogin(): Redireciona para a página de login da Entidade Credenciadora.
   */
  goToLogin() {
    this.router.navigateByUrl("/auth/accrediting-agency-login");
  }
}
