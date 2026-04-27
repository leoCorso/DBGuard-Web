import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDetailsPane } from '../user-details-pane/user-details-pane';
import { Card } from 'primeng/card';
import { GuardsDetailTable } from '../../guard-components/guards-detail-table/guards-detail-table';
import { DbConnectionsTable } from '../../db-connection-components/db-connections-table/db-connections-table';
import { NotificationProvidersTable } from '../../notification-provider-components/notification-providers-table/notification-providers-table';

@Component({
  selector: 'app-user-details-webpage',
  imports: [UserDetailsPane, Card, GuardsDetailTable, DbConnectionsTable, NotificationProvidersTable],
  templateUrl: './user-details-webpage.html',
  styleUrl: './user-details-webpage.scss',
})
export class UserDetailsWebpage implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  public userId = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if(id === null){
      this.router.navigate(['/users/view-all']);
    }
    this.userId.set(id!);
    console.log(`UserId: ${this.userId()}`)
  }
}
