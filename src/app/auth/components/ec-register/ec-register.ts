import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; // para o formulario
import { NgxMaskDirective } from 'ngx-mask';

interface ECRegistrationData {
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
  imports: [FormsModule, NgxMaskDirective, CommonModule],
  templateUrl: './ec-register.html',
  styleUrl: './ec-register.css'
})

export class ECRegister implements OnInit {
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

  constructor() {}

  ngOnInit(): void {}

  handleFileUpload(event: Event, keyName: keyof ECRegistrationData): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        let fileContent = reader.result as string;
        fileContent = fileContent.replace(/[\r\n]+/g, '');

        if (keyName === 'certificate') {
          this.ecData.certificate = fileContent;
          console.log('Conteúdo do Certificado de Assinaturas carregado (sem quebras de linha):', fileContent);
        } else if (keyName === 'authenticationKey') {
          this.ecData.authenticationKey = fileContent;
          console.log('Conteúdo do Certificado de Autenticação carregado (sem quebras de linha):', fileContent);
        }
      };

      reader.readAsText(file);
    } else {
      console.log('Nenhum ficheiro selecionado.');
    }
  }

  onSubmit(form: NgForm) {
    if (this.ecData.authenticationKey == '' || this.ecData.certificate == ''){
      alert('ERRO: Por favor, preencha todos os campos obrigatórios e verifique se o Certificado foi carregado corretamente.');
    }
    else if (form.valid) { 
      alert('Registo de Entidade Aprovado.');
    } else {
      alert('ERRO: Por favor, preencha todos os campos obrigatórios e verifique se o Certificado foi carregado corretamente.');
    }
  }
}


//openssl genrsa -out ec_signing_key.pem 2048
//openssl req -new -key ec_signing_key.pem -out ec_signing.csr
//openssl x509 -req -days 365 -in ec_signing.csr -signkey ec_signing_key.pem -out ec_signing_cert.pem