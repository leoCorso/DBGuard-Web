import { Component, inject, model, output, QueryList, signal, ViewChildren } from '@angular/core';
import { FilterConfig, FilterValue } from '../../../interfaces/filters';
import { FilterItem } from '../filter-item/filter-item';

@Component({
  selector: 'app-filter-pane',
  imports: [],
  template: '',
  styles: '',
})
export abstract class FilterPane {
  public abstract filtersConfig: FilterConfig[];
  public filters = model<Map<string, FilterValue>>();
  public filterChanged = output<void>();
  @ViewChildren(FilterItem) protected filterItems!: QueryList<FilterItem>;

  public onFilterValueChanged(filter: FilterValue): void {
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
    this.filterChanged.emit();
  }
  public clearFilters(): void {
    this.filters()?.clear();
    this.filterItems.forEach(filter => filter.initFilters());
    this.filterChanged.emit();
  }
}
