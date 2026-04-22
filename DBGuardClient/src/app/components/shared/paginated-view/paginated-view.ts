import { Component, inject, OnDestroy, OnInit, Signal, signal, WritableSignal } from '@angular/core';
import { BehaviorSubject, debounceTime, Subject, take, takeUntil } from 'rxjs';
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
export abstract class PaginatedView<ViewType> implements OnInit, OnDestroy {
  public dataItems = signal<ViewType[]>([]);
  public pageSize = signal<number>(5);
  public page = signal<number>(0);
  public totalItems = signal<number>(0);
  public totalPages = signal<number>(0);
  public pageSizeOptions = [5, 30, 50, 100];
  public loadingEvent = new BehaviorSubject<boolean>(true);
  public showSpinner = signal<boolean>(true);
  public errorState = signal<boolean>(false);
  protected destroy = new Subject<void>();
  public abstract filters: WritableSignal<Map<string, FilterValue> | undefined>;
  protected httpClient= inject(HttpClient);
  protected paramsBuilder = inject(ViewParamsBuilder);

  ngOnInit(): void {
    this.loadingEvent.pipe(debounceTime(500), takeUntil(this.destroy)).subscribe(loading => this.showSpinner.set(loading));
  }
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
