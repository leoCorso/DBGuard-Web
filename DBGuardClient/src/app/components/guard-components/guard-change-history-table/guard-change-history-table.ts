import { DatePipe } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { RouterModule } from "@angular/router";
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DatabaseEngine } from '../../../enums/database-engines';
import { GuardOperator } from '../../../enums/guard-operator';
import { GuardState } from '../../../enums/guard-state';
import { enumToOptions, formatEnumKey, getEnumLabel } from '../../../helpers/enum-helper';
import { getGuardStateSeverity } from '../../../helpers/guard-state-helper';
import { FilterConfig, FilterValue } from '../../../interfaces/filters';
import { GuardChangeTransactionDTO } from '../../../interfaces/guard-change-transaction-dto';
import { SortValue } from '../../../interfaces/sorting';
import { Column } from '../../../interfaces/table-items';
import { EntityChangeService } from '../../../services/entity-change-service';
import { FilterItem } from '../../shared/filter-item/filter-item';
import { PreviewTable } from '../../shared/preview-table/preview-table';

@Component({
  selector: 'app-guard-change-history-table',
  imports: [TableModule, DatePipe, Tag, FilterItem, RouterModule, Button],
  templateUrl: './guard-change-history-table.html',
  styleUrl: './guard-change-history-table.scss',
})
export class GuardChangeHistoryTable extends PreviewTable<GuardChangeTransactionDTO> implements OnInit {
  public getEnumLabel = getEnumLabel;
  public formatEnumKey = formatEnumKey;
  public getGuardStateSeverity = getGuardStateSeverity;
  public guardStates = enumToOptions(GuardState);
  public guardOperators = enumToOptions(GuardOperator);
  public databaseEngines = enumToOptions(DatabaseEngine);
  private guardService = inject(EntityChangeService);
  public guardState = GuardState;
  public guardOperator = GuardOperator;
  public databaseEngine = DatabaseEngine;
  public guardId = input<number>();
  public override columns: Column[] = [
    {field: 'id', header: 'Id', sortable: true},
    {field: 'timestamp', header: 'Time stamp', sortable: true},
    {field: 'guardId', header: 'Guard id', sortable: true},
    {field: 'guardState', header: 'Guard state', sortable: true},
    {field: 'previousGuardState', header: 'Changed from', sortable: true},
    {field: 'triggerQuery', header: 'Trigger query', sortable: false},
    {field: 'triggerOperator', header: 'Trigger operator', sortable: true},
    {field: 'triggerValue', header: 'Trigger value', sortable: true},
    {field: 'triggeredValue', header: 'Triggered value', sortable: true},
    {field: 'databaseConnectionId', header: 'Database connection id', sortable: true},
    {field: 'databaseConnectionEndpoint', header: 'Database connection endpoint', sortable: true},
    {field: 'databaseName', header: 'Database name', sortable: true},
    {field: 'databaseConnectionEngine', header: 'Database engine', sortable: true},
    {field: 'databaseConnectionUsername', header: 'Database username', sortable: true},
    {field: 'message', header: 'Message', sortable: true}
  ];
  public override filtersConfig: FilterConfig[] = [];
  public override defaultSort: SortValue[] = [
    {field: 'timestamp', order: -1}
  ];
  public override fetchUrl = [environment.api.uri, 'Guards', 'GetGuardChangeTransactions'].join('/');
  public override filters = signal<Map<string, FilterValue> | undefined>(undefined);
  public guardFilter!: FilterValue;

  ngOnInit(): void {
    this.initFilterInputs();
    this.configureFilters();
    this.guardService.guardEdited.pipe(takeUntil(this.destroy)).subscribe({
      next: (guardId: number) => {
        if(guardId === this.guardId()){
          const event = this.viewItemsTable.createLazyLoadMetadata();
          this.loadPreviewData(event);
        }
      }
    });
  }
  protected override initFilterInputs(): void {
    if(this.guardId()){
      this.guardFilter = {
        field: 'guardId',
        value: this.guardId(),
        operator: '==',
        type: 'numeric'
      };
      this.filters.update(filters => {  
        const filter = new Map(filters);
        filter.set('guardId', this.guardFilter);
        return filter;
      });
    }
  }
  protected override configureFilters(): void {
    this.filtersConfig = [
      {field: 'id', label: 'Id', isTableFilter: true, type: 'numeric', placeholder: 'Filter by id'},
      {field: 'timestamp', label: 'Timestamp', isTableFilter: true, type: 'datetime', placeholder: 'Filter by timestamp'},
      {field: 'guardId', label: '', isTableFilter: true, type: this.guardId() ? 'empty': 'numeric', placeholder: 'Filter by guard id'},
      {field: 'guardState', label: 'Guard state', isTableFilter: true, type: 'multi-select', options: this.guardStates, placeholder: 'Filter by guard state'},
      {field: 'previousGuardState', label: 'Previous guard state', isTableFilter: true, type: 'multi-select', options: this.guardStates, placeholder: 'Filter by previous state'},
      {field: 'triggerQuery', label: 'Trigger query', isTableFilter: true, type: 'text', placeholder: 'Filter by trigger query'},
      {field: 'triggerOperator', label: 'Trigger operator', isTableFilter: true, type: 'multi-select', options: this.guardOperators, placeholder: 'Filter by trigger operators'},
      {field: 'triggerValue', label: 'Trigger value', isTableFilter: true, type: 'numeric', placeholder: 'Filter by trigger value'},
      {field: 'triggeredValue', label: 'Triggered value', isTableFilter: true, type: 'numeric', placeholder: 'Filter by value that triggered guard'},
      {field: 'databaseConnectionId', label: 'Database connection id', isTableFilter: true, type: 'numeric', placeholder: 'Filter by database connection id'},
      {field: 'databaseConnectionEndpoint', label: 'Database endpoint', isTableFilter: true, type: 'text', placeholder: 'Filter by database endpoint'},
      {field: 'databaseName', label: 'Database name', isTableFilter: true, type: 'text', placeholder: 'Filter by database name'},
      {field: 'databaseConnectionEngine', label: 'Database engine', isTableFilter: true, type: 'multi-select', placeholder: 'Filter by database engine', options: this.databaseEngines},
      {field: 'databaseConnectionUsername', label: 'Database username', isTableFilter: true, type: 'text', placeholder: 'Filter by database username'},
      {field: 'message', label: 'Message', isTableFilter: true, type: 'text', placeholder: 'Filter by message'}
    ];
  }
}
