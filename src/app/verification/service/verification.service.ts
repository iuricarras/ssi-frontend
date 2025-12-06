import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VerificationService {

  private baseUrl = 'http://localhost:5000/api/verify';

  constructor(private http: HttpClient) {}

  requestVerification(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/request-verification`, data, { withCredentials: true });
  }

  acceptVerification(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/accept-verification`, data, { withCredentials: true });
  }

  getVerification(verificationId: string, masterKey: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/get-verifications/${verificationId}`, { masterKey }, { withCredentials: true });
  }

  getPendingVerifications(): Observable<any> {
    return this.http.get(`${this.baseUrl}/get-pending`, { withCredentials: true });
  }

  getAllVerifications(): Observable<any> {
    return this.http.get(`${this.baseUrl}/get-all-verifications`, { withCredentials: true });
  }
}
