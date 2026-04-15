import { Component, output } from '@angular/core';
import { FilterConfig, SelectOption } from '../../../interfaces/filters';
import { FilterItem } from '../../shared/filter-item/filter-item';
import { enumToOptions } from '../../../helper-functions/enum-helper';
import { GuardOperator } from '../../../enums/guard-operator';
import { DatabaseEngine } from '../../../enums/database-engines';
import { GuardState } from '../../../enums/guard-state';
import { FilterPane } from '../../shared/filter-pane/filter-pane';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-guard-filters',
  imports: [FilterItem, Button],
  templateUrl: './guard-filters.html',
  styleUrl: './guard-filters.scss',
})
export class GuardFilters extends FilterPane {

  public guardOperators = enumToOptions(GuardOperator);
  public databaseEngines = enumToOptions(DatabaseEngine);
  public guardStates = enumToOptions(GuardState);
  public isActiveOptions = [{label: 'Active', value: true}, {label: 'In-active', value: false}];
  
  public override filtersConfig: FilterConfig[] = [
    { field:'id', label: 'Id', type: 'text', isTableFilter: false, placeholder: 'Filter by id' },
    { field: 'guardName', label: 'Guard name', type: 'text', isTableFilter: false, placeholder: 'Filter by guard name'},
    { field: 'createDate', label: 'Create date', type: 'datetime', isTableFilter: false, placeholder: 'Filter by creation' },
    { field: 'lastRun', label: 'Last run', type: 'datetime', isTableFilter: false, placeholder: 'Filter by last run' },
    { field: 'userName', label: 'User', type: 'text', isTableFilter: false, placeholder: 'Filter by user' },
    { field: 'countColumn', label: 'Count column', type: 'text', isTableFilter: false, placeholder: 'Filter by count column' },
    { field: 'triggerOperator', label: 'Trigger operator', type: 'multi-select', isTableFilter: false, placeholder: 'Filter by operator', options:  this.guardOperators},
    { field: 'triggerValue', label: 'Trigger value', type: 'text', isTableFilter: false, placeholder: 'Filter by trigger value' },
    { field: 'endPoint', label: 'Endpoint', type: 'text', isTableFilter: false, placeholder: 'Filter by database endpoint' },
    { field: 'databaseEngine', label: 'Database engine', type: 'multi-select', isTableFilter: false, placeholder: 'Filter by database type', options: this.databaseEngines},
    { field: 'databaseName', label: 'Database name', type: 'text', isTableFilter: false, placeholder: 'Filter by database name'},
    { field: 'guardState', label: 'Guard state', type: 'multi-select', customOperator: 'HasGuardState', isTableFilter: false, placeholder: 'Guard state', options: this.guardStates },
    { field: 'isActive', label: 'Is active', type: 'trivalue', isTableFilter: false, placeholder: 'Filter by status', options: this.isActiveOptions },
    { field: 'totalErrors', label: 'Total errors', type: 'text', isTableFilter: false, placeholder: 'Filter by error count' },
    { field: 'totalTriggers', label: 'Total triggers', type: 'text', isTableFilter: false, placeholder: 'Filter by trigger count' },
    { field: 'runPeriodInMinutes', label: 'Run period (minutes)', isTableFilter: false, placeholder: 'Filter by run period', type: 'numeric'}
  ];
}
