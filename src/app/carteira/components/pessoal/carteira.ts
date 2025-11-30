import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CarteiraService, UserData } from '../../services/carteira.services';

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
  
  // Dados do utilizador
  nome: string = '';
  username: string = "";
  email: string = '';
  dadosCarteira: any[] = [];

  // Modal de edição/adição
  mostrarModal: boolean = false;
  modoEdicao: boolean = false; // true para editar, false para adicionar
  dadoEdicao: any = { chave: '', valor: '' };
  novoNome: string = '';
  novoValor: string = '';

  // Modal de confirmação com chave mestra
  mostrarModalChaveMestra: boolean = false;
  chaveMestraInput: string = '';
  mensagemErroChave: string = '';
  operacaoPendente: (() => void) | null = null;

  developmentMode: boolean = false;
  testMasterKey: string = '123';

  constructor(private carteiraService: CarteiraService) {}

  ngOnInit() {
    this.carregarDadosUtilizador();
  }

  carregarDadosUtilizador() {
    if (this.developmentMode) {
      this.nome = 'Ana Silva';
      this.username = 'anasilva'
      this.email = 'ana.silva@exemplo.com';
      return;
    } 
    
    this.carteiraService.getUserData().subscribe({
      next: (userData: UserData) => {
        this.nome = userData.name;
        this.username = userData.username;
        this.email = userData.email;
      },
      error: () => {
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
    
    if (this.developmentMode) {
      if (this.input === this.testMasterKey) {
        this.carregarDadosCarteira();
        this.mensagemErro = '';
      } else {
        this.dadosAcessiveis = false;
        this.mensagemErro = `Chave incorreta.`;
      }
      this.input = '';
      return;
    }
    
    this.carteiraService.verifyMasterKey(this.input).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.carregarDadosCarteira();
          this.mensagemErro = '';
        } else {
          this.dadosAcessiveis = false;
          this.mensagemErro = 'Chave Mestra incorreta. Tente novamente.';
        }
        this.input = '';
        return;
      },
      error: (error) => {
        this.dadosAcessiveis = false;
        
        if (error.status === 401 || error.status === 403) {
          this.mensagemErro = 'Chave Mestra incorreta. Tente novamente.';
        } else {
          this.mensagemErro = 'Erro interno do servidor. Tente novamente mais tarde.';
        }
        this.input = '';
      }
    });
  }

  carregarDadosCarteira() {
    if (this.developmentMode) {
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
      return;
    }

    this.carteiraService.getCarteiraData().subscribe({
      next: (carteiraData) => {
        this.dadosAcessiveis = true;
        this.dadosCarteira = this.processarDadosCarteira(carteiraData);
      },
      error: (error) => {
        this.dadosAcessiveis = false;
        this.mensagemErro = 'Erro ao carregar dados da carteira. Tente novamente.';
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


// Adicionar, Eliminar e Editar Dados

  private scheduleOperation(operation: () => void) {
    this.operacaoPendente = operation;
    this.mostrarModalChaveMestra = true;
  }
  private finalizeChange() {
    this.fecharModal();
    this.enviarAtualizacaoParaServidor();
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
    if (!this.novoNome.trim() || !this.novoValor.trim()) return;

    this.scheduleOperation(() => {
      if (this.modoEdicao) {
        const idx = this.dadosCarteira.findIndex(i => i.tipo === 'personalData' && i.chave === this.dadoEdicao.chave);
        if (idx > -1) {
          this.dadosCarteira[idx].chave = this.novoNome.trim();
          this.dadosCarteira[idx].valor = this.novoValor.trim();
        }
      } else {
        this.dadosCarteira.push({ tipo: 'personalData', chave: this.novoNome.trim(), valor: this.novoValor.trim(), isCertificate: false });
      }

      this.finalizeChange();
    });
  }
  fecharModal() {
    this.mostrarModal = false;
    this.modoEdicao = false;
    this.dadoEdicao = { chave: '', valor: '' };
    this.novoNome = '';
    this.novoValor = '';
  }

  eliminarDadoPessoal(dado: any) {
    this.scheduleOperation(() => {
      this.dadosCarteira = this.dadosCarteira.filter(item => !(item.tipo === 'personalData' && item.chave === dado.chave));
      this.finalizeChange();
    });
  }
  eliminarCertificado(certificado: any) {
    this.scheduleOperation(() => {
      this.dadosCarteira = this.dadosCarteira.filter(item => !(item.tipo === 'certificate' && item.nome === certificado.nome));
      this.finalizeChange();
    });
  }

  confirmarChaveMestra() {
    if (!this.chaveMestraInput.trim()) {
      this.mensagemErroChave = 'Por favor, insira a chave mestra.';
      return;
    }

    if (this.developmentMode) {
      if (this.chaveMestraInput === this.testMasterKey) {
        this.executarOperacaoPendente();
      } else {
        this.mensagemErroChave = 'Chave mestra incorreta.';
      }
      return;
    }

    this.carteiraService.verifyMasterKey(this.chaveMestraInput).subscribe({
      next: (response) => {
        if (response.status === 200) this.executarOperacaoPendente();
        else this.mensagemErroChave = 'Chave mestra incorreta.';
      },
      error: (error) => {
        this.mensagemErroChave = (error.status === 401 || error.status === 403) ? 'Chave mestra incorreta.' : 'Erro de conexão. Tente novamente.';
      }
    });
  }

  executarOperacaoPendente() {
    if (!this.operacaoPendente) return;
    const op = this.operacaoPendente;
    this.operacaoPendente = null;
    op();
    this.fecharModalChaveMestra();
  }
  fecharModalChaveMestra() {
    this.mostrarModalChaveMestra = false;
    this.chaveMestraInput = '';
    this.mensagemErroChave = '';
    this.operacaoPendente = null;
  }

  enviarAtualizacaoParaServidor() {
    if (this.developmentMode) return;
  
    this.carteiraService.updateCarteiraData(this.dadosCarteira).subscribe({
      next: () => {
        console.log('Carteira atualizada com sucesso');
      },
      error: (error) => {
        console.error('Erro ao atualizar carteira', error);
        alert('Erro ao salvar alterações. Tente novamente.');
      }
    });
  }
}