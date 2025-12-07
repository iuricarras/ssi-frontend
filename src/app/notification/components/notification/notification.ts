import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { NotificationService, Notification } from '../../services/notification.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/services/auth.service'; // Para o logout
import { verifywithHMAC } from '../../../utils/hmac';
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
      next: (message) => {
        var data = message.data;
        var hmac = message.hmac;
        if (!verifywithHMAC(JSON.stringify(data), hmac)) {
          this.errorMessage = "Falha na verificação de integridade dos dados.";
          this.isLoading = false;
          return;
        }
        // O backend retorna um objeto com a chave 'notifications'
        this.notifications = data || [];
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

    // A chave mestra é obrigatória para aceitar adição de certificados
    if (this.selectedNotification.type === 'CERTIFICATE_ADDITION' && !this.masterKey.trim()) {
      this.modalErrorMessage = "A Chave Mestra é obrigatória para adicionar um certificado.";
      return;
    }

    this.modalErrorMessage = null;
    this.isLoading = true;

    // Master Key pode ser null se o tipo de notificação não for CERTIFICATE_ADDITION
    const key = this.selectedNotification.type === 'CERTIFICATE_ADDITION' ? this.masterKey : null;
    
    this.notificationService.respondToNotification(this.selectedNotification.notification_id, 'ACCEPT', key).subscribe({
      next: (message) => {
        var data = message.data;
        var hmac = message.hmac;
        if (!verifywithHMAC(JSON.stringify(data), hmac)) {
          this.modalErrorMessage = "Falha na verificação de integridade dos dados.";
          this.isLoading = false;
          return;
        }
        this.successMessage = data.message || "Requisição aceite com sucesso.";
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
      next: (message) => {
        var data = message.data;
        var hmac = message.hmac;
        if (!verifywithHMAC(JSON.stringify(data), hmac)) {
          this.errorMessage = "Falha na verificação de integridade dos dados.";
          this.isLoading = false;
          return;
        }
        this.successMessage = data.message || "Requisição rejeitada com sucesso.";
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
    // Adicionar outros títulos conforme os tipos de notificação...
    return 'Nova Requisição Pendente';
  }
}