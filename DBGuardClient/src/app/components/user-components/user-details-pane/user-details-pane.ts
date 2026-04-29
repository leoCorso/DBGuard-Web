import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { UserDetailDTO } from '../../../interfaces/user.dto';
import { DatePipe } from '@angular/common';
import { Button } from 'primeng/button';
import { RouterLink, RouterModule } from "@angular/router";
import { Tag } from 'primeng/tag';
import { EntityChangeService } from '../../../services/entity-change-service';
import { Subject, takeUntil } from 'rxjs';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-user-details-pane',
  imports: [DatePipe, Button, RouterLink, RouterModule, Tag, ProgressSpinner],
  templateUrl: './user-details-pane.html',
  styleUrl: './user-details-pane.scss',
})
export class UserDetailsPane implements OnInit, OnDestroy {
  private httpClient = inject(HttpClient);
  private entityChangeService = inject(EntityChangeService);
  private destroy = new Subject<void>();
  public userId = input.required<string>();
  public userDetails = signal<UserDetailDTO | null>(null);
  public loadingUser = signal<boolean>(true);

  ngOnInit(): void {
    this.entityChangeService.userEdited.pipe(takeUntil(this.destroy)).subscribe({
      next: (id: string) => {
        if(this.userId() === id){
          this.loadDetails();
        }
      }
    })
    this.loadDetails();
  }
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
  private loadDetails(): void {
    this.loadingUser.set(true);
    const url = [environment.api.uri, 'User', 'GetUserDetails'].join('/');
    const params = new HttpParams().set('userId', this.userId());
    this.httpClient.get<UserDetailDTO>(url, { params }).subscribe({
      next: (userDetails: UserDetailDTO) => {
        this.userDetails.set(userDetails);
        this.loadingUser.set(false);
      }
    });
  }
}
