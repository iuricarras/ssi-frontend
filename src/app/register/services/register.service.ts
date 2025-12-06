import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from "@angular/common/http";
import { Observable } from 'rxjs';
import { ECRegistrationData } from '../components/ec-register/ec-register';
import { UserRegistrationData } from '../components/user-register/user-register';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private readonly API = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}


/**
  * registerEC(data)
  * Regista uma nova entidade credenciadora (EC).
  * Recebe os dados do registo (nome, tipo, NIF, email, telefone, chaves e certificado).
  * Envia uma requisição POST para /register/ec-register com os dados fornecidos.
  * Retorna um Observable com a resposta HTTP, permitindo verificar se o registo foi bem-sucedido.
*/  
registerEC(data: ECRegistrationData): Observable<HttpResponse<void>> {
    return this.http.post<void>(`${this.API}/register/ec-register`, data, {observe: "response"});
  }


/**
  *registerUser(data)
  * Regista um novo utilizador.
  * Recebe os dados do registo (username, email, nome).
  * Envia uma requisição POST para /register/user-register com os dados fornecidos.
  * Retorna um Observable com a resposta HTTP, permitindo confirmar se o registo foi efetuado com sucesso.
*/
registerUser(data: UserRegistrationData): Observable<HttpResponse<void>> {
    return this.http.post<void>(`${this.API}/register/user-register`, data, { observe: "response" });
  }

}
