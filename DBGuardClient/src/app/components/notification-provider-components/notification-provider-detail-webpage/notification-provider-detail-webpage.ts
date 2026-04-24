import { Component, inject, OnInit, signal } from '@angular/core';
import { NotificationProviderDetailPane } from '../notification-provider-detail-pane/notification-provider-detail-pane';
import { ActivatedRoute, Router } from '@angular/router';
import { Card } from 'primeng/card';
import { GuardNotificationsTable } from '../../guard-components/guard-notification-components/guard-notifications-table/guard-notifications-table';

@Component({
  selector: 'app-notification-provider-detail-webpage',
  imports: [NotificationProviderDetailPane, Card, GuardNotificationsTable],
  templateUrl: './notification-provider-detail-webpage.html',
  styleUrl: './notification-provider-detail-webpage.scss',
})
export class NotificationProviderDetailWebpage implements OnInit {
  public providerId = signal<number | null>(null);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if(id === null){
      this.router.navigate(['/providers/view-all']);
    }
    this.providerId.set(parseInt(id!));
  }
}
