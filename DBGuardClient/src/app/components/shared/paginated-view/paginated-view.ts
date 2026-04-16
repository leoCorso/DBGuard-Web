import { Component, inject, OnDestroy, Signal, signal } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { SortOption } from '../../../interfaces/sorting';
import { HttpClient } from '@angular/common/http';
import { FilterValue } from '../../../interfaces/filters';
import { ViewParamsBuilder } from '../../../services/view-params-builder';

@Component({
  selector: 'app-paginated-view',
  imports: [],
  template: '',
  styles: '',
})
export abstract class PaginatedView<ViewType> implements OnDestroy {
  public dataItems = signal<ViewType[]>([]);
  public pageSize = signal<number>(5);
  public page = signal<number>(0);
  public totalItems = signal<number>(0);
  public totalPages = signal<number>(0);
  public pageSizeOptions = [5, 30, 50, 100];
  public loadingEvent = new BehaviorSubject<boolean>(false);
  public showSpinner = signal<boolean>(false);
  public errorState = signal<boolean>(false);
  protected destroy = new Subject<void>();
  public abstract filters: Signal<Map<string, FilterValue> | undefined>;
  protected httpClient= inject(HttpClient);
  protected paramsBuilder = inject(ViewParamsBuilder);

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
