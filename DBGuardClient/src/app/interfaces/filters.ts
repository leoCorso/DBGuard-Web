export type FilterType = 'text' | 'select' | 'multi-select' | 'daterange' | 'datetime' | 'range' | 'trivalue' | 'numeric' | 'empty'; // Used to specify the filter type when creating a filter component
export interface FilterOperator { // Used for displaying filter selection type for strings and numbers
    operator: string,
    operatorLabel: string
}
export interface FilterConfig { // The config passed to filter component to generate filter
    field: string, // Key used to identify filter
    label: string, // Human readable label to display
    type: FilterType, // Type used to render input elements
    customOperator?: string, // Used when filter needs to use a custom filter on backend
    options?: any[], // Options list for select filters
    valueRange?: { startValue: number, endValue: number } // Range start, end for slider
    placeholder?: string,
    isTableFilter?: boolean
}
export interface FilterValue { // The value emitted from filter component and used by sieve params builder to build filter
    field: string,
    value: any | undefined,
    operator: string | undefined,
    type: FilterType
}
export interface SelectOption<T = number> {
  label: string;
  value: T;
}
export const DateFilterOperators: FilterOperator[] = [
    {operator: 'between', operatorLabel: 'Between'}
]
// List of filters
export const TextFilterOperators: FilterOperator[] = [
    {operator: '_=*', operatorLabel: 'Starts with'},
    {operator: '!_=*', operatorLabel: 'Not starts with'},
    {operator: '_-=*', operatorLabel: 'Ends with'},
    {operator: '-=*', operatorLabel: 'Not ends with'},
    {operator: '@=*', operatorLabel: 'Contains'},
    {operator: '!@=*', operatorLabel: 'Not contains'},
    {operator: '==*', operatorLabel: 'Equals'},
    {operator: '!=*', operatorLabel: 'Not equals'}
]
export const NumberFilterOperators: FilterOperator[] = [
    {operator: '!=', operatorLabel: 'Not equals'},
    {operator: '==', operatorLabel: 'Equals'},
    {operator: '>', operatorLabel: 'Greater than'},
    {operator: '>=', operatorLabel: 'Greater than or equal'},
    {operator: '<', operatorLabel: 'Less than'},
    {operator: '<=', operatorLabel: 'Less than or equal'},
]