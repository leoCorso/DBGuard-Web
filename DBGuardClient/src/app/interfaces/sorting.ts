export interface SortOption { // Used for sort selection dropdowns
    field: string,
    label: string
}
export interface SortValue { // Used to build sort order for request
    field: string,
    order: number
}