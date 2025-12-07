import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CarteiraService, UserData, CarteiraData, VerificationRequestPayload } from '../../services/carteira.services'; 
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
  userId: string = '';
  email: string = '';
  dadosCarteira: any[] = [];

  // Permissões e Flags
  dadosAcessiveis: boolean = false; 
  certificadora: boolean = false;

  // --- Modals: Pedido de Informação ---
  mostrarModalConfirmacao: boolean = false;
  itemSelecionado: any = null;
  mensagemPedido: string = '';
  chavePedido: string = ''; // Chave mestra do EC (requerente) para cifrar o segredo.

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
    // Obter username 
    this.route.paramMap.subscribe(params => {
      const username = params.get('username');
      if (username) {
        this.username = username;
        this.carregarDadosCarteiraPublica();
        this.loadAuthenticatedName();
      }
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
          this.userId = userData.id;
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
          if (this.username && user.username === this.username) {
            this.router.navigate(['/carteira']);
          }
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
  // 2. Pedido de Informação (Requisição de Verificação)
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
    this.mensagemErro = ''; // Limpa a mensagem de erro ao fechar
  }

  confirmarPedido() {
    if (!this.itemSelecionado) return;
    if (!this.chavePedido || this.chavePedido.trim() === '') {
      this.mensagemErro = 'É necessário fornecer uma chave para o pedido.';
      return;
    }
    
    // O EC está a enviar a sua chave mestra (chavePedido) e o email do utilizador (this.email)
    // e o objeto de dados (this.itemSelecionado: {chave: 'nome_campo'} ou {nome: 'nome_cert'})
    this.carteiraService.requestVerification(this.email, this.itemSelecionado, this.chavePedido).subscribe({
      next: (resp) => {
        alert('Pedido de informação submetido com sucesso! O utilizador receberá uma notificação.');
        this.fecharConfirmacao();
      },
      error: (err) => {
        this.mensagemErro = err.error?.error || 'Erro ao enviar pedido de informação.';
        alert(this.mensagemErro);
        this.fecharConfirmacao();
      }
    });
  }

  // ==================================================================================
  // 3. Envio de Certificado (Requisição de Adição de Certificado)
  // ==================================================================================

  abrirModalEnviar() {
    this.mostrarModalEnviarCertificado = true;
    this.certForm = { nome: '', entidade: this.emissorNome, emissao: this.dataEmissao, campos: [{ chave: '', valor: '' }] };
  }

  fecharModalEnviar() {
    this.mostrarModalEnviarCertificado = false;
    this.certForm = { nome: '', entidade: '', emissao: '', campos: [] };
    this.signatureContent = null;
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
   * NOTE: O backend espera os dados do certificado no formato de mapa (chave: valor).
   */
  prepararPayload(): any {
    const certificateData: any = {
      nome: this.certForm.nome,
      entidade: this.emissorNome,
      emissao: this.dataEmissao,
    };

    (this.certForm.campos || []).forEach((c: any) => {
      if (c && c.chave && c.chave.toString().trim() !== '') {
        // Assume que a chave do campo será a chave no objeto final
        certificateData[c.chave] = c.valor; 
      }
    });

    return certificateData;
  }

  /**
   * Gera o ficheiro JSON para o utilizador descarregar e assinar localmente.
   */
  gerarJson() {
    const payload = this.prepararPayload();
    // Para download e assinatura, queremos o JSON completo com todos os campos
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
      alert('Por favor faça upload da assinatura antes de enviar.');
      return;
    }
    if (!this.certForm.nome.trim()) {
        alert('O nome do certificado é obrigatório.');
        return;
    }
    
    // 1. Prepara os dados base do certificado
    const certificateData = this.prepararPayload();
    
    // 2. Adiciona a assinatura da EC ao objeto de dados do certificado, pois o backend
    // espera a assinatura DENTRO de `certificate_data` para verificação.
    certificateData.signature = this.signatureContent; 
    
    // 3. Usa o novo método do serviço que aponta para /notifications/request-certificate
    this.carteiraService.sendCertificateAddition(
      this.email, // O email do utilizador alvo
      certificateData
    ).subscribe({
      next: (resp) => {
        alert('Requisição de Certificado submetida com sucesso! O utilizador será notificado.');
        this.fecharModalEnviar();
        this.signatureContent = null;
      },
      error: (err) => {
        alert(`Erro ao submeter requisição de certificado: ${err.error?.error || 'Erro desconhecido'}`);
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
    this.router.navigate(['/carteira/public', username]);
  }
}