import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CarteiraService, UserData, CarteiraData } from '../../services/carteira.services';

@Component({
  selector: 'app-carteira-user',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './carteira-user.html',
  styleUrls: ['./carteira-user.css']
})

export class CarteiraUser implements OnInit {
  mensagemErro: string = '';
  developmentMode: boolean = false;
  
  nome: string = '';
  username: string = '';
  email: string = '';
  dadosCarteira: any[] = [];

  dadosAcessiveis: boolean = false; 
  certificadora: boolean = false;

  // Modals
  mostrarModalConfirmacao: boolean = false;
  itemSelecionado: any = null;
  mensagemPedido: string = '';
  chavePedido: string = '';

  mostrarModalEnviarCertificado: boolean = false;
  certForm: any = {
    nome: '',
    entidade: '',
    emissao: '',
    campos: [] as Array<{ chave: string; valor: string }>
  };
  emissorNome: string = '';

  constructor(
    private carteiraService: CarteiraService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // obter utilizador da URL
    this.route.params.subscribe(params => {
      this.username = params['username'];
      this.carregarDadosUtilizador();
      this.carregarDadosCarteiraPublica();
    });
    // obter info do utilizador autenticado
    this.loadAuthenticatedName();
  }

  // Abre modal de confirmação para pedir informação
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
    if (this.developmentMode) {
      console.log('Simulated requestInfo payload:', payload);
      this.fecharConfirmacao();
      return;
    }
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

  // Modal para enviar certificado 
  abrirModalEnviar() {
    this.mostrarModalEnviarCertificado = true;
    this.certForm = { nome: '', entidade: this.emissorNome || '', emissão: this.getTodayIsoDate(), campos: [{ chave: '', valor: '' }] };
  }
  fecharModalEnviar() {
    this.mostrarModalEnviarCertificado = false;
    this.certForm = { nome: '', entidade: '', emissao: '', campos: [] };
  }
  enviarCertificado() {
    const camposFiltrados = (this.certForm.campos || []).filter((c: any) => c && c.chave && c.chave.toString().trim() !== '');
    const camposObj: any = {};
    camposFiltrados.forEach((c: any) => {
      if (c && c.chave) {
        camposObj[c.chave] = c.valor;
      }
    });
    const payload: any = {
      nome: this.certForm.nome,
      entidade: this.certForm.entidade,
      emissão: this.certForm.emissão,
      ...camposObj
    };

    if (this.developmentMode) {
      console.log('Simulated sendCertificate payload (flattened):', payload);
      this.fecharModalEnviar();
      return;
    }

    this.carteiraService.sendCertificate(this.username, payload).subscribe({
      next: (resp) => {
        this.fecharModalEnviar();
      },
      error: (err) => {
        this.mensagemErro = 'Erro ao enviar certificado.';
        this.fecharModalEnviar();
      }
    });
  }

  loadAuthenticatedName() {
    if (this.developmentMode) {
      this.emissorNome = 'Entidade Emissora';
      this.certificadora = true;
      return;
    }
    this.carteiraService.getUserData().subscribe({
      next: (user) => {
        this.emissorNome = user?.name || '';
        this.certificadora = !!(user && (user as any).nif); // se tem nif é certificadora
      },
      error: () => {
        this.emissorNome = '';
        this.certificadora = false;
      }
    });
  }

  getTodayIsoDate(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${dd}-${mm}-${yyyy}`;
  }

  adicionarCampo() {
    if (!this.certForm.campos) this.certForm.campos = [];
    this.certForm.campos.push({ chave: '', valor: '' });
  }

  removerCampo(index: number) {
    if (!this.certForm.campos) return;
    this.certForm.campos.splice(index, 1);
  }

  carregarDadosUtilizador() {
    if (this.developmentMode) {
      this.nome = 'João Santos';
      this.username = 'joaosantos';
      this.email = 'joao.santos@exemplo.com';
      return;
    }

    this.carteiraService.getUserDataByUsername(this.username).subscribe({
      next: (userData: UserData) => {
        this.nome = userData.name;
        this.username = userData.username;
        this.email = userData.email;
      },
      error: () => {
        this.nome = 'Utilizador não encontrado';
        this.mensagemErro = 'Erro ao carregar dados do utilizador.';
      }
    });
  }

  carregarDadosCarteiraPublica() {
    if (this.developmentMode) {
      const mockData = {
        personalData: [
          { name: 'Profissão'},
          { name: 'Localização'}
        ],
        certificates: [
          {
            nome: 'Licenciatura em Engenharia Informática'
          }
        ]
      };

      this.dadosCarteira = this.processarDadosCarteira(mockData);
    }
    this.carteiraService.getCarteiraDataByUsername(this.username).subscribe({
      next: (carteiraData: CarteiraData) => {
        this.dadosCarteira = this.processarDadosCarteira(carteiraData);
      },
      error: (error: any) => {
        this.mensagemErro = 'Erro ao carregar dados da carteira.';
      }
    });
  }

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
}