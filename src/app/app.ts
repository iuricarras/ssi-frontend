import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';


/**
 * Componente raiz da aplicação Angular.
 * Define o ponto de entrada da aplicação com o seletor <app-root>.
 * RouterOutlet para renderizar dinamicamente os componentes associados às rotas definidas em APP_ROUTES.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('BitsOfMe');
}
