export interface PagedResponse<T> {
    dataItems: T[],
    totalItems: number,
    totalPages: number,
    pageNumber: number,
    pageSize: number
}