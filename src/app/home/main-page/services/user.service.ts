import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { delay } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class UserService {

  private apiUrl = "http://localhost:3000/user";

  constructor(private http: HttpClient) {}

  searchUsers(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search?query=${query}`);
  }
}

