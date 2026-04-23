import { Component, ViewChild } from '@angular/core';
import { PaginatedView } from '../paginated-view/paginated-view';
import { Column } from '../../../interfaces/table-items';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { SortValue } from '../../../interfaces/sorting';
import { LazyLoadEvent } from 'primeng/api';
import { PagedResponse } from '../../../interfaces/request-response-dto';
import { FilterConfig, FilterValue } from '../../../interfaces/filters';

@Component({
  selector: 'app-preview-table',
  imports: [],
  template: '',
  styles: '',
})
export abstract class PreviewTable<ViewItem> extends PaginatedView<ViewItem> {
  public abstract columns: Column[];
  public abstract defaultSort: SortValue[];
  @ViewChild('previewTable') viewItemsTable!: Table;
  public abstract fetchUrl: string;
  public abstract filtersConfig: FilterConfig[];
  public filtersChanged(filter: FilterValue): void {
    const event = this.viewItemsTable.createLazyLoadMetadata();
    if(filter.value === '' || filter.value === null || filter.value.length === 0) {
      this.filters.update(filters => {
        const next = new Map(filters);
        next.delete(filter.field);
        return next;
      });
    }
    else {
      this.filters.update(filters => {
        const next = new Map(filters);
        next?.set(filter.field, filter);
        return next;
      });
    }
    this.loadPreviewData(event);
  }

  public loadPreviewData(event: TableLazyLoadEvent): void {
      this.loadingEvent.next(true);
      // Gather values
      this.page.update(() => {
        return Math.floor(event.first! / event.rows!) + 1;
      });
      const sortMeta = event.multiSortMeta;
      const filters = this.filters();
      const pageSize = event.rows;

      // Build params
      let params;

      if (filters) {
        const filterParams = this.paramsBuilder.addFilters(filters)
        if (filterParams) {
          params = filterParams;
        }
      }
      if (sortMeta) {
        const sortParams = this.paramsBuilder.addSorting(sortMeta, params);
        if (sortParams) {
          params = sortParams;
        }
      }
      if(pageSize) {
        params = this.paramsBuilder.addPagination(this.page(), pageSize, params);
      }
      // Call API
      this.httpClient.get<PagedResponse<ViewItem>>(this.fetchUrl, { params: params }).subscribe({
        next: (pagedResponse: PagedResponse<ViewItem>) => {
          this.page.set(pagedResponse.pageNumber);
          this.dataItems.set(pagedResponse.dataItems);
          this.totalPages.set(pagedResponse.totalPages);
          this.pageSize.set(pagedResponse.pageSize);
          this.totalItems.set(pagedResponse.totalItems);
          this.loadingEvent.next(false);
        },
        error: () => {
          this.loadingEvent.next(false);
        }
      }
      );
  }
  protected abstract configureFilters(): void;
}
