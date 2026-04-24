import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseConnectionDTO } from '../../../interfaces/database-connection-dto';
import { environment } from '../../../../environments/environment.development';
import { DbConnectionDetailPane } from '../db-connection-detail-pane/db-connection-detail-pane';
import { DbConnectionsTable } from '../db-connections-table/db-connections-table';
import { Card } from 'primeng/card';
import { GuardsDetailTable } from '../../guard-components/guards-detail-table/guards-detail-table';

@Component({
  selector: 'app-db-connections-detail-webpage',
  imports: [DbConnectionDetailPane, GuardsDetailTable, Card],
  templateUrl: './db-connections-detail-webpage.html',
  styleUrl: './db-connections-detail-webpage.scss',
})
export class DbConnectionsDetailWebpage implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  public dbConnectionId = signal<number | null>(null);

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['db-connections/view-all']);

    }
    this.dbConnectionId.set(parseInt(id!));
  }
}
