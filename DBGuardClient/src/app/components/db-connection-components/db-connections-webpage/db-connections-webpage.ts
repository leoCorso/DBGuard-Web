import { Component } from '@angular/core';
import { DbConnectionsTable } from '../db-connections-table/db-connections-table';

@Component({
  selector: 'app-db-connections-webpage',
  imports: [DbConnectionsTable],
  templateUrl: './db-connections-webpage.html',
  styleUrl: './db-connections-webpage.scss',
})
export class DbConnectionsWebpage {}
