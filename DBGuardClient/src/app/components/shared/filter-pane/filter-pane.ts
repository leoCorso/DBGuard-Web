import { Component, inject, model, output, signal } from '@angular/core';
import { FilterConfig, FilterValue } from '../../../interfaces/filters';

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
}
