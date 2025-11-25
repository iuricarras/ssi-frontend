import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from "@angular/common/http";
import { from, Observable, switchMap } from 'rxjs';

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

  public verifySignature(email: string, challenge_id: string, file: File): Observable<HttpResponse<any>> {
    return from(this.fileToBase64(file)).pipe(
      switchMap(signature => {
        return this.http.post<any>(
          `${this.API}/signature/verify`,
          { email, challenge_id, signature },
          { observe: "response", withCredentials: true }
        );
      })
    );
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        resolve(base64);
      };
      reader.onerror = () => reject("Erro ao ler arquivo");
      reader.readAsDataURL(file);
    });
  }
}
