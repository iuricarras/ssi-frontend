import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from "@angular/common/http";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API = '/api/auth';

  constructor(private http: HttpClient) {}

requestLoginCode(email: string): Observable<HttpResponse<void>> {
    return this.http.post<void>(`${this.API}/request-code`,{email},{observe: "response"});
  }

verifyLoginCode(code: string): Observable<HttpResponse<void>> {
    return this.http.post<void>(`${this.API}/verify-code`,{code},{observe: "response"});
  }
}
