import { Component, OnDestroy, OnInit, Signal, signal, ViewChild } from '@angular/core';
import { SortOption, SortValue } from '../../../interfaces/sorting';
import { FilterValue } from '../../../interfaces/filters';
import { FormControl } from '@angular/forms';
import { DataView, DataViewLazyLoadEvent } from 'primeng/dataview';
import { BehaviorSubject, debounceTime, Subject, takeUntil } from 'rxjs';
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
