import { Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DataView, DataViewLazyLoadEvent } from 'primeng/dataview';
import { SortOption, SortValue } from '../../../interfaces/sorting';
import { PaginatedView } from '../paginated-view/paginated-view';

@Component({
  selector: 'app-paginated-data-view',
  imports: [],
  template: '',
  styles: '',
})
export abstract class PaginatedDataView<ViewType> extends PaginatedView<ViewType> {
  public abstract loadDataPage(event: DataViewLazyLoadEvent): void;

  public abstract sortControl: FormControl<SortValue | null>;
  public abstract sortOptions: SortOption[];

  @ViewChild('dataView') public dataView!: DataView;

  public filtersChanged(): void {
    const lazyLoadEvent = this.dataView.createLazyLoadMetadata();
    this.loadDataPage(lazyLoadEvent);
  }
}
