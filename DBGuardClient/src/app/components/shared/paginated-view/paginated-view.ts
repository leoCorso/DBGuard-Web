import { Component, Signal, signal, ViewChild } from '@angular/core';
import { SortOption, SortValue } from '../../../interfaces/sorting';
import { FilterValue } from '../../../interfaces/filters';
import { FormControl } from '@angular/forms';
import { DataView, DataViewLazyLoadEvent } from 'primeng/dataview';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-paginated-view',
  imports: [],
  template: '',
  styles: '',
})
export abstract class PaginatedView<ViewType> {
  public abstract loadDataPage(event: DataViewLazyLoadEvent): void;
  public dataItems = signal<ViewType[]>([]);
  public pageSize = signal<number>(5);
  public page = signal<number>(0);
  public totalItems = signal<number>(0);
  public totalPages = signal<number>(0);
  public pageSizeOptions = [5, 30, 50, 100];
  public loading = signal<boolean>(false);
  public abstract sortControl: FormControl<SortValue | null>;
  public abstract filters: Signal<Map<string, FilterValue>>;
  public abstract sortOptions: SortOption[];
  protected destroy = new Subject<void>();
  @ViewChild('dataView') public dataView!: DataView;
  public filtersChanged(): void {
    const lazyLoadEvent = this.dataView.createLazyLoadMetadata();
    this.loadDataPage(lazyLoadEvent);
  }
}
