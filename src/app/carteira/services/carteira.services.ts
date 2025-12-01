import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from "@angular/common/http";
import { Observable } from 'rxjs';

export interface UserData {
  id: string;
  name: string;
  email: string;
}

export interface CarteiraData {
  user: UserData;
  certificates: any[];
  personalData: any;
}

@Injectable({
  providedIn: 'root'
})
export class CarteiraService {
  private readonly API = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getUserData(): Observable<UserData> {
    return this.http.get<UserData>(`${this.API}/user/profile`, { withCredentials: true });
  }

  getCarteiraData(): Observable<CarteiraData> {
    return this.http.get<CarteiraData>(`${this.API}/carteira`, { withCredentials: true });
  }

  verifyMasterKey(masterKey: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.API}/carteira/verify-key`, 
      { masterKey }, 
      { observe: "response", withCredentials: true }
    );
  }

  updateCarteiraData(carteiraData: any): Observable<HttpResponse<any>> {
    return this.http.put<any>(`${this.API}/carteira/update`, 
      carteiraData, 
      { observe: "response", withCredentials: true }
    );
  }
<<<<<<< Updated upstream
}
=======


  // para visualizar carteiras por username
  getUserDataByUsername(username: string): Observable<UserData> {
    return this.http.get<UserData>(`${this.API}/carteira/user/${encodeURIComponent(username)}/profile`, { withCredentials: true });
  }
  getCarteiraDataByUsername(username: string): Observable<CarteiraData> {
    return this.http.get<CarteiraData>(`${this.API}/carteira/user/${encodeURIComponent(username)}`, { withCredentials: true });
  }

  // enviar pedidos e certificados
  sendCertificate(username: string, certificate: any): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.API}/carteira/user/${encodeURIComponent(username)}/certificates`,
      certificate,
      { observe: 'response', withCredentials: true }
    );
  }
  requestInfo(username: string, payload: { item: any; mensagem?: string }): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.API}/carteira/user/${encodeURIComponent(username)}/request-info`,
      payload,
      { observe: 'response', withCredentials: true }
    );
  }





}
>>>>>>> Stashed changes
