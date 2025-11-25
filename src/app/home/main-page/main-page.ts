import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from './services/user.service';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './main-page.html',
  styleUrls: ['./main-page.css']
})
export class MainPage {

  searchControl = new FormControl('');
  searchResults: any[] = [];

  constructor(private userService: UserService) {
    // Atualiza resultados ao digitar
    this.searchControl.valueChanges.subscribe(value => {
      this.onSearch(value || '');
    });
  }

  logout() {
    console.log("Log out clicked");
  }

  onSearch(query: string) {
  if (!query.trim()) {
    this.searchResults = [];
    return;
  }

  this.userService.searchUsers(query).subscribe(res => {
    this.searchResults = res;
  });
}

  selectUser(username: string) {
    this.searchControl.setValue(username);
  }
}
