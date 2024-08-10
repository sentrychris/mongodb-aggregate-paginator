/**
 * Represents a paginated response.
 *
 * The `Pagination` interface defines the structure of the response returned by the `Paginator`
 * class after processing an aggregation query in mongodb. It includes the data for the current
 * page, URLs for navigating to other pages, and metadata about the pagination, such as the current
 * page number, total items, and the range of items displayed on the current page.
 *
 * @template T - The type of the data items contained in the `data` array.
 */
export interface Pagination<T> {
  /** The array of data items for the current page */
  data: T[];

  /** URL to the first page */
  first_page_url: string;

  /** URL to the last page */
  last_page_url: string;

  /** URL to the next page, or null if there is no next page */
  next_page_url: string | null;

  /** URL to the previous page, or null if there is no previous page */
  prev_page_url: string | null;

  /** The base URL path for pagination links */
  path: string;

  /** Number of items per page */
  per_page: number;

  /** Index of the first item on the current page (1-based index) */
  from: number;

  /** Index of the last item on the current page (1-based index) */
  to: number;

  /** Total number of items across all pages */
  total: number;

  /** The current page number */
  current_page: number;

  /** The last available page number */
  last_page: number;
}

/**
 * Options for configuring the paginator.
 *
 * The `PaginationOptions` interface defines the optional parameters that can be passed to
 * the `Paginator` class to customize its behavior. These options allow you to specify the
 * current page, the number of items per page, filtering criteria through a query string,
 * and the projection of fields to include in the results.
 *
 * @template T - The type for the projection object, defining the fields to include in the
 *               result set.
 */
export interface PaginationOptions<T> {
  /** The current page number to fetch (optional) */
  page?: number;

  /** Number of items per page (optional) */
  limit?: number;

  /** Query string for filtering the data (optional) */
  query?: string;

  /** Base URL for pagination links */
  url?: string;

  /** Projection or fields to include in the data items (optional) */
  project?: T;
}
