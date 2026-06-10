import { DatePipe } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { takeUntil } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { NotificationType } from '../../../../enums/notification-type';
import { enumToOptions, formatEnumKey, getEnumLabel } from '../../../../helpers/enum-helper';
import { FilterConfig, FilterValue } from '../../../../interfaces/filters';
import { NotificationTransactionDTO } from '../../../../interfaces/notification-dto';
import { SortValue } from '../../../../interfaces/sorting';
import { Column } from '../../../../interfaces/table-items';
import { EntityChangeService } from '../../../../services/entity-change-service';
import { FilterItem } from '../../../shared/filter-item/filter-item';
import { PreviewTable } from '../../../shared/preview-table/preview-table';

@Component({
  selector: 'app-guard-notification-transactions-table',
  imports: [TableModule, FilterItem, DatePipe, Tag, Button, RouterModule],
  templateUrl: './guard-notification-transactions-table.html',
  styleUrl: './guard-notification-transactions-table.scss',
})
export class GuardNotificationTransactionsTable extends PreviewTable<NotificationTransactionDTO> implements OnInit {
  public notificationTypes = enumToOptions(NotificationType);
  public guardId = input<number>();
  public guardChangeId = input<number>();
  public guardNotificationId = input<number>();

  public getEnumLabels = getEnumLabel;
  public formatEnumKey = formatEnumKey;
  private guardService = inject(EntityChangeService);
  public notificationType = NotificationType;

  public override columns: Column[] = [
    {field: 'id', header: 'Id', sortable: true},
    {field: 'timestamp', header: 'Timestamp', sortable: true},
    {field: 'guardId', header: 'GuardId', sortable: false},
    {field: 'guardNotificationId', header: 'Guard notification id', sortable: true},
    {field: 'notificationType', header: 'Notification type', sortable: true},
    {field: 'guardChangeTransactionId', header: 'Guard change transaction id', sortable: true},
    {field: 'successful', header: 'Status', sortable: true},
    {field: 'errorMessage', header: 'Error', sortable: true}
  ];
  public override defaultSort: SortValue[] = [
    {field: 'timestamp', order: -1}
  ];
  public override fetchUrl: string = [environment.api.uri, 'NotificationTransactions', 'GetNotificationTransactions'].join('/');
  public override filtersConfig: FilterConfig[] = [];
  public override filters = signal<Map<string, FilterValue> | undefined>(undefined);
  
  ngOnInit(): void {
    this.initFilterInputs();
    this.configureFilters();
    this.guardService.guardEdited.pipe(takeUntil(this.destroy)).subscribe({
      next: (guardId: number) => {
        if(this.guardId() == guardId){
          const event = this.viewItemsTable.createLazyLoadMetadata();
          this.loadPreviewData(event);
        }
      }
    })
  }
  protected override initFilterInputs(): void {
    let filter: FilterValue;
    if(this.guardId()){
      filter = {
        field: 'guardId',
        value: this.guardId(),
        operator: '==',
        type: 'numeric'
      };
      this.filters.update(filters => {
        const newFilters = new Map(filters);
        newFilters.set('guardId', filter);
        return newFilters;
      });
    }
    else if(this.guardChangeId()){
      filter = {
        field: 'guardChangeTransactionId',
        value: this.guardChangeId(),
        operator: '==',
        type: 'numeric'
      };
      this.filters.update(filters => {
        const newFilters = new Map(filters);
        newFilters.set('guardChangeTransactionId', filter);
        return newFilters;
      });
    }
    else if(this.guardNotificationId()){
      filter = {
        field: 'guardNotificationId',
        value: this.guardNotificationId(),
        operator: '==',
        type: 'numeric'
      };
      this.filters.update(filters => {
        const newFilters = new Map(filters);
        newFilters.set('guardNotificationId', filter);
        return newFilters;
      });
    }
  }
  protected override configureFilters(): void {
    this.filtersConfig = [
      {field: 'id', type: 'numeric', isTableFilter: true, placeholder: 'Filter by id'},
      {field: 'timestamp', type: 'datetime', isTableFilter: true, placeholder: 'Filter by create time'},
      {field: 'guardId', type: this.guardId() ? 'empty' : 'numeric', isTableFilter: true, placeholder: 'Filter by guard id'},
      {field: 'guardNotificationId', type: this.guardNotificationId() ? 'empty' : 'numeric', isTableFilter: true, placeholder: 'Filter by notification config id'},
      {field: 'notificationType', type: 'multi-select', isTableFilter: true, options: this.notificationTypes, placeholder: 'Filter by notification type'},
      {field: 'guardChangeTransactionId', type: this.guardChangeId() ? 'empty' : 'numeric', isTableFilter: true, placeholder: 'Filter by change transaction id'},
      {field: 'successful', type: 'trivalue', isTableFilter: true, options: [{label: 'Sent', value: true}, {label: 'Failed', value: false}]},
      {field: 'errorMessage', type: 'text', isTableFilter: true, placeholder: 'Filter by error message'}
    ];  
  }
}
