import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VerificationService {

  private baseUrl = 'http://localhost:5000/api/verify';

  constructor(private http: HttpClient) {}


  /**
   * requestVerification(data)
   * Envia um pedido de verificação para a API.
   * Faz uma requisição POST para /request-verification.
   * Inclui os dados necessários no corpo da requisição.
   * Retorna um Observable com a resposta da API.
   */
  requestVerification(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/request-verification`, data, { withCredentials: true });
  }


  /**
   * acceptVerification(data)
   * Aceita um pedido de verificação existente.
   * Faz uma requisição POST para /accept-verification.
   * Inclui os dados necessários no corpo da requisição.
   * Retorna um Observable com a resposta da API.
   */
  acceptVerification(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/accept-verification`, data, { withCredentials: true });
  }


  /**
   * getVerification(verificationId, masterKey)
   * Obtém os detalhes de uma verificação específica.
   * Faz uma requisição PUT para /get-verifications/:id.
   * Envia a masterKey no corpo da requisição para autenticação.
   * Retorna um Observable com os dados da verificação.
   */
  getVerification(verificationId: string, masterKey: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/get-verifications/${verificationId}`, { masterKey }, { withCredentials: true });
  }


  /**
   * getPendingVerifications()
   * Obtém todas as verificações pendentes.
   * Faz uma requisição GET para /get-pending.
   * Retorna um Observable com a lista de verificações ainda não aceites.
   */
  getPendingVerifications(): Observable<any> {
    return this.http.get(`${this.baseUrl}/get-pending`, { withCredentials: true });
  }

  getAllVerifications(): Observable<any> {
    return this.http.get(`${this.baseUrl}/get-all-verifications`, { withCredentials: true });
  }
}
