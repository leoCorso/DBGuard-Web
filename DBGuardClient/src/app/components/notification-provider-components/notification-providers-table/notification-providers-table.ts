import { Component, inject, input, OnInit, signal, WritableSignal } from '@angular/core';
import { PreviewTable } from '../../shared/preview-table/preview-table';
import { NotificationProviderDTO } from '../../../interfaces/notification-provider-dto';
import { Column } from '../../../interfaces/table-items';
import { environment } from '../../../../environments/environment.development';
import { SortValue } from '../../../interfaces/sorting';
import { FilterConfig, FilterValue } from '../../../interfaces/filters';
import { enumToOptions, getEnumLabel } from '../../../helper-functions/enum-helper';
import { NotificationType } from '../../../enums/notification-type';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { FilterItem } from '../../shared/filter-item/filter-item';
import { RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { EntityChangeService } from '../../../services/entity-change-service';
import { merge, takeUntil } from 'rxjs';

@Component({
  selector: 'app-notification-providers-table',
  imports: [TableModule, Button, FilterItem, RouterModule, DatePipe],
  templateUrl: './notification-providers-table.html',
  styleUrl: './notification-providers-table.scss',
})
export class NotificationProvidersTable extends PreviewTable<NotificationProviderDTO> implements OnInit {
  public createdByUserId = input<string | undefined>(undefined);
  private entityChangeService = inject(EntityChangeService);
  public override columns: Column[] = [
    {field: 'id', header: 'Id', sortable: true},
    {field: 'notificationType', header: 'Provider Type', sortable: true},
    {field: 'createDate', header: 'Create Date', sortable: true},
    {field: 'lastEdited', header: 'Last Edited', sortable: true},
    {field: 'createdByUsername', header: 'Created by', sortable: true}
  ]
  public override fetchUrl: string = [environment.api.uri, 'NotificationProviders', 'GetNotificationProviders'].join('/');
  public override defaultSort: SortValue[] = [
    {field: 'createDate', order: -1}
  ];
  public override filtersConfig: FilterConfig[] = [];
  public override filters = signal<Map<string, FilterValue> | undefined>(undefined);
  public notificationTypes = enumToOptions(NotificationType);
  public getEnumLabel = getEnumLabel;
  public notificationType = NotificationType;
  
  override ngOnInit(): void {
    super.ngOnInit();
    merge(this.entityChangeService.providerCreated, this.entityChangeService.providerEdited).pipe(takeUntil(this.destroy)).subscribe({
      next: () => {
        const event = this.viewItemsTable.createLazyLoadMetadata();
        this.loadPreviewData(event);
      }
    });
    this.initFilterInputs();
    this.configureFilters();
  }
  protected override initFilterInputs(): void {
    const filters: FilterValue[] = [];
    if(this.createdByUserId() !== undefined){
      const filter: FilterValue = {
        field: 'createdByUserId',
        value: this.createdByUserId(),
        operator: '==',
        type: 'text'
      }
      filters.push(filter);
    }
    if(filters.length > 0){
      this.filters.update(current => {
        const updated =  new Map(current);
        filters.forEach(filter => updated.set(filter.field, filter));
        return updated;
      });
    }
  }
  protected override configureFilters(): void {
    this.filtersConfig = [
      {field: 'id', type: 'numeric', isTableFilter: true, placeholder: 'Filter by Id'},
      {field: 'notificationType', type: 'multi-select', isTableFilter: true, placeholder: 'Filter by Provider Type', options: this.notificationTypes},
      {field: 'createDate', type: 'datetime', isTableFilter: true, placeholder: 'Filter by Create Date'},
      {field: 'lastEdited', type: 'datetime', isTableFilter: true, placeholder: 'Filter by Last Edited'},
      {field: 'createdByUsername', type: this.createdByUserId() === undefined ? 'text' : 'empty', isTableFilter: true, placeholder: 'Filter by Created By'},
    ];
  }
}
