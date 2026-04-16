import { Component, inject, input, OnInit, signal, Signal } from '@angular/core';
import { GuardDetailDTO } from '../../../../interfaces/guard-dto';
import { PreviewTable } from '../../../shared/preview-table/preview-table';
import { GuardChangeTransactionPreviewDTO } from '../../../../interfaces/guard-change-transaction-dto';
import { environment } from '../../../../../environments/environment.development';
import { Column } from '../../../../interfaces/table-items';
import { TableModule } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { FilterValue } from '../../../../interfaces/filters';
import { SortValue } from '../../../../interfaces/sorting';
import { DatePipe } from '@angular/common';
import { Card } from 'primeng/card';
import { formatEnumKey, getEnumLabel } from '../../../../helper-functions/enum-helper';
import { GuardState } from '../../../../enums/guard-state';
import { GuardOperator } from '../../../../enums/guard-operator';
import { DatabaseEngine } from '../../../../enums/database-engines';

@Component({
  selector: 'app-guard-transaction-preview',
  imports: [TableModule, DatePipe, Card],
  templateUrl: './guard-transaction-preview.html',
  styleUrl: './guard-transaction-preview.scss',
})
export class GuardTransactionPreview extends PreviewTable<GuardChangeTransactionPreviewDTO> implements OnInit {
  public getEnumLabel = getEnumLabel;
  public formatEnumKey = formatEnumKey;
  public guardState = GuardState;
  public guardOperator = GuardOperator;
  public databaseEngine = DatabaseEngine;
  public guardDetail = input.required<GuardDetailDTO>();
  public override columns: Column[] = [
    {field: 'id', header: 'Id', sortable: true},
    {field: 'timestamp', header: 'Time stamp', sortable: true},
    {field: 'guardId', header: 'Guard id', sortable: true},
    {field: 'guardState', header: 'Guard state', sortable: true},
    {field: 'previousGuardState', header: 'Changed from', sortable: true},
    {field: 'guardQuery', header: 'Query', sortable: false},
    {field: 'guardOperator', header: 'Operator', sortable: true},
    {field: 'guardValue', header: 'Value', sortable: true},
    {field: 'databaseConnectionId', header: 'Database connection id', sortable: true},
    {field: 'databaseConnectionEndpoint', header: 'Database connection endpoint', sortable: true},
    {field: 'databaseName', header: 'Database name', sortable: true},
    {field: 'databaseConnectionEngine', header: 'Database engine', sortable: true},
    {field: 'databaseConnectionUsername', header: 'Database username', sortable: true},
    {field: 'resultValue', header: 'Result value count', sortable: true}
  ];
  public override defaultSort: SortValue[] = [
    {field: 'timestamp', order: -1}
  ];
  public override fetchUrl = [environment.api.uri, 'Guards', 'GetGuardTransactionsPreview'].join('/');
  public override filters = signal<Map<string, FilterValue> | undefined>(undefined);

  ngOnInit(): void {
    const url = [environment.api.uri, 'Guards', 'GetGuardTransactionsPreview'].join('/');
  }
  public override loadPreviewData(event: LazyLoadEvent): void {
    
  }
}
