import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from './services/user.service';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AuthService } from '../../auth/services/auth.service';
import { CarteiraService } from '../../carteira/services/carteira.services';
import { verifywithHMAC } from '../../utils/hmac';
@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './main-page.html',
  styleUrls: ['./main-page.css']
})
export class MainPage {

  searchControl = new FormControl('');
  searchResults: any[] = [];
  certificadora: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private carteiraService: CarteiraService,
    private authService: AuthService) {
    this.loadAuthenticated();
     this.searchControl.valueChanges.subscribe(value => {
      this.onSearch(value || '');
    });
  }


  /**
   * onLogout()
   * Faz logout do utilizador chamando o AuthService.
   * Se a operação for bem-sucedida, redireciona para /auth/home-login.
   * Se ocorrer erro, mostra no terminal e redireciona igualmente para /auth/home-login.
   */
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


  /**
   * onSearch(query: string)
   * Executa pesquisa de utilizadores com base no texto inserido.
   * Se a query estiver vazia, limpa os resultados.
   * Caso contrário, chama userService.searchUsers(query) e atualiza searchResults.
   */
  onSearch(query: string) {
  if (!query.trim()) {
    this.searchResults = [];
    return;
  }

  this.userService.searchUsers(query).subscribe(res => {
    this.searchResults = res;
  });
  }


  /**
   * selectUser(username: string)
   * Define o valor do campo de pesquisa para o username selecionado.
   * Usado quando o utilizador escolhe um item da lista de resultados.
   */
  selectUser(username: string) {
    this.searchControl.setValue(username);
  }


  /**
   * goToUserWallet(username: string)
   * Redireciona para a carteira pública do utilizador selecionado.
   * Se não houver username, não faz nada.
   * Caso contrário, limpa o campo de pesquisa e navega para /carteira/public/:username.
   */
  goToUserWallet(username: string) {
    if (!username) return;
    this.searchControl.setValue('');
    this.router.navigate(['/carteira/public', username]);
  }


  /**
   * loadAuthenticated()
   * Carrega dados do utilizador autenticado através da CarteiraService.
   * Se a resposta contiver dados válidos e a verificação HMAC for bem sucedida:
   *   - Mostra os dados no temrinal.
   *   - Define certificadora como true se o utilizador for uma entidade credenciadora (isEC).
   * Se a verificação falhar, mostra erro no terminal.
   * Em caso de erro na requisição, define certificadora como false.
   */
  loadAuthenticated() {
    this.carteiraService.getUserData().subscribe({
      next: (message) => {
        var user = message.data;
        if (verifywithHMAC(JSON.stringify(user), message.hmac)) {
          console.log('User data loaded:', user);
          this.certificadora = !!(user && user.isEC);
        } else {
          console.error('HMAC verification failed for user data');
        }
      },
      error: () => {
        this.certificadora = false;
      }
    });
  }
 
}
