import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from "@angular/common/http";
import { Observable } from 'rxjs';
import {HMACPayload, signwithHMAC} from '../../utils/hmac';
export interface UserData {
  id: string;
  nome: string;
  username?: string | "";
  email?: string | "";
  isEC?: boolean | false;
}

export interface CarteiraData {
  certificates: any[];
  personalData: any;
}

// Interface para o payload de requisição de verificação (para endpoint /verify/request-verification)
export interface VerificationRequestPayload {
  masterKey: string;
  verificationUser: string; // ID (email) do utilizador alvo
  verificationDataType: string; // Campo ou nome do certificado solicitado
}

@Injectable({
  providedIn: 'root'
})
export class CarteiraService {
  private readonly API = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  /**
   * getUserData()
   * Obtém os dados básicos do utilizador autenticado.
   * Endpoint: /auth/me
   * Retorna objeto HMACPayload<UserData> com id, nome, username, email e flag isEC.
   * Usa withCredentials para enviar cookies/sessão.
   */
  getUserData(): Observable<HMACPayload<UserData>> {
    return this.http.get<HMACPayload<UserData>>(`${this.API}/auth/me`, { withCredentials: true });
  // Utilizador Autenticado 
  }

  /**
   * getCarteiraData(masterKey)
   * Obtém os dados da carteira do utilizador autenticado.
   * Endpoint: /carteira/
   * Envia masterKey no corpo da requisição.
   * Assina o payload com HMAC para garantir integridade.
   * Retorna os dados pessoais e certificados.
   */
  getCarteiraData(masterKey: string): Observable<HMACPayload<CarteiraData>> {
    return this.http.post<HMACPayload<CarteiraData>>(`${this.API}/carteira/`, { "data": {masterKey} , "hmac": signwithHMAC(JSON.parse(JSON.stringify({masterKey})))}, { withCredentials: true });
  }

  /**
   * updateCarteiraData(carteiraData, masterKey)
   * Atualiza os dados da carteira do utilizador autenticado.
   * Endpoint: /carteira/update
   * Envia os dados da carteira e masterKey.
   * Assina o payload com HMAC.
   * Retorna resposta validada com HMACPayload<any>.
   */
  updateCarteiraData(carteiraData: any, masterKey: string): Observable<HMACPayload<any>> {
    return this.http.put<HMACPayload<any>>(`${this.API}/carteira/update`, 
      { data: {data: carteiraData, masterKey: masterKey} , hmac: signwithHMAC(JSON.parse(JSON.stringify({data: carteiraData, masterKey}))) }, 
      { withCredentials: true }
    );
  }


  // Visualização de dados de um utilizador e da sua carteira 
  getUserDataByUsername(username: string): Observable<HMACPayload<UserData>> {
    return this.http.get<HMACPayload<UserData>>(`${this.API}/carteira/user/${encodeURIComponent(username)}/profile`, { withCredentials: true });
  }
  getCarteiraDataByUsername(username: string): Observable<HMACPayload<CarteiraData>> {
    return this.http.get<HMACPayload<CarteiraData>>(`${this.API}/carteira/user/${encodeURIComponent(username)}`, { withCredentials: true });
  }

  // ENDPOINTS NOTIFICAÇÕES/VERIFICAÇÃO

  /** * Solicita uma nova verificação de dados a um utilizador (usado pela EC/requerente).
   * Endpoint do backend: /verify/request-verification
   */
  // requestVerification(payload: VerificationRequestPayload): Observable<HttpResponse<any>> {
  //   return this.http.post<any>(`${this.API}/verify/request-verification`,
  //     payload,
  //     { observe: 'response', withCredentials: true }
  //   );
  // }

 
   /**
   * requestVerification(verificationUser, verificationDataType, masterKey)
   * Solicita uma verificação de dados a outro utilizador (usado pela EC/requerente).
   * Endpoint: /verify/request-verification
   * Envia email do utilizador alvo, tipo de dado a verificar e masterKey.
   * Assina payload com HMAC.
   * Retorna resposta validada com HMACPayload<any>.
   */
  requestVerification(verificationUser: string, verificationDataType: any, masterKey: string): Observable<HMACPayload<any>> {
    return this.http.post<HMACPayload<any>>(`${this.API}/verify/request-verification`,
      { data: {verificationUser, verificationDataType, masterKey} , hmac: signwithHMAC(JSON.parse(JSON.stringify({verificationUser, verificationDataType, masterKey}))) },
      { withCredentials: true }
    );
  }

  /**
   * sendCertificateAddition(recipientEmail, certificateData)
   * EC solicita a adição de um certificado assinado à carteira de um utilizador.
   * Endpoint do backend: /notifications/request-certificate
   * Envia recipient_email e certificate_data (inclui assinatura digital da EC).
   * Assina o payload com HMAC.
   * Retorna resposta validada com HMACPayload<any>.
   * NOTE: A assinatura digital da EC deve estar DENTRO do certificateData.
   */
  sendCertificateAddition(recipientEmail: string, certificateData: any): Observable<HMACPayload<any>> {
    // O backend de notificação espera { recipient_email, certificate_data }
    const data = {
      recipient_email: recipientEmail,
      certificate_data: certificateData
    };
    
    return this.http.post<HMACPayload<any>>(`${this.API}/notifications/request-certificate`,
      {data: data , hmac: signwithHMAC(JSON.parse(JSON.stringify(data))) },
      { withCredentials: true }
    );
  }
  
}