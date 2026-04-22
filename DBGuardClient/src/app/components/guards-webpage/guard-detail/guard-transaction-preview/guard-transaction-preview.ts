import { Component, inject, input, OnInit, signal, Signal } from '@angular/core';
import { GuardDetailDTO } from '../../../../interfaces/guard-dto';
import { PreviewTable } from '../../../shared/preview-table/preview-table';
import { GuardChangeTransactionPreviewDTO } from '../../../../interfaces/guard-change-transaction-dto';
import { environment } from '../../../../../environments/environment.development';
import { Column } from '../../../../interfaces/table-items';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { FilterConfig, FilterValue } from '../../../../interfaces/filters';
import { SortValue } from '../../../../interfaces/sorting';
import { DatePipe } from '@angular/common';
import { Card } from 'primeng/card';
import { enumToOptions, formatEnumKey, getEnumLabel } from '../../../../helper-functions/enum-helper';
import { GuardState } from '../../../../enums/guard-state';
import { GuardOperator } from '../../../../enums/guard-operator';
import { DatabaseEngine } from '../../../../enums/database-engines';
import { FilterItem } from '../../../shared/filter-item/filter-item';
import { getGuardStateSeverity } from '../../../../helper-functions/guard-state-helper';
import { Tag } from 'primeng/tag';
import { GuardService } from '../../../../services/guard-service';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-guard-transaction-preview',
  imports: [TableModule, DatePipe, Card, Tag, FilterItem],
  templateUrl: './guard-transaction-preview.html',
  styleUrl: './guard-transaction-preview.scss',
})
export class GuardTransactionPreview extends PreviewTable<GuardChangeTransactionPreviewDTO> implements OnInit {
  public getEnumLabel = getEnumLabel;
  public formatEnumKey = formatEnumKey;
  public getGuardStateSeverity = getGuardStateSeverity;
  public guardStates = enumToOptions(GuardState);
  public guardOperators = enumToOptions(GuardOperator);
  public databaseEngines = enumToOptions(DatabaseEngine);
  private guardService = inject(GuardService);
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
  public override filtersConfig: FilterConfig[] = [
    {field: 'id', label: 'Id', isTableFilter: true, type: 'numeric', placeholder: 'Filter by id'},
    {field: 'timestamp', label: 'Timestamp', isTableFilter: true, type: 'datetime', placeholder: 'Filter by timestamp'},
    {field: 'guardId', label: '', isTableFilter: true, type: 'empty'},
    {field: 'guardState', label: 'Guard state', isTableFilter: true, type: 'multi-select', options: this.guardStates, placeholder: 'Filter by guard state'},
    {field: 'previousGuardState', label: 'Previous guard state', isTableFilter: true, type: 'multi-select', options: this.guardStates, placeholder: 'Filter by previous state'},
    {field: 'guardQuery', label: 'Guard query', isTableFilter: true, type: 'text', placeholder: 'Filter by query'},
    {field: 'guardOperator', label: 'Guard operator', isTableFilter: true, type: 'multi-select', options: this.guardOperators, placeholder: 'Guard operators'},
    {field: 'guardValue', label: 'Guard value', isTableFilter: true, type: 'numeric', placeholder: 'Filter by guard value'},
    {field: 'databaseConnectionId', label: 'Database connection id', isTableFilter: true, type: 'numeric', placeholder: 'Filter by database connection id'},
    {field: 'databaseConnectionEndpoint', label: 'Database endpoint', isTableFilter: true, type: 'text', placeholder: 'Filter by database endpoint'},
    {field: 'databaseName', label: 'Database name', isTableFilter: true, type: 'text', placeholder: 'Filter by database name'},
    {field: 'databaseConnectionEngine', label: 'Database engine', isTableFilter: true, type: 'multi-select', placeholder: 'Filter by database engine', options: this.databaseEngines},
    {field: 'databaseConnectionUsername', label: 'Database username', isTableFilter: true, type: 'text', placeholder: 'Filter by database username'},
    {field: 'resultValue', label: 'Result value', isTableFilter: true, type: 'numeric', placeholder: 'Filter by results value'}
  ];
  public override defaultSort: SortValue[] = [
    {field: 'timestamp', order: -1}
  ];
  public override fetchUrl = [environment.api.uri, 'Guards', 'GetGuardTransactionsPreview'].join('/');
  public override filters = signal<Map<string, FilterValue> | undefined>(undefined);
  public guardFilter!: FilterValue;

  override ngOnInit(): void {
    super.ngOnInit();
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
    this.guardService.guardEdited.pipe(takeUntil(this.destroy)).subscribe({
      next: (guardId: number) => {
        if(guardId === this.guardId()){
          const event = this.viewItemsTable.createLazyLoadMetadata();
          this.loadPreviewData(event);
        }
      }
    })
  }
}
