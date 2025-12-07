import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';

/**
 * Componente responsável pela página inicial de login.
 *
 * Verifica se o utilizador já está autenticado ao inicializar.
 * Se estiver autenticado, redireciona automaticamente para /home/main-page.
 * Caso contrário, mantém o utilizador na página de login.
 */
@Component({
  selector: 'app-home-login',
  standalone: true,
  imports: [RouterModule, MatCardModule, MatButtonModule],
  templateUrl: './home-login.html',
  styleUrls: ['./home-login.css']
})
export class HomeLogin implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}


   /**
   * Método do Angular chamado ao inicializar o componente.
   *
   * Chama authService.me() para verificar se existe sessão válida.
   * Se a chamada for bem-sucedida, redireciona para /home/main-page.
   * Se falhar, não faz nada (mantém o utilizador na página de login).
   */
  ngOnInit(): void {
    this.authService.me().subscribe({
      next: () => { this.router.navigateByUrl("/home/main-page"); },
      error: () => {}
    });
  }
}
