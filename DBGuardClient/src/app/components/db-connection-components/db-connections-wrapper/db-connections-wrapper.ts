import { Component, inject, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DbConnectionToolbar } from '../db-connection-toolbar/db-connection-toolbar';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateDbConnection } from '../create-db-connection/create-db-connection';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-db-connections-wrapper',
  imports: [RouterOutlet,DbConnectionToolbar],
  templateUrl: './db-connections-wrapper.html',
  styleUrl: './db-connections-wrapper.scss',
})
export class DbConnectionsWrapper implements OnDestroy {
  private dialogService = inject(DialogService);
  public authService = inject(AuthService);
  private createConnectionDialog?: DynamicDialogRef<CreateDbConnection> | null;
ngOnDestroy(): void {
  this.createConnectionDialog?.close();
}
  public createDBConnection(): void {
  this.createConnectionDialog = this.dialogService.open(CreateDbConnection, {
      header: 'Create Database Connection',
      draggable: true,
      closable: true,
      resizable: true,
      maximizable: true
    });
  }
}
