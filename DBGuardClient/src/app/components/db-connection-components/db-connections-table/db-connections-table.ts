import { Component, input, OnInit, signal, WritableSignal } from '@angular/core';
import { PreviewTable } from '../../shared/preview-table/preview-table';
import { DatabaseConnectionDTO } from '../../../interfaces/database-connection-dto';
import { Column } from '../../../interfaces/table-items';
import { SortValue } from '../../../interfaces/sorting';
import { environment } from '../../../../environments/environment.development';
import { FilterConfig, FilterValue } from '../../../interfaces/filters';
import { enumToOptions, formatEnumKey, getEnumLabel } from '../../../helper-functions/enum-helper';
import { DatabaseEngine } from '../../../enums/database-engines';
import { TableModule } from 'primeng/table';
import { FilterItem } from '../../shared/filter-item/filter-item';
import { Button } from 'primeng/button';
import { RouterLink } from "@angular/router";
import { DatePipe } from '@angular/common';
import { merge, takeUntil } from 'rxjs';

@Component({
  selector: 'app-db-connections-table',
  imports: [TableModule, Button, FilterItem, RouterLink, DatePipe],
  templateUrl: './db-connections-table.html',
  styleUrl: './db-connections-table.scss',
})
export class DbConnectionsTable extends PreviewTable<DatabaseConnectionDTO> implements OnInit {
  public createdByUserId = input<string | undefined>();

  public override columns: Column[] = [
    {field: 'id', header: 'Id', sortable: true},
    {field: 'endpoint', header: 'Endpoint', sortable: true},
    {field: 'databaseEngine', header: 'Database engine', sortable: true},
    {field: 'username', header: 'Username', sortable: true},
    {field: 'createDate', header: 'Create date', sortable: true},
    {field: 'lastEdited', header: 'Last edited', sortable: true},
    {field: 'createdByUsername', header: 'Created by', sortable: true}
  ];
  public override defaultSort: SortValue[] = [
    {field: 'createDate', order: -1}
  ];
  public override fetchUrl: string = [environment.api.uri, 'DatabaseConnection', 'GetPagedDatabaseConnections'].join('/');
  public override filters = signal<Map<string, FilterValue> | undefined>(undefined);
  public override filtersConfig: FilterConfig[] = [];
  public databaseEngines = enumToOptions(DatabaseEngine, {PostgreSQL: 'PostgreSQL', SQLite: 'SQLite', SQLServer: 'SQL Server', MySql: 'MySQL'});
  public formatEnumKey = formatEnumKey;
  public getEnumLabel = getEnumLabel;
  public databaseEngine = DatabaseEngine;

  override ngOnInit(): void {
    super.ngOnInit();
    this.listenToEntityChanges();
    this.initFilterInputs();
    this.configureFilters();
  }
  private listenToEntityChanges(): void {
    merge(this.entityChanges.dbConnectionCreated, this.entityChanges.dbConnectionCreated).pipe(takeUntil(this.destroy)).subscribe({
      next: () => {
        const event = this.viewItemsTable.createLazyLoadMetadata();
        this.loadPreviewData(event);
      }
    });
  }
  protected override initFilterInputs(): void {
    let filters: FilterValue[] = [];
    if(this.createdByUserId() !== undefined){
      const filter: FilterValue = {
        field: 'createdByUserId',
        value: this.createdByUserId(),
        operator: 'equals',
        type: 'text'
      }
      filters.push(filter);
    }
    if(filters.length > 0){
      this.filters.update(current => {
        const newFitlers = new Map(current);
        filters.map(filter => newFitlers.set(filter.field, filter));
        return newFitlers;
      });
    }
  }
  protected override configureFilters(): void {
    this.filtersConfig = [
      {field: 'id', label: 'Id', type: 'numeric', isTableFilter: true, placeholder: 'Filter by id'},
      {field: 'endpoint', label: 'Endpoint', type: 'text', isTableFilter: true, placeholder: 'Filter by endpoint'},
      {field: 'databaseEngine', label: 'Database engine', type: 'multi-select', isTableFilter: true, placeholder: 'Filter by database engine', options: this.databaseEngines},
      {field: 'username', label: 'Username', type: 'text', isTableFilter: true, placeholder: 'Filter by username'},
      {field: 'createDate', label: 'Create date', type: 'datetime', isTableFilter: true, placeholder: 'Filter by create date'},
      {field: 'lastEdited', label: 'Last edited', type: 'datetime', isTableFilter: true, placeholder: 'Filter by last edited'},
      {field: 'createdByUsername', label: 'Created by', type: this.createdByUserId() === undefined ? 'text' : 'empty', isTableFilter: true, placeholder: 'Filter by creator username'},
    ]
  }
}
