import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from "@angular/common/http";
import { Observable } from 'rxjs';
import { ECRegistrationData } from '../components/ec-register/ec-register';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API = '/api/register';

  constructor(private http: HttpClient) {}

registerEC(data: ECRegistrationData): Observable<HttpResponse<void>> {
    return this.http.post<void>(`${this.API}/ec-register`,{data},{observe: "response"});
  }
}
