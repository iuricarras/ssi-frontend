import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CarteiraService, UserData } from '../../services/carteira.services';
import { AuthService } from '../../../auth/services/auth.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { UserService } from '../../../home/main-page/services/user.service';
import { verifywithHMAC } from '../../../utils/hmac';
@Component({
  selector: 'app-carteira',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    MatIconModule,
    ReactiveFormsModule,
    MatAutocompleteModule
  ],
  templateUrl: './carteira.html',
  styleUrls: ['./carteira.css']
})
export class Carteira implements OnInit {
  
  // --- Estado da Interface ---
  input: string = '';
  dadosAcessiveis: boolean = false;
  mensagemErro: string = '';
  
  // --- Dados do Utilizador e Carteira ---
  nome: string = '';
  username: string = "";
  email: string = '';
  dadosCarteira: any[] = [];

  // --- Modal de Edição/Adição ---
  mostrarModal: boolean = false;
  modoEdicao: boolean = false; // true para editar, false para adicionar
  dadoEdicao: any = { chave: '', valor: '' };
  novoNome: string = '';
  novoValor: string = '';

  // --- Modal de Confirmação (Chave Mestra) ---
  mostrarModalChaveMestra: boolean = false;
  chaveMestraInput: string = '';
  mensagemErroChave: string = '';
  operacaoPendente: (() => void) | null = null;

  searchControl = new FormControl('');
  searchResults: any[] = [];

  constructor(
    private router: Router,
    private carteiraService: CarteiraService, 
    private authService: AuthService,
    private userService: UserService) {}
  

  ngOnInit() {
    this.carregarDadosUtilizador();

    this.searchControl.valueChanges.subscribe(value => {
      this.onSearch(value || '');
    });
  }

  // --- Carregamento de Dados ---

  /** Carrega as informações básicas do perfil do utilizador. */
  carregarDadosUtilizador() {
    this.carteiraService.getUserData().subscribe({
      next: (message) => {
        var userData = message.data;
        if (verifywithHMAC(JSON.stringify(userData), message.hmac)) {
          this.nome = userData.nome;
          this.username = userData?.username || "";
          this.email = userData?.email || "";
        } else {
          console.error('HMAC verification failed for user data');
          return
        }
      },
      error: () => {
        this.nome = 'Erro ao carregar os dados do Utilizador';
      }
    });
  } 

  /** Valida a chave mestra inserida e carrega os dados decifrados da carteira. */
  validarChaveMestra() {
    this.mensagemErro = '';
    
    if (!this.input.trim()) {
      this.mensagemErro = 'Por favor, insira a chave mestra.';
      return;
    }

    this.carteiraService.getCarteiraData(this.input).subscribe({
      next: (message) => {
        var carteiraData = message.data;
        if (!verifywithHMAC(JSON.stringify(carteiraData), message.hmac)) {
          this.mensagemErro = 'Falha na verificação dos dados da carteira.';
          return;
        }
        this.dadosAcessiveis = true;
        this.dadosCarteira = this.processarDadosCarteira(carteiraData)
      },
      error: (error) => {
        this.mensagemErro = 'Chave Mestra inválida.';
      }
    });
  }

  /** Transforma a estrutura de dados recebida do backend numa lista. */
  private processarDadosCarteira(carteiraData: any): any[] {
    const dados: any[] = [];

    // Processar dados pessoais
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

    // Processar certificados
    if (carteiraData.certificates && Array.isArray(carteiraData.certificates)) {
      carteiraData.certificates.forEach((cert: any, index: number) => {
        const certificadoAgrupado: any = {
          tipo: 'certificate',
          nome: cert.nome,
          campos: []
        };

        // tratar cada campo do certificado
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
  
  // --- Getters para o Template ---

  getDadosPessoais(): any[] {
    return this.dadosCarteira.filter(dado => dado.tipo === 'personalData');
  }

  getCertificados(): any[] {
    return this.dadosCarteira.filter(dado => dado.tipo === 'certificate');
  }

  // --- Gestão de Operações ---

  /** Agenda uma operação sensível para ser executada após confirmação da chave mestra. */
  private scheduleOperation(operation: () => void) {
    this.operacaoPendente = operation;
    this.mostrarModalChaveMestra = true;
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

  /** Prepara os dados editados/novos e agenda o envio para o servidor. */
  salvarEdicao() {
    if (!this.novoNome.trim() || !this.novoValor.trim()) return;

    this.scheduleOperation(() => {
      const novosDados = this.dadosCarteira.map(d => ({ ...d }));
      
      if (this.modoEdicao) {
        const idx = novosDados.findIndex(i => i.tipo === 'personalData' && i.chave === this.dadoEdicao.chave);
        if (idx > -1) {
          novosDados[idx].chave = this.novoNome.trim();
          novosDados[idx].valor = this.novoValor.trim();
        }
      } else {
        novosDados.push({ tipo: 'personalData', chave: this.novoNome.trim(), valor: this.novoValor.trim(), isCertificate: false });
      }

      this.enviarAtualizacaoParaServidor(novosDados, this.chaveMestraInput);
      this.fecharModal();
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
      const novosDados = this.dadosCarteira.filter(item => !(item.tipo === 'personalData' && item.chave === dado.chave));
      this.enviarAtualizacaoParaServidor(novosDados, this.chaveMestraInput);
    });
  }

  eliminarCertificado(certificado: any) {
    this.scheduleOperation(() => {
      const novosDados = this.dadosCarteira.filter(item => !(item.tipo === 'certificate' && item.nome === certificado.nome));
      this.enviarAtualizacaoParaServidor(novosDados, this.chaveMestraInput);
    });
  }

  // --- Confirmação de Chave Mestra ---

  confirmarChaveMestra() {
    if (!this.chaveMestraInput.trim()) {
      this.mensagemErroChave = 'Por favor, insira a chave mestra.';
      return;
    }
    this.executarOperacaoPendente();
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

  // --- Comunicação com Servidor ---

  enviarAtualizacaoParaServidor(dados: any[], masterKey: string) {
    this.carteiraService.updateCarteiraData(dados, masterKey).subscribe({
      next: (message) => {
        if (!verifywithHMAC(JSON.stringify(message.data), message.hmac)) {
          this.mensagemErro = 'Falha na verificação dos dados da carteira.';
          return;
        }
        this.dadosCarteira = dados;
      },
      error: (error) => {
        alert('Erro ao guardar as alterações. Tente novamente.');
      }
    });
  }

  // --- Autenticação ---

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


  onSearch(query: string) {
    if (!query.trim()) {
      this.searchResults = [];
      return;
    }

    this.userService.searchUsers(query).subscribe(res => {
      this.searchResults = res;
    });
  }

  goToUserWallet(username: string) {
    this.router.navigate(['/carteira', username]);
  }
  
}
