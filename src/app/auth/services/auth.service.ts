import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from "@angular/common/http";
import { from, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API: string = 'http://localhost:5000/api/auth';

  /**
   * Construtor do serviço de autenticação.
   * Inicializa o serviço com o HttpClient para chamadas à API.
   * Parâmetros: http: cliente HTTP do Angular usado para enviar requisições.
   */
  public constructor(private readonly http: HttpClient) {}


   /**
   * requestLoginCode()
   * Solicita à API o envio de um código OTP para o e-mail informado.
   * Faz uma requisição POST para /start com o e-mail do utilizador.
   * Retorna um Observable com a resposta HTTP, incluindo status e body.
   */
  public requestLoginCode(email: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.API}/start`, { email }, { observe: "response", withCredentials: true });
  }


  /**
   * verifyLoginCode()
   * Verifica o código OTP enviado ao utilizador.
   * Faz uma requisição POST para /verify com email, challenge_id e code.
   * Se o código for válido, a API confirma a autenticação.
   * Retorna um Observable com a resposta HTTP.
   */
  public verifyLoginCode(email: string, challenge_id: string, code: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.API}/verify`, { email, challenge_id, code }, { observe: "response", withCredentials: true });
  }


  /**
   * me()
   * Obtém informações do utilizador autenticado.
   * Faz uma requisição GET para /me com cookies de sessão.
   * Retorna um Observable com os dados do utilizador.
   */
  public me(): Observable<any> {
    return this.http.get<any>(`${this.API}/me`, { withCredentials: true });
  }


  /**
   * logout()
   * Finaliza a sessão do utilizador.
   * Faz uma requisição POST para /logout, removendo cookies JWT.
   * Retorna um Observable com a confirmação do logout.
   */
  public logout(): Observable<any> {
    return this.http.post<any>(`${this.API}/logout`,{},{ withCredentials: true });
  }


  /**
   * refresh()
   * Solicita à API a renovação do access token usando o refresh token.
   * Faz uma requisição POST para /refresh.
   * Retorna um Observable com o novo token de acesso.
   */
  public refresh(): Observable<any> {
    return this.http.post<any>(`${this.API}/refresh`, {}, { withCredentials: true });
  }


  /**
   * startSignature()
   * Inicia o processo de autenticação por assinatura digital.
   * Faz uma requisição POST para /signature/start com o e-mail.
   * Retorna um Observable com challenge_id e nonce.
   */
  public startSignature(email: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.API}/signature/start`,{ email },{ observe: "response", withCredentials: true });
  }


  /**
   * verifySignature()
   * Verifica a assinatura digital enviada pelo utilizador.
   * Converte o ficheiro em Base64 e envia via POST para /signature/verify.
   * Se a assinatura for válida, a API confirma a autenticação.
   * Retorna um Observable com a resposta HTTP.
   */
  public verifySignature(email: string, challenge_id: string, file: File): Observable<HttpResponse<any>> {
    return from(this.fileToBase64(file)).pipe(
      switchMap(signature => {
        return this.http.post<any>(
          `${this.API}/signature/verify`,
          { email, challenge_id, signature },
          { observe: "response", withCredentials: true }
        );
      })
    );
  }


 /**
   * fileToBase64()
   * Converte um ficheiro em string Base64 para envio à API.
   * Utiliza FileReader para ler o conteúdo do ficheiro.
   * Retorna uma Promise com o conteúdo em Base64.
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        resolve(base64);
      };
      reader.onerror = () => reject("Erro ao ler arquivo");
      reader.readAsDataURL(file);
    });
  }
}
