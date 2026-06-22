import { DatePipe } from '@angular/common';
import { Component, input, OnInit, signal } from '@angular/core';
import { RouterLink, RouterModule } from "@angular/router";
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { environment } from '../../../../environments/environment';
import { GuardOperator } from '../../../enums/guard-operator';
import { GuardState } from '../../../enums/guard-state';
import { enumToOptions, formatEnumKey, getEnumLabel } from '../../../helpers/enum-helper';
import { getGuardStateSeverity } from '../../../helpers/guard-state-helper';
import { FilterConfig, FilterValue } from '../../../interfaces/filters';
import { GuardDTO } from '../../../interfaces/guard-dto';
import { SortValue } from '../../../interfaces/sorting';
import { Column } from '../../../interfaces/table-items';
import { FilterItem } from '../../shared/filter-item/filter-item';
import { PreviewTable } from '../../shared/preview-table/preview-table';
import { TrackClick } from '../../../directives/track-click';

@Component({
  selector: 'app-guards-detail-table',
  imports: [TableModule, Button, FilterItem, DatePipe, RouterLink, RouterModule, Tag, TrackClick],
  templateUrl: './guards-detail-table.html',
  styleUrl: './guards-detail-table.scss',
})
export class GuardsDetailTable extends PreviewTable<GuardDTO> implements OnInit{
  public guardId = input<number | undefined>();
  public userId = input<string | undefined>();
  public dbConnectionId = input<number | undefined>();

  public override columns: Column[] = [
    { field: 'id', header: 'Id', sortable: true},
    {field: 'guardName', header: 'Guard Name', sortable: true},
    {field :'createDate', header: 'Created Date', sortable: true},
    {field :'lastEditedDate', header: 'Last edited', sortable: true},
    {field: 'lastRun', header: 'Last Run', sortable: true},
    {field: 'userName', header: 'Created By', sortable: true},
    {field: 'triggerColumn', header: 'Trigger Column', sortable: true},
    {field: 'triggerOperator', header: 'Trigger Operator', sortable: true},
    {field: 'triggerValue', header: 'Trigger Value', sortable: true},
    {field: 'guardState', header: 'Guard State', sortable: true},
    {field: 'isActive', header: 'Status', sortable: true},
    {field: 'notifyOnClear', header: 'Notify on Clear', sortable: true},
    {field: 'notifyOnError', header: 'Notify on Error', sortable: true},
    {field: 'notifyOnTrigger', header: 'Notify on Trigger', sortable: true},
    {field: 'totalErrors', header: 'Total Errors', sortable: true},
    {field: 'totalTriggers', header: 'Total Triggers', sortable: true},
    {field: 'runPeriodInMinutes', header: 'Run Period in Minutes', sortable: true},
    {field: 'databaseConnectionId', header: 'Database Connection Id', sortable: true},
  ];
  public override defaultSort: SortValue[] = [
    {field: 'lastRun', order: -1}
  ];
  public override fetchUrl: string = [environment.api.uri, 'Guards', 'GetGuardsDTO'].join('/');
  public override filters = signal<Map<string, FilterValue> | undefined>(undefined);
  public override filtersConfig: FilterConfig[] = [];
  private guardOperators = enumToOptions(GuardOperator);
  private guardStates = enumToOptions(GuardState);
  public guardOperator = GuardOperator;
  public guardState = GuardState;
  public getEnumLabel = getEnumLabel;
  public formatEnumKey = formatEnumKey;
  public getGuardStateSeverity = getGuardStateSeverity;

  ngOnInit(): void {
    this.initFilterInputs();
    this.configureFilters();
  }
  protected override initFilterInputs(): void {
    let filters: FilterValue[] = [];
    if(this.guardId() !== undefined){
      const filter: FilterValue = {
        field: 'id',
        value: this.guardId(),
        operator: '==',
        type: 'numeric'
      };
      filters.push(filter);
    }
    if(this.dbConnectionId() !== undefined){
      const filter: FilterValue = {
        field: 'databaseConnectionId',
        value: this.dbConnectionId(),
        operator: '==',
        type: 'numeric'
      };
      filters.push(filter);
    }
    if (this.userId() !== undefined){
      const filter: FilterValue = {
        field: 'createdByUserId',
        value: this.userId(),
        operator: '==',
        type: 'text'
      }
      filters.push(filter); 
    }
  
    if(filters.length > 0){
      this.filters.update(currentFilters => {
        const newFilters = new Map(currentFilters);
        filters.forEach(filter => newFilters.set(filter.field, filter));
        return newFilters;
      });
    }
    
  }
  protected override configureFilters(): void {
    this.filtersConfig = [
      {field: 'id', label: 'Id', type: this.guardId() === undefined ? 'numeric' : 'empty', placeholder: 'Filter by Id', isTableFilter: true},
      {field: 'guardName', label: 'Guard Name', type: 'text', placeholder: 'Filter by Guard Name', isTableFilter: true},
      {field: 'createDate', label: 'Created Date', type: 'datetime', placeholder: 'Filter by Created Date', isTableFilter: true},
      {field: 'lastEditedDate', label: 'Last Edited Date', type: 'datetime', placeholder: 'Filter by Last Edited Date', isTableFilter: true},
      {field: 'lastRun', label: 'Last Run', type: 'datetime', placeholder: 'Filter by Last Run', isTableFilter: true},
      {field: 'userName', label: 'Created By', type: this.userId() === undefined ? 'text': 'empty', placeholder: 'Filter by Created By', isTableFilter: true},
      {field: 'triggerColumn', label: 'Trigger Column', type: 'text', placeholder: 'Filter by trigger column', isTableFilter: true},
      {field: 'triggerOperator', label: 'Trigger Operator', type: 'multi-select', options: this.guardOperators, placeholder: 'Filter by Trigger Operator', isTableFilter: true},
      {field: 'triggerValue', label: 'Trigger Value', type: 'numeric', placeholder: 'Filter by Trigger Value', isTableFilter: true},
      {field: 'guardState', label: 'Guard State', type: 'multi-select', options: this.guardStates, placeholder: 'Filter by Guard State', isTableFilter: true},
      {field: 'isActive', label: 'Is Active', type: 'trivalue', isTableFilter: true , placeholder: 'Filter by Is Active',  options: [{label: 'Active', value: true}, {label: 'Inactive', value: false}]},
      {field: 'notifyOnClear', type: 'trivalue', isTableFilter: true, placeholder: 'Filter by guards that notify on clear',  options: [{label: 'Notify on clear', value: true}, {label: 'Dont notify', value: false}]},
      {field: 'notifyOnError', type: 'trivalue', isTableFilter: true, placeholder: 'Filter by guards that notify on errors',  options: [{label: 'Notify on error', value: true}, {label: 'Dont notify', value: false}]},
      {field: 'totalTriggers', label: 'Total Triggers', type: 'numeric', placeholder: 'Filter by Total Triggers', isTableFilter: true},
      {field: 'totalErrors', label: 'Total Errors', type: 'numeric', placeholder: 'Filter by Total Errors', isTableFilter: true},
      {field: 'runPeriodInMinutes', label: 'Run Period in Minutes', type: 'numeric', placeholder: 'Filter by Run Period in Minutes', isTableFilter: true},
      {field: 'databaseConnectionId', label: 'Database Connection Id', type: 'numeric', placeholder: 'Filter by Database Connection Id', isTableFilter: true},
    ]
  }
}
