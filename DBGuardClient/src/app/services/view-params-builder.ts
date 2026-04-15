import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FilterMetadata } from 'primeng/api';
import { FilterValue, SelectOption } from '../interfaces/filters';
import { SortValue } from '../interfaces/sorting';

@Injectable({
  providedIn: 'root',
})
export class ViewParamsBuilder {

  // Data
  private primengOperatorMap = new Map<string, string>();

  constructor() {
    this.primengOperatorMap.set('startsWith', '_=*');
    this.primengOperatorMap.set('contains', '@=*');
    this.primengOperatorMap.set('endsWith', '_-=*');
    this.primengOperatorMap.set('equals', '==');
    this.primengOperatorMap.set('notEquals', '!=*');
    this.primengOperatorMap.set('in', '=='); // Needs special handle since its just contains with ors
    this.primengOperatorMap.set('lt', '<');
    this.primengOperatorMap.set('lte', '<=');
    this.primengOperatorMap.set('gt', '>');
  }
  public addFilters(filters: Map<string, FilterValue>, params: HttpParams | null = null): HttpParams | undefined { // Add filter parameters
    if (filters.size === 0) {
      return params ? params : new HttpParams();
    }
    const filterQueryStrings: string[] = [];
    for (const [field, filterData] of filters.entries()) {
      let filterValue = filterData.value;
      let filterOperator = filterData.operator;
      switch(filterData.type){
        case 'daterange':
          filterValue = filterValue as Date[];
          const startDate = filterData.value[0] as Date;
          const endDate = filterData.value[1] as Date;
          const dateRange = `${field}>=${startDate.toISOString()},${field}<=${endDate.toISOString()}`;
          filterQueryStrings.push(dateRange);
          break;
        case 'datetime':
          filterValue = filterValue as Date;
          filterQueryStrings.push(`${field}${filterOperator}${filterValue.toISOString()}`);
          break;
        case 'multi-select':
          filterValue = filterValue as SelectOption[];
          filterValue = filterValue.map((val: SelectOption) => val.value).join('|');
          filterQueryStrings.push(`${filterOperator}==${filterValue}`);
          break;
        case 'trivalue':
          filterValue = filterValue as boolean;
          filterOperator = '==';
          filterQueryStrings.push(`${field}${filterOperator}${filterValue}`);
          break;
        case 'range':
          filterValue = filterValue as number[];
          const startValue = filterValue[0];
          const endValue = filterValue[1];
          const valueRange = `${field}>=${startValue},${field}<=${endValue}`;
          filterQueryStrings.push(valueRange);
          break;
        default:
          filterQueryStrings.push(`${field}${filterOperator}${filterValue}`);
          break;
          
      }
    }
    return params ? params.set('filters', filterQueryStrings.join(',')) : new HttpParams().set('filters', filterQueryStrings.join(','));
  }
  public addPagination(page: number, pageSize: number, params: HttpParams | null = null): HttpParams { // Add pagination parameters
    let paginationParams = new HttpParams();
    if (params) {
      paginationParams = params.set('page', page).set('pageSize', pageSize);
    }
    else {
      paginationParams = paginationParams.set('page', page).set('pageSize', pageSize);
    }
    return paginationParams;
  }
  public addSorting(sortValues: SortValue[], params: HttpParams | null = null): HttpParams { // Add sorting parameters
    const sortString = sortValues.map(sort => {
      return sort.order === -1 ? '-' + sort.field : sort.field;
    });
    return params ? params.set('sorts', sortString.join(',')) : new HttpParams().set('sorts', sortString.join(','));
  }
  private isMultipleFilters(value: FilterMetadata | FilterMetadata[]): value is FilterMetadata[] {
    return Array.isArray(value);
  }
}
