import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CarteiraService, UserData, CarteiraData } from '../../services/carteira.services';
import { AuthService } from '../../../auth/services/auth.service';
import { UserService } from '../../../home/main-page/services/user.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { verifywithHMAC } from '../../../utils/hmac';
@Component({
  selector: 'app-carteira-user',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatAutocompleteModule
  ],
  templateUrl: './carteira-user.html',
  styleUrls: ['./carteira-user.css']
})
export class CarteiraUser implements OnInit {
  // --- Variáveis de Estado ---
  mensagemErro: string = '';
  
  // Dados do Utilizador (Perfil Visualizado)
  nome: string = '';
  username: string = '';
  email: string = '';
  dadosCarteira: any[] = [];

  // Permissões e Flags
  dadosAcessiveis: boolean = false; 
  certificadora: boolean = false;

  // --- Modals: Pedido de Informação ---
  mostrarModalConfirmacao: boolean = false;
  itemSelecionado: any = null;
  mensagemPedido: string = '';
  chavePedido: string = '';

  // --- Modals: Envio de Certificado ---
  mostrarModalEnviarCertificado: boolean = false;
  certForm: any = {
    nome: '',
    entidade: '',
    emissao: '',
    campos: [] as Array<{ chave: string; valor: string }>
  };
  emissorNome: string = '';
  dataEmissao: string = '';
  signatureContent: string | null = null;
  lastGeneratedJson: string | null = null;

  // --- Pesquisa ---
  searchControl = new FormControl('');
  searchResults: any[] = [];

  constructor(
    private router: Router,
    private carteiraService: CarteiraService,
    private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService
  ) {}


  ngOnInit() {
    // 1. Obter username da URL e carregar dados públicos da carteira
    this.route.params.subscribe(params => {
      this.username = params['username'];
      this.carregarDadosCarteiraPublica();
    });

    // 2. Obter info do utilizador autenticado (para saber se é certificadora, etc.)
    this.loadAuthenticatedName();
    this.dataEmissao = this.getTodayIsoDate();

    this.searchControl.valueChanges.subscribe(value => {
      this.onSearch(value || '');
    });
  }

  // ==================================================================================
  // 1. Carregamento de Dados (Perfil e Carteira)
  // ==================================================================================

  /**
   * Carrega os dados públicos do utilizador (nome, email) e os itens da sua carteira.
   */
  carregarDadosCarteiraPublica() {
    // Dados básicos do utilizador
    this.carteiraService.getUserDataByUsername(this.username).subscribe({
      next: (message) => {
        var userData = message.data;
        if (verifywithHMAC(JSON.stringify(userData), message.hmac)) {
          this.nome = userData.nome;
          this.email = userData.email || '';
          this.username = userData.username || "";
        } else {
          console.error('HMAC verification failed for user data');
        }
      },
      error: (error: any) => {
        this.nome = 'Utilizador não encontrado';
      }
    });

    // Dados da carteira (apenas estrutura pública)
    this.carteiraService.getCarteiraDataByUsername(this.username).subscribe({
      next: (message) => {
        var carteiraData = message.data;
        if (verifywithHMAC(JSON.stringify(carteiraData), message.hmac)) {
          this.dadosCarteira = this.processarDadosCarteira(carteiraData);
        } else {
          console.error('HMAC verification failed for carteira data');
        }
      }
    });
  }

  /**
   * Carrega dados do utilizador autenticado (quem está a ver a página).
   * Útil para preencher o nome do emissor se for uma certificadora.
   */
  loadAuthenticatedName() {
    this.carteiraService.getUserData().subscribe({
      next: (message) => {
        var user = message.data;
        if (verifywithHMAC(JSON.stringify(user), message.hmac)) {
          this.emissorNome = user.nome;
          console.log('User data loaded:', user);
          this.certificadora = !!(user && user.isEC);
        } else {
          console.error('HMAC verification failed for user data');
        }
      },
      error: () => {
        this.emissorNome = '';
        this.certificadora = false;
      }
    });
  }

  /**
   * Processa os dados brutos da carteira para separar e formatar para a view.
   */
  private processarDadosCarteira(carteiraData: any): any[] {
    const dados: any[] = [];

    // Dados pessoais públicos: apenas guardar o nome da chave (campo)
    if (carteiraData.personalData && Array.isArray(carteiraData.personalData)) {
      carteiraData.personalData.forEach((item: any) => {
        if (item.name) {
          dados.push({
            tipo: 'personalData',
            chave: item.name
          });
        }
      });
    }

    // Certificados públicos: apenas guardar os nomes dos campos (chaves)
    if (carteiraData.certificates && Array.isArray(carteiraData.certificates)) {
      carteiraData.certificates.forEach((cert: any) => {
        const certificadoAgrupado: any = {
          tipo: 'certificate',
          nome: cert.nome
        };

        if (certificadoAgrupado.nome) {
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

  // ==================================================================================
  // 2. Pedido de Informação
  // ==================================================================================

  abrirConfirmacaoPedido(item: any) {
    this.itemSelecionado = item;
    this.mensagemPedido = '';
    this.chavePedido = '';
    this.mostrarModalConfirmacao = true;
  }

  fecharConfirmacao() {
    this.mostrarModalConfirmacao = false;
    this.itemSelecionado = null;
    this.mensagemPedido = '';
    this.chavePedido = '';
  }

  confirmarPedido() {
    if (!this.itemSelecionado) return;
    if (!this.chavePedido || this.chavePedido.trim() === '') {
      this.mensagemErro = 'É necessário fornecer uma chave para o pedido.';
      return;
    }
    const payload = { item: this.itemSelecionado, mensagem: this.mensagemPedido, chave: this.chavePedido };
    this.carteiraService.requestInfo(this.username, payload).subscribe({
      next: (resp) => {
        this.fecharConfirmacao();
      },
      error: (err) => {
        this.mensagemErro = 'Erro ao enviar pedido de informação.';
        this.fecharConfirmacao();
      }
    });
  }

  // ==================================================================================
  // 3. Envio de Certificado 
  // ==================================================================================

  abrirModalEnviar() {
    this.mostrarModalEnviarCertificado = true;
    this.certForm = { nome: '', entidade: this.emissorNome, emissao: this.dataEmissao, campos: [{ chave: '', valor: '' }] };
  }

  fecharModalEnviar() {
    this.mostrarModalEnviarCertificado = false;
    this.certForm = { nome: '', entidade: '', emissao: '', campos: [] };
  }

  adicionarCampo() {
    if (!this.certForm.campos) this.certForm.campos = [];
    this.certForm.campos.push({ chave: '', valor: '' });
  }

  removerCampo(index: number) {
    if (!this.certForm.campos) return;
    this.certForm.campos.splice(index, 1);
  }

  /**
   * Constrói o payload JSON para assinatura e download.
   */
  prepararPayload() {
    const camposFiltrados = (this.certForm.campos || []).filter((c: any) => c && c.chave && c.chave.toString().trim() !== '');
    const payload: any = {
      nome: this.certForm.nome,
      entidade: this.emissorNome,
      emissao: this.dataEmissao,
      campos: camposFiltrados.map((c: any) => ({ chave: c.chave, valor: c.valor }))
    };
    return payload;
  }

  /**
   * Gera o ficheiro JSON para o utilizador descarregar e assinar localmente.
   */
  gerarJson() {
    const payload = this.prepararPayload();
    const jsonStr = JSON.stringify(payload, null, 2);
    this.lastGeneratedJson = jsonStr;

    // Trigger download
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(this.certForm.nome || 'certificado').replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Processa o ficheiro de assinatura selecionado pelo utilizador.
   * Lê o ficheiro como ArrayBuffer e converte para Base64.
   */
  onSignatureSelected(event: any) {
    const file = event?.target?.files && event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        this.signatureContent = btoa(binary);
      };
      reader.readAsArrayBuffer(file);
    } else {
      this.signatureContent = null;
    }
  }

  /**
   * Envia o certificado (JSON) e a assinatura para o servidor.
   */
  enviarCertificadoComAssinatura() {
    if (!this.signatureContent) {
      this.mensagemErro = 'Por favor faça upload da assinatura antes de enviar.';
      return;
    }

    const payload = this.prepararPayload();
    
    console.log('Sending certificate:', payload, 'Signature:', this.signatureContent);

    this.carteiraService.sendCertificateWithSignature(this.username, payload, this.signatureContent).subscribe({
      next: (resp) => {
        this.fecharModalEnviar();
        this.signatureContent = null;
      },
      error: (err) => {
        this.mensagemErro = 'Erro ao enviar certificado com assinatura.';
        this.fecharModalEnviar();
        this.signatureContent = null;
      }
    });
  }

  // ==================================================================================
  // 4. Helpers e Navegação
  // ==================================================================================

  getTodayIsoDate(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${dd}-${mm}-${yyyy}`;
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