import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from "@angular/common/http";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API: string = 'http://localhost:5000/api/auth';

  public constructor(private readonly http: HttpClient) {}

  public requestLoginCode(email: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.API}/start`, { email }, { observe: "response", withCredentials: true });
  }

  public verifyLoginCode(email: string, challenge_id: string, code: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.API}/verify`, { email, challenge_id, code }, { observe: "response", withCredentials: true });
  }

  public me(): Observable<any> {
    return this.http.get<any>(`${this.API}/me`, { withCredentials: true });
  }

  public refresh(): Observable<any> {
    return this.http.post<any>(`${this.API}/refresh`, {}, { withCredentials: true });
  }

  public startSignature(email: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.API}/signature/start`,{ email },{ observe: "response", withCredentials: true });
  }

  public verifySignature(email: string, challenge_id: string, signature: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.API}/signature/verify`,
      { email, challenge_id, signature },{ observe: "response", withCredentials: true }
    );
  }
}
