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

registerEC(data: ECRegistrationData): Observable<HttpResponse<void>> {
    return this.http.post<void>(`${this.API}/register/ec-register`, data, {observe: "response"});
  }

registerUser(data: UserRegistrationData): Observable<HttpResponse<void>> {
    return this.http.post<void>(`${this.API}/register/user-register`, data, { observe: "response" });
  }

}
