import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from "@angular/common/http";
import { Observable } from 'rxjs';

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

  // --- Utilizador Autenticado ---

  getUserData(): Observable<UserData> {
    return this.http.get<UserData>(`${this.API}/auth/me`, { withCredentials: true });
  }
  getCarteiraData(masterKey: string): Observable<CarteiraData> {
    return this.http.post<CarteiraData>(`${this.API}/carteira/`, { masterKey }, { withCredentials: true });
  }
  updateCarteiraData(carteiraData: any, masterKey: string): Observable<HttpResponse<any>> {
    return this.http.put<any>(`${this.API}/carteira/update`, 
      { data: carteiraData, masterKey: masterKey }, 
      { observe: "response", withCredentials: true }
    );
  }


  // --- Visualização de Outras Carteiras (Público) ---

  getUserDataByUsername(username: string): Observable<UserData> {
    return this.http.get<UserData>(`${this.API}/carteira/user/${encodeURIComponent(username)}/profile`, { withCredentials: true });
  }
  getCarteiraDataByUsername(username: string): Observable<CarteiraData> {
    return this.http.get<CarteiraData>(`${this.API}/carteira/user/${encodeURIComponent(username)}`, { withCredentials: true });
  }

  // --- ENDPOINTS NOTIFICAÇÕES/VERIFICAÇÃO ---

  /** * Solicita uma nova verificação de dados a um utilizador (usado pela EC/requerente).
   * Endpoint do backend: /verify/request-verification
   */
  // requestVerification(payload: VerificationRequestPayload): Observable<HttpResponse<any>> {
  //   return this.http.post<any>(`${this.API}/verify/request-verification`,
  //     payload,
  //     { observe: 'response', withCredentials: true }
  //   );
  // }

 
  requestVerification(verificationUser: string, verificationDataType: any, masterKey: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.API}/verify/request-verification`,
      { verificationUser, verificationDataType, masterKey },
      { observe: 'response', withCredentials: true }
    );
  }

  /**
   * EC solicita a adição de um certificado assinado à carteira de um utilizador.
   * Endpoint do backend: /notifications/request-certificate
   * NOTE: A assinatura digital da EC deve estar DENTRO do certificateData.
   */
  sendCertificateAddition(recipientEmail: string, certificateData: any): Observable<HttpResponse<any>> {
    // O backend de notificação espera { recipient_email, certificate_data }
    const payload = {
      recipient_email: recipientEmail,
      certificate_data: certificateData
    };
    
    return this.http.post<any>(`${this.API}/notifications/request-certificate`,
      payload,
      { observe: 'response', withCredentials: true }
    );
  }
  
}