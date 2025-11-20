import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CarteiraService, UserData } from '../services/carteira.services';

@Component({
  selector: 'app-carteira',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './carteira.html',
  styleUrls: ['./carteira.css']
})

export class Carteira implements OnInit {
  input: string = '';
  dadosAcessiveis: boolean = false;
  mensagemErro: string = '';
  isLoading: boolean = false;
  isLoadingUserData: boolean = false;
  
  // Dados do utilizador
  nome: string = '';
  email: string = '';

  dadosCarteira: any[] = [];

  // Modal de edição/adição
  mostrarModal: boolean = false;
  modoEdicao: boolean = false; // true para editar, false para adicionar
  dadoEdicao: any = { chave: '', valor: '' };
  novoNome: string = '';
  novoValor: string = '';

  private developmentMode: boolean = false;
  private testMasterKey: string = '123';

  constructor(private carteiraService: CarteiraService) {}

  ngOnInit() {
    this.carregarDadosUtilizador();
  }

  carregarDadosUtilizador() {
    this.isLoadingUserData = true;
    
    if (this.developmentMode) {
      setTimeout(() => {
        this.isLoadingUserData = false;
        this.nome = 'Ana Silva';
        this.email = 'ana.silva@exemplo.com';
      }, 500);
      return;
    }
    
    this.carteiraService.getUserData().subscribe({
      next: (userData: UserData) => {
        this.isLoadingUserData = false;
        this.nome = userData.name;
        this.email = userData.email;
      },
      error: () => {
        this.isLoadingUserData = false;
        this.nome = 'Erro ao carregar os dados do Utilizador';
      }
    });
  } 

  validarChaveMestra() {
    this.mensagemErro = '';
    
    if (!this.input.trim()) {
      this.mensagemErro = 'Por favor, insira a chave mestra.';
      return;
    }
    
    this.isLoading = true;
    
    if (this.developmentMode) {
      setTimeout(() => {
        if (this.input === this.testMasterKey) {
          this.carregarDadosCarteira();
          this.mensagemErro = '';
        } else {
          this.isLoading = false;
          this.dadosAcessiveis = false;
          this.mensagemErro = `Chave incorreta.`;
        }
        this.input = '';
      }, 1000);
      return;
    }
    
    this.carteiraService.verifyMasterKey(this.input).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.carregarDadosCarteira();
          this.mensagemErro = '';
        } else {
          this.isLoading = false;
          this.dadosAcessiveis = false;
          this.mensagemErro = 'Chave Mestra incorreta. Tente novamente.';
        }
        this.input = '';
      },
      error: (error) => {
        this.isLoading = false;
        this.dadosAcessiveis = false;
        
        if (error.status === 401 || error.status === 403) {
          this.mensagemErro = 'Chave Mestra incorreta. Tente novamente.';
        } else if (error.status === 0) {
          this.mensagemErro = 'Erro de conexão. Verifique a sua ligação à internet.';
        } else {
          this.mensagemErro = 'Erro interno do servidor. Tente novamente mais tarde.';
        }
        this.input = '';
      }
    });
  }

  carregarDadosCarteira() {
    if (this.developmentMode) {
      setTimeout(() => {
        this.isLoading = false;
        this.dadosAcessiveis = true;
        
        const mockData = {
          personalData: [
            {name: 'Data de Nascimento',
              value: '11/12/2004'
            },
            {name: 'Telemóvel',
              value: '+351 927 087 206'
            }],
          certificates: [
            {
              nome: 'Habilitação Académica',
              curso: 'Licenciatura em Engenharia Informática',
              entidade: 'Universidade da Beira Interior',
              emissão: '15/07/2025',
              nota: '17 valores'
            },
            {
              nome: 'Carta de Condução',
              categoria: 'Categoria B',
              entidade: 'IMT - Instituto da Mobilidade e dos Transportes',
              emissão: '25/01/2024',
              expira: '25/01/2039'
            }
          ]
        };
        
        this.dadosCarteira = this.processarDadosCarteira(mockData);
      }, 1500);
      return;
    }

    this.carteiraService.getCarteiraData().subscribe({
      next: (carteiraData) => {
        this.isLoading = false;
        this.dadosAcessiveis = true;
        this.dadosCarteira = this.processarDadosCarteira(carteiraData);
      },
      error: (error) => {
        this.isLoading = false;
        this.dadosAcessiveis = false;
        if (error.status === 401 || error.status === 403) {
          this.mensagemErro = 'Sessão expirada. Tente validar a chave novamente.';
        } else if (error.status === 0) {
          this.mensagemErro = 'Erro de conexão ao carregar dados da carteira.';
        } else {
          this.mensagemErro = 'Erro ao carregar dados da carteira. Tente novamente.';
        }
      }
    });
  }

  private processarDadosCarteira(carteiraData: any): any[] {
    const dados: any[] = [];

    // pessoais
    if (carteiraData.personalData && Array.isArray(carteiraData.personalData)) {
      carteiraData.personalData.forEach((item: any) => {
        if (item.name && item.value && item.value !== null && item.value !== '') {
          dados.push({
            tipo: 'personalData',
            chave: item.name,
            valor: item.value,
            isCertificate: false
          });
        }
      });
    }

    // certificados 
    if (carteiraData.certificates && Array.isArray(carteiraData.certificates)) {
      carteiraData.certificates.forEach((cert: any, index: number) => {
        const certificadoAgrupado: any = {
          tipo: 'certificate',
          nome: cert.nome,
          campos: []
        };

        Object.keys(cert).forEach(key => {
          const value = cert[key];
          if (key != 'nome' && value && value !== null && value !== '') {
            certificadoAgrupado.campos.push({
              chave: key,
              valor: value
            });
          }
        });

        if (certificadoAgrupado.campos.length > 0) {
          dados.push(certificadoAgrupado);
        }
      });
    }

    return dados;
  }
  
  getDadosPessoais(): any[] {
    return this.dadosCarteira.filter(dado => dado.tipo === 'personalData');
  }

  getCertificados(): any[] {
    return this.dadosCarteira.filter(dado => dado.tipo === 'certificate');
  }

  adicionarInformacao() {
    this.modoEdicao = false;
    this.dadoEdicao = { chave: '', valor: '' };
    this.novoNome = '';
    this.novoValor = '';
    this.mostrarModal = true;
  }

  editarDadoPessoal(dado: any) {
    this.modoEdicao = true;
    this.dadoEdicao = { ...dado };
    this.novoNome = dado.chave;
    this.novoValor = dado.valor;
    this.mostrarModal = true;
  }

  salvarEdicao() {
    if (!this.novoNome.trim() || !this.novoValor.trim()) {
      return;
    }

    if (this.modoEdicao) {
      const itemIndex = this.dadosCarteira.findIndex(item => 
        item.tipo === 'personalData' && item.chave === this.dadoEdicao.chave
      );

      if (itemIndex > -1) {
        this.dadosCarteira[itemIndex].chave = this.novoNome.trim();
        this.dadosCarteira[itemIndex].valor = this.novoValor.trim();
      }
    } else {
      this.dadosCarteira.push({
        tipo: 'personalData',
        chave: this.novoNome.trim(),
        valor: this.novoValor.trim(),
        isCertificate: false
      });
    }

    this.fecharModal();
    this.enviarAtualizacaoParaServidor();
  }

  fecharModal() {
    this.mostrarModal = false;
    this.modoEdicao = false;
    this.dadoEdicao = { chave: '', valor: '' };
    this.novoNome = '';
    this.novoValor = '';
  }

  eliminarDadoPessoal(dado: any) {
    const confirmacao = confirm(`Tem a certeza que deseja eliminar "${dado.chave}"?`);
    if (confirmacao) {
      this.dadosCarteira = this.dadosCarteira.filter(item => 
        !(item.tipo === 'personalData' && item.chave === dado.chave)
      );
      this.enviarAtualizacaoParaServidor();
    }
  }

  eliminarCertificado(certificado: any) {
    const confirmacao = confirm(`Tem a certeza que deseja eliminar o certificado "${certificado.nome}"?`);
    if (confirmacao) {
      this.dadosCarteira = this.dadosCarteira.filter(item => 
        !(item.tipo === 'certificate' && item.nome === certificado.nome)
      );
      this.enviarAtualizacaoParaServidor();
    }
  }

  enviarAtualizacaoParaServidor() {
    if (this.developmentMode) {
      return;
    }

    this.carteiraService.updateCarteiraData(this.dadosCarteira).subscribe({
      next: (response) => {
      },
      error: (error) => {
        alert('Erro ao salvar alterações. Tente novamente.');
      }
    });
  }
}