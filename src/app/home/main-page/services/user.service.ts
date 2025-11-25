import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { delay } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class UserService {

  // substituir quando o backend estiver pronto
  private mockUsers = [
    { username: "joao", email: "joao@gmail.com" },
    { username: "maria", email: "maria@gmail.com" },
    { username: "carlos", email: "carlos@hotmail.com" },
    { username: "ana", email: "ana@hotmail.com" },
  ];

  // quando o backend estiver pronto
  // private apiUrl = "http://localhost:3000/api/users";

  constructor(private http: HttpClient) {}

  searchMock(query: string): Observable<any[]> {
    if (!query.trim()) return of([]);

    const results = this.mockUsers.filter(u =>
      u.username.toLowerCase().includes(query.toLowerCase())
    );

    return of(results)
  }

  /* searchUsers(query: string): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/api/users?search=${query}`);
  } */
}
