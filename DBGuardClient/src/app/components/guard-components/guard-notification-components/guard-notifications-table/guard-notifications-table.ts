import { Component, inject, input, OnInit, signal, WritableSignal } from '@angular/core';
import { PreviewTable } from '../../../shared/preview-table/preview-table';
import { Column } from '../../../../interfaces/table-items';
import { SortValue } from '../../../../interfaces/sorting';
import { environment } from '../../../../../environments/environment.development';
import { FilterConfig, FilterValue } from '../../../../interfaces/filters';
import { enumToOptions, formatEnumKey, getEnumLabel } from '../../../../helper-functions/enum-helper';
import { NotificationType } from '../../../../enums/notification-type';
import { GuardDetailDTO } from '../../../../interfaces/guard-dto';
import { TableModule } from 'primeng/table';
import { FilterItem } from '../../../shared/filter-item/filter-item';
import { DatePipe } from '@angular/common';
import { EntityChangeService } from '../../../../services/entity-change-service';
import { takeUntil } from 'rxjs';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { RouterLink, RouterModule } from "@angular/router";
import { GuardNotificationDTO } from '../../../../interfaces/notification-dto';

@Component({
  selector: 'app-guard-notifications-table',
  imports: [TableModule, FilterItem, DatePipe, Button, Tag, RouterLink, RouterModule],
  templateUrl: './guard-notifications-table.html',
  styleUrl: './guard-notifications-table.scss',
})
export class GuardNotificationsTable extends PreviewTable<GuardNotificationDTO> implements OnInit {
  public notificationTypes = enumToOptions(NotificationType);
  private guardService = inject(EntityChangeService);
  public notificationType = NotificationType;
  public formatEnumKey = formatEnumKey;
  public getEnumLabels = getEnumLabel;
  public override columns: Column[] = [
    {field: 'id', header: 'Id', sortable: true},
    {field: 'guardId', header: 'GuardId', sortable: false},
    {field: 'notificationType', header: 'Type', sortable: true},
    {field: 'createDate', header: 'Date created', sortable: true},
    {field: 'lastEdited', header: 'Last edited', sortable: true},
    {field: 'notificationProviderId', header: 'Notification provider', sortable: true},
    {field: 'createdbyUsername', header: 'Created by', sortable: true}
  ];
  public override defaultSort: SortValue[] = [
    {field: 'lastEdited', order: -1}
  ];
  public override fetchUrl: string = [environment.api.uri, 'Notifications', 'GetGuardNotifications'].join('/');
  public override filters = signal<Map<string, FilterValue> | undefined>(undefined);
  public guardId = input<number>();
  public providerId = input<number>();

  public override filtersConfig: FilterConfig[] = [];
  
  override ngOnInit(): void {
    super.ngOnInit();
    this.initFilterInputs();
    this.configureFilters();
  }
  protected override initFilterInputs(): void {
    let filter: FilterValue | null = null;
    if(this.guardId()){
      filter = {
        field: 'guardId',
        value: this.guardId(),
        operator: '==',
        type: 'numeric'
      };
    }
    if(this.providerId()){
      filter = {
        field: 'notificationProviderId',
        value: this.providerId(),
        operator: '==',
        type: 'numeric'
      }
    }
    if(filter){
      this.filters.update(filters => {
        const newFilter = new Map(filters);
        newFilter.set(filter.field, filter);
        return newFilter;
      });
    }
    this.guardService.guardEdited.pipe(takeUntil(this.destroy)).subscribe({
      next: (guardId: number) => {
        if(this.guardId() == guardId){
          const event = this.viewItemsTable.createLazyLoadMetadata();
          this.loadPreviewData(event);
        }
      }
    });
  }
  protected override configureFilters(): void {
    this.filtersConfig = [
      {field: 'id', type: 'numeric', placeholder: 'Filter by id', isTableFilter: true},
      {field:' guardId', type: this.guardId() ? 'empty' : 'numeric', isTableFilter: true, placeholder: 'Filter by guard id'},
      {field: 'notificationType', type: 'multi-select', isTableFilter: true, options: this.notificationTypes, placeholder: 'Filter by notification type'},
      {field: 'createDate', type: 'datetime', isTableFilter: true, placeholder: 'Filter by create date'},
      {field: 'lastEdited', type: 'datetime', isTableFilter: true, placeholder: 'Filter by last edited'},
      {field: 'notificationProviderId', type: this.providerId() ? 'empty': 'numeric', isTableFilter: true, placeholder: 'Filter by notification provider id'},
      {field: 'createdByUsername', type: 'text', isTableFilter: true, placeholder: 'Filter by creator username'}
    ];
  }
}
