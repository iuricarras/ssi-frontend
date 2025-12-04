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

@Injectable({
  providedIn: 'root'
})
export class CarteiraService {
  private readonly API = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  // para utilizador autenticado
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

  // para visualizar carteiras por username
  getUserDataByUsername(username: string): Observable<UserData> {
    return this.http.get<UserData>(`${this.API}/carteira/user/${encodeURIComponent(username)}/profile`, { withCredentials: true });
  }
  getCarteiraDataByUsername(username: string): Observable<CarteiraData> {
    return this.http.get<CarteiraData>(`${this.API}/carteira/user/${encodeURIComponent(username)}`, { withCredentials: true });
  }

  // enviar certificado assinado
  sendCertificateWithSignature(username: string, certificate: any, signature: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.API}/carteira/user/certificates`,
      { username, certificate, signature },
      { observe: 'response', withCredentials: true }
    );
  }

  requestVerification(verificationUser: string, verificationDataType: any, masterKey: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.API}/verify/request-verification`,
      { verificationUser, verificationDataType, masterKey },
      { observe: 'response', withCredentials: true }
    );
  }
  
}
