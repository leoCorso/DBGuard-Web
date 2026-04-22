import { Component, inject, input, OnInit, signal, WritableSignal } from '@angular/core';
import { PreviewTable } from '../../../shared/preview-table/preview-table';
import { NotificationTransactionDTO } from '../../../../interfaces/notification-dto';
import { Column } from '../../../../interfaces/table-items';
import { SortValue } from '../../../../interfaces/sorting';
import { environment } from '../../../../../environments/environment.development';
import { FilterConfig, FilterValue } from '../../../../interfaces/filters';
import { enumToOptions, formatEnumKey, getEnumLabel } from '../../../../helper-functions/enum-helper';
import { NotificationType } from '../../../../enums/notification-type';
import { GuardDetailDTO, GuardView } from '../../../../interfaces/guard-dto';
import { TableModule } from 'primeng/table';
import { FilterItem } from '../../../shared/filter-item/filter-item';
import { DatePipe } from '@angular/common';
import { GuardService } from '../../../../services/guard-service';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-guard-notification-transactions-preview',
  imports: [TableModule, FilterItem, DatePipe],
  templateUrl: './guard-notification-transactions-preview.html',
  styleUrl: './guard-notification-transactions-preview.scss',
})
export class GuardNotificationTransactionsPreview extends PreviewTable<NotificationTransactionDTO> implements OnInit {
  public notificationTypes = enumToOptions(NotificationType);
  public guardId = input.required<number>();
  public getEnumLabels = getEnumLabel;
  public formatEnumKey = formatEnumKey;
  private guardService = inject(GuardService);
  public notificationType = NotificationType;

  public override columns: Column[] = [
    {field: 'id', header: 'Id', sortable: true},
    {field: 'timestamp', header: 'Timestamp', sortable: true},
    {field: 'guardId', header: 'GuardId', sortable: false},
    {field: 'guardNotificationId', header: 'Guard notification id', sortable: true},
    {field: 'notificationType', header: 'Notification type', sortable: true},
    {field: 'guardChangeTransactionId', header: 'Guard change transaction id', sortable: true}
  ];
  public override defaultSort: SortValue[] = [
    {field: 'timestamp', order: -1}
  ];
  public override fetchUrl: string = [environment.api.uri, 'NotificationTransactions', 'GetNotificationTransactions'].join('/');
  public override filtersConfig: FilterConfig[] = [
    {field: 'id', type: 'numeric', isTableFilter: true, placeholder: 'Filter by id'},
    {field: 'timestamp', type: 'datetime', isTableFilter: true, placeholder: 'Filter by create time'},
    {field: 'guardId', type: 'empty', isTableFilter: true},
    {field: 'guardNotificationId', type: 'numeric', isTableFilter: true, placeholder: 'Filter by notification config id'},
    {field: 'notificationType', type: 'multi-select', isTableFilter: true, options: this.notificationTypes, placeholder: 'Filter by notification type'},
    {field: 'guardChangeTransactionId', type: 'numeric', isTableFilter: true, placeholder: 'Filter by change transaction id'}
  ];
  public override filters = signal<Map<string, FilterValue> | undefined>(undefined);
  
  override ngOnInit(): void {
    super.ngOnInit();
    const filter: FilterValue = {
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
    this.guardService.guardEdited.pipe(takeUntil(this.destroy)).subscribe({
      next: (guardId: number) => {
        if(this.guardId() == guardId){
          const event = this.viewItemsTable.createLazyLoadMetadata();
          this.loadPreviewData(event);
        }
      }
    })
  }
}
