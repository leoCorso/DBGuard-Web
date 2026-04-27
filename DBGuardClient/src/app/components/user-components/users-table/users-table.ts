import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { PreviewTable } from '../../shared/preview-table/preview-table';
import { UserDTO } from '../../../interfaces/user.dto';
import { Column } from '../../../interfaces/table-items';
import { SortValue } from '../../../interfaces/sorting';
import { environment } from '../../../../environments/environment.development';
import { FilterConfig, FilterValue } from '../../../interfaces/filters';
import { TableModule } from 'primeng/table';
import { DatePipe } from '@angular/common';
import { Button } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { FilterItem } from '../../shared/filter-item/filter-item';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-users-table',
  imports: [TableModule, DatePipe, Button, RouterModule, FilterItem, Tag],
  templateUrl: './users-table.html',
  styleUrl: './users-table.scss',
})
export class UsersTable extends PreviewTable<UserDTO> implements OnInit {
  public override columns: Column[] = [
    { field: 'id', header: 'Id', sortable: true },
    {field: 'username', header: 'Username', sortable: true},
    {field: 'createdByUsername', header: 'Created by', sortable: true},
    {field: 'createDate', header: 'Created on', sortable: true},
    {field: 'lastEdited', header: 'Last edited', sortable: true}
  ];
  public override defaultSort: SortValue[] = [
    {field: 'username', order: 1}
  ];
  public override fetchUrl: string = [environment.api.uri, 'User', 'GetUsers'].join('/');
  public override filters = signal<Map<string, FilterValue> | undefined>(undefined);
  public override filtersConfig: FilterConfig[] = [];

  override ngOnInit(): void {
    super.ngOnInit();
    this.configureFilters();
  }
  protected override initFilterInputs(): void {
    
  }
  protected override configureFilters(): void {
    this.filtersConfig = [
      {field: 'id', label: 'Id', type: 'text', isTableFilter: true, placeholder: 'Filter by id'},
      {field: 'username', label: 'Username', type: 'text', isTableFilter: true, placeholder: 'Filter by username'},
      {field: 'createdByUsername', label: 'Created by', type: 'text', isTableFilter: true, placeholder: 'Filter by creator username'},
      {field: 'createDate', label: 'Created on', type: 'datetime', isTableFilter: true, placeholder: 'Filter by creation date'},
      {field: 'lastEdited', label: 'Last edited', type: 'datetime', isTableFilter: true, placeholder: 'Filter by last edit date'}
    ];
  }
}
