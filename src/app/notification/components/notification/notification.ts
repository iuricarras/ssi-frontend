import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { NotificationService, Notification } from '../../services/notification.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/services/auth.service'; // Para o logout

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    RouterModule,
    DatePipe,
    FormsModule
  ],
  templateUrl: './notification.html',
  styleUrls: ['./notification.css']
})
export class NotificationComponent implements OnInit {

  notifications: Notification[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Modal State
  isModalOpen: boolean = false;
  selectedNotification: Notification | null = null;
  masterKey: string = '';
  modalErrorMessage: string | null = null;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.notificationService.getPendingNotifications().subscribe({
      next: (res: Notification[] | any) => {
        // O backend retorna um objeto com a chave 'notifications'
        this.notifications = res.notifications || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = "Erro ao carregar notificações. Por favor, tente novamente.";
        this.isLoading = false;
      }
    });
  }

  // --- Gestão de Modais e Ações ---

  openAcceptModal(notification: Notification): void {
    this.selectedNotification = notification;
    this.masterKey = '';
    this.modalErrorMessage = null;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedNotification = null;
    this.masterKey = '';
    this.modalErrorMessage = null;
  }

  handleAccept(): void {
    if (!this.selectedNotification) return;

    // A chave mestra do UTILIZADOR é OBRIGATÓRIA para aceitar QUALQUER tipo de requisição
    // que envolva escrita (certificado) ou decifração/re-cifração (verificação).
    if (!this.masterKey.trim()) {
      this.modalErrorMessage = "A sua Chave Mestra é obrigatória para processar esta requisição.";
      return;
    }

    this.modalErrorMessage = null;
    this.isLoading = true;

    this.notificationService.respondToNotification(this.selectedNotification.notification_id, 'ACCEPT', this.masterKey).subscribe({
      next: (resp) => {
        this.successMessage = resp.body?.message || "Requisição aceite com sucesso.";
        this.closeModal();
        this.loadNotifications(); 
      },
      error: (err) => {
        this.modalErrorMessage = err.error?.error || "Erro ao aceitar a requisição.";
        this.isLoading = false;
      }
    });
  }

  handleReject(notification: Notification): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    
    this.notificationService.respondToNotification(notification.notification_id, 'REJECT').subscribe({
      next: (resp) => {
        this.successMessage = resp.body?.message || "Requisição rejeitada com sucesso.";
        this.loadNotifications();
      },
      error: (err) => {
        this.errorMessage = err.error?.error || "Erro ao rejeitar a requisição.";
        this.isLoading = false;
      }
    });
  }

  // --- Navegação e Logout ---

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

  // --- Helpers ---
  getNotificationTitle(notification: Notification): string {
    if (notification.type === 'CERTIFICATE_ADDITION') {
      return `Novo Certificado: ${notification.payload.certificate_name}`;
    }
    if (notification.type === 'VERIFICATION_REQUEST') {
      return `Pedido de Verificação: ${notification.payload.certificate_name || notification.payload.data_type_name}`;
    }
    return 'Nova Requisição Pendente';
  }
}