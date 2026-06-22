import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { DataView, DataViewLazyLoadEvent } from 'primeng/dataview';
import { Drawer } from 'primeng/drawer';
import { ProgressSpinner } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { merge, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { withDelayedLoading } from '../../../custom-operators/delayed-loading';
import { FilterValue } from '../../../interfaces/filters';
import { GuardView } from '../../../interfaces/guard-dto';
import { PagedResponse } from '../../../interfaces/request-response-dto';
import { SortOption, SortValue } from '../../../interfaces/sorting';
import { EntityChangeService } from '../../../services/entity-change-service';
import { PaginatedDataView } from '../../shared/paginated-data-view/paginated-data-view';
import { SortSelectControl } from '../../shared/sort-select-control/sort-select-control';
import { GuardFilters } from '../guard-filters/guard-filters';
import { ViewGuardItem } from '../view-guard-item/view-guard-item';
import { Divider } from 'primeng/divider';
import { AnalyticsService } from '../../../services/analytics-service';

@Component({
  selector: 'app-view-guards-webpage',
  imports: [Drawer, GuardFilters, Button, TooltipModule, DataView, SortSelectControl, ReactiveFormsModule, ViewGuardItem, ProgressSpinner, Divider],
  templateUrl: './view-guards-webpage.html',
  styleUrl: './view-guards-webpage.scss',
})
export class ViewGuardsWebpage extends PaginatedDataView<GuardView> implements OnInit {
  public filterVisible = false;
  public override filters = signal<Map<string, FilterValue>>(new Map([]));
  private entityChangeService = inject(EntityChangeService);
  private analyticsService = inject(AnalyticsService);
  public override sortOptions: SortOption[] = [
    {field: 'guardName', label: 'Guard name'},
    {field: 'createDate', label: 'Create date'},
    {field: 'lastRun', label: 'Last run'},
    {field: 'userName', label: 'Created by'},
    {field: 'guardState', label: 'Guard state'},
    {field: 'isActive', label: 'Activation status'},
    {field: 'totalErrors', label: 'Total errors'},
    {field: 'totalTriggers', label: 'Total triggers'},
  ];
  public override sortControl = new FormControl<SortValue>({field: 'createDate', order: -1});

  ngOnInit(): void {
    merge(this.entityChangeService.guardCreated, this.entityChangeService.guardEdited).pipe(takeUntil(this.destroy)).subscribe({
      next: () => {
        const event = this.dataView.createLazyLoadMetadata();
        this.loadDataPage(event);
      }
    });
    
    this.sortControl.valueChanges.pipe(takeUntil(this.destroy)).subscribe((sort: SortValue | null) => {
      if(sort){
        const loadEvent = this.dataView.createLazyLoadMetadata();
        this.loadDataPage(loadEvent);
        this.analyticsService.logEvent("guard_sort", { sort_field: sort.field, sort_order: sort.order});
      }
    });
  }
  public toggleFilterVisibility(): void {
    this.filterVisible = !this.filterVisible;
    this.analyticsService.logEvent('guards_filter_toggle', { visible: this.filterVisible });
  }
  public loadDataPage(event: DataViewLazyLoadEvent): void {
    const url = [environment.api.uri, 'Guards', 'GetGuardsView'].join('/');
    this.page.update(() => Math.floor(event.first / event.rows) + 1);
    const sort = this.sortControl.value;
    const filters = this.filters();
    const pageSize = event.rows;
    let params;
    if(this.filters().size > 0 ){ // Apply filters
      const filterParams = this.paramsBuilder.addFilters(filters);
      if(filterParams) {
        params = filterParams;
      }
    }
    if(sort){
      const sortParams = this.paramsBuilder.addSorting([sort], params);
      if(sortParams){
        params = sortParams;
      }
    }
    if(pageSize){
      params = this.paramsBuilder.addPagination(this.page(), pageSize, params);
    }
    this.httpClient.get<PagedResponse<GuardView>>(url, { params: params }).pipe(withDelayedLoading((val) => this.showSpinner.set(val))).subscribe({
      next: (pagedResponse: PagedResponse<GuardView>) => {
        this.page.set(pagedResponse.pageNumber);
        this.dataItems.set(pagedResponse.dataItems);
        this.totalPages.set(pagedResponse.totalPages);
        this.totalItems.set(pagedResponse.totalItems);
        this.pageSize.set(pagedResponse.pageSize);
        this.errorState.set(false);
      },
      error: () => {
        this.errorState.set(true);
      }
    });
  }
  public guardsPaginated(): void {
    this.analyticsService.logEvent('guard_pagination', { page:  this.page(), page_size: this.pageSize()});
  }
}

