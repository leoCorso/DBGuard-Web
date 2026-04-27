import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { UserDetailDTO } from '../../../interfaces/user.dto';
import { DatePipe } from '@angular/common';
import { Button } from 'primeng/button';
import { RouterLink, RouterModule } from "@angular/router";
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-user-details-pane',
  imports: [DatePipe, Button, RouterLink, RouterModule, Tag],
  templateUrl: './user-details-pane.html',
  styleUrl: './user-details-pane.scss',
})
export class UserDetailsPane implements OnInit {
  private httpClient = inject(HttpClient);
  public userId = input.required<string>();
  public userDetails = signal<UserDetailDTO | null>(null);

  ngOnInit(): void {
    this.loadDetails();
  }
  private loadDetails(): void {
    const url = [environment.api.uri, 'User', 'GetUserDetails'].join('/');
    const params = new HttpParams().set('userId', this.userId());
    this.httpClient.get<UserDetailDTO>(url, { params }).subscribe({
      next: (userDetails: UserDetailDTO) => {
        this.userDetails.set(userDetails);
      }
    });
  }
}
