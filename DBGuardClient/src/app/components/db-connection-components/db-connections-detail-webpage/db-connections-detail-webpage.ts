import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseConnectionDTO } from '../../../interfaces/database-connection-dto';
import { environment } from '../../../../environments/environment.development';
import { DbConnectionDetailPane } from '../db-connection-detail-pane/db-connection-detail-pane';
import { DbConnectionsTable } from '../db-connections-table/db-connections-table';
import { Card } from 'primeng/card';
import { GuardsDetailTable } from '../../guard-components/guards-detail-table/guards-detail-table';
import { ButtonGroup } from 'primeng/buttongroup';
import { Button } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateDbConnection } from '../create-db-connection/create-db-connection';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { AuthService } from '../../../services/auth-service';
import { TooltipModule } from 'primeng/tooltip';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-db-connections-detail-webpage',
  imports: [DbConnectionDetailPane, GuardsDetailTable, Card, ButtonGroup, Button, ConfirmPopup, TooltipModule, Toast],
  templateUrl: './db-connections-detail-webpage.html',
  styleUrl: './db-connections-detail-webpage.scss',
})
export class DbConnectionsDetailWebpage implements OnInit, OnDestroy {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private dialogService = inject(DialogService);
  public authService = inject(AuthService);
  private confirmService = inject(ConfirmationService);
  private httpClient = inject(HttpClient);
  private messageService = inject(MessageService);
  public dbConnectionId = signal<number | null>(null);
  private editDbConnectionDialog?: DynamicDialogRef<CreateDbConnection> | null;

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['db-connections/view-all']);

    }
    this.dbConnectionId.set(parseInt(id!));
  }
  ngOnDestroy(): void {
    this.editDbConnectionDialog?.close();
  }
  public editDbConnection(): void {
    this.editDbConnectionDialog = this.dialogService.open(CreateDbConnection, {
      header: 'Edit Database Connection',
      maximizable: true,
      resizable: true,
      draggable: true,
      closable: true,
      inputValues: {
        dbConnectionToEditId: this.dbConnectionId()!
      }
    })
  }
  public onDeleteConnection(event: Event): void {
    this.confirmService.confirm({
      target: event.currentTarget as EventTarget,
      message: 'Are you sure you want to delete the database connection?',
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger'
      },
      accept: () => this.deleteConnection(),
      reject: () => {return}
    });
  }
  private deleteConnection(): void {
    const url = [environment.api.uri, 'DatabaseConnection', 'DeleteDatabaseConnection'].join('/');
    const params = new HttpParams().set('connectionId', this.dbConnectionId()!);
    this.httpClient.delete(url, { params: params }).subscribe({
      next: () => {
        this.router.navigate(['/db-connections/view-all']);
      }
    });
  }
  public testDatabaseConnection(): void {
    const url = [environment.api.uri, 'DatabaseConnection', 'TestDatabaseConnection'].join('/');
    const params = new HttpParams().set('connectionId', this.dbConnectionId()!);
    this.httpClient.post(url, {}, {params: params}).subscribe({
      next: () => {
        this.messageService.add({summary: 'Healthy', detail: 'Database connection is healthy', severity: 'success', key: 'test-db-toast'});
      }
    })
  }
}
