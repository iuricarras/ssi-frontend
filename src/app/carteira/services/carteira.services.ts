import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from "@angular/common/http";
import { Observable } from 'rxjs';
import {HMACPayload} from '../../utils/hmac';
import { signwithHMAC } from '../../utils/hmac';
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
  getUserData(): Observable<HMACPayload<UserData>> {
    return this.http.get<HMACPayload<UserData>>(`${this.API}/auth/me`, { withCredentials: true });
  }
  getCarteiraData(masterKey: string): Observable<HMACPayload<CarteiraData>> {
    return this.http.post<HMACPayload<CarteiraData>>(`${this.API}/carteira/`, { "data": {masterKey} , "hmac": signwithHMAC(JSON.parse(JSON.stringify({masterKey})))}, { withCredentials: true });
  }
  updateCarteiraData(carteiraData: any, masterKey: string): Observable<HMACPayload<any>> {
    return this.http.put<HMACPayload<any>>(`${this.API}/carteira/update`, 
      { data: {data: carteiraData, masterKey: masterKey} , hmac: signwithHMAC(JSON.parse(JSON.stringify({data: carteiraData, masterKey}))) }, 
      { withCredentials: true }
    );
  }


  // para visualizar carteiras por username
  getUserDataByUsername(username: string): Observable<HMACPayload<UserData>> {
    return this.http.get<HMACPayload<UserData>>(`${this.API}/carteira/user/${encodeURIComponent(username)}/profile`, { withCredentials: true });
  }
  getCarteiraDataByUsername(username: string): Observable<HMACPayload<CarteiraData>> {
    return this.http.get<HMACPayload<CarteiraData>>(`${this.API}/carteira/user/${encodeURIComponent(username)}`, { withCredentials: true });
  }

  // pedir informações  ao utilizador
  requestInfo(username: string, payload: { item: any; mensagem?: string }): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.API}/carteira/user/${encodeURIComponent(username)}/request-info`,
      payload,
      { observe: 'response', withCredentials: true }
    );
  }

  // enviar certificado assinado
  sendCertificateWithSignature(username: string, certificate: any, signature: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.API}/carteira/user/${encodeURIComponent(username)}/certificates`,
      { certificate, signature },
      { observe: 'response', withCredentials: true }
    );
  }
}
