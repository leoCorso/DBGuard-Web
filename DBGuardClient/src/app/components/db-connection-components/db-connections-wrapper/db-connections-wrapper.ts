import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DbConnectionToolbar } from '../db-connection-toolbar/db-connection-toolbar';
import { DialogService } from 'primeng/dynamicdialog';
import { CreateDbConnection } from '../create-db-connection/create-db-connection';

@Component({
  selector: 'app-db-connections-wrapper',
  imports: [RouterOutlet,DbConnectionToolbar],
  templateUrl: './db-connections-wrapper.html',
  styleUrl: './db-connections-wrapper.scss',
})
export class DbConnectionsWrapper {
  private dialogService = inject(DialogService);
  public createDBConnection(): void {
    this.dialogService.open(CreateDbConnection, {
      header: 'Create Database Connection',
      draggable: true,
      closable: true,
      resizable: true,
      maximizable: true
    });
  }
}
