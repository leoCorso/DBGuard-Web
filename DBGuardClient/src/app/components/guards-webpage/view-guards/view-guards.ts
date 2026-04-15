import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, effect, ElementRef, inject, input, model, OnInit, Signal, signal, ViewChild } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { FilterValue } from '../../../interfaces/filters';
import { Drawer } from 'primeng/drawer';
import { GuardFilters } from '../guard-filters/guard-filters';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatedView } from '../../shared/paginated-view/paginated-view';
import { GuardView } from '../../../interfaces/guard-dto';
import { SortOption, SortValue } from '../../../interfaces/sorting';
import { DataView, DataViewLazyLoadEvent } from 'primeng/dataview';
import { SortSelectControl } from '../../shared/sort-select-control/sort-select-control';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntil } from 'rxjs';
import { ViewParamsBuilder } from '../../../services/view-params-builder';
import { PagedResponse } from '../../../interfaces/request-response-dto';
import { ViewGuardItem } from './view-guard-item/view-guard-item';

@Component({
  selector: 'app-view-guards',
  imports: [Drawer,GuardFilters, Button, TooltipModule, DataView, SortSelectControl, ReactiveFormsModule, ViewGuardItem],
  templateUrl: './view-guards.html',
  styleUrl: './view-guards.scss',
})
export class ViewGuards extends PaginatedView<GuardView> implements OnInit {
  public filterVisible = false;
  private httpClient = inject(HttpClient);
  private paramsBuilder = inject(ViewParamsBuilder);

  public override filters = signal<Map<string, FilterValue>>(new Map([]));

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
    this.sortControl.valueChanges.pipe(takeUntil(this.destroy)).subscribe(() => {
      const loadEvent = this.dataView.createLazyLoadMetadata();
      this.loadDataPage(loadEvent);
    });
  }
  public toggleFilterVisibility(): void {
    this.filterVisible = !this.filterVisible;
  }
  public loadDataPage(event: DataViewLazyLoadEvent): void {
    this.loading.set(true);
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
    this.httpClient.get<PagedResponse<GuardView>>(url, { params: params }).subscribe({
      next: (pagedResponse: PagedResponse<GuardView>) => {
        this.page.set(pagedResponse.pageNumber);
        this.dataItems.set(pagedResponse.dataItems);
        this.totalPages.set(pagedResponse.totalPages);
        this.totalItems.set(pagedResponse.totalItems);
        this.pageSize.set(pagedResponse.pageSize);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}

