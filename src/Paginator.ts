import type { Collection, Document } from "mongodb";
import type { Pagination, PaginationOptions } from "./Pagination";

/**
 * MongoDB Aggregate Paginator.
 *
 * This class provides a utility for paginating the results of MongoDB aggregation queries. 
 * It simplifies the process of retrieving large datasets by dividing them into manageable 
 * pages and generating pagination metadata including URLs for navigating through pages.
 *
 * The paginator is highly customizable, allowing the user to specify options such as 
 * the page number, limit per page, query string, and projection of fields. It also 
 * handles the creation of pagination URLs (first, last, next, and previous pages) based 
 * on the provided URL and query parameters.
 *
 * Example usage:
 * 
 * ```typescript
 * const paginator = new Paginator(collection, pipeline, {
 *   page: 1,
 *   limit: 10,
 *   url: "/api/data",
 *   query: "status=active",
 *   project: { _id: 0, category: 1, count: 1 }
 * });
 * 
 * const paginatedResult = await paginator.paginate();
 * console.log(paginatedResult);
 * ```
 *
 * @template T - The type for the projection object, defining the shape of the projected
 *               fields.
 * @template D - The type for the resulting document data.
 */
export class Paginator<T, D> {
  /** Page number */
  protected page: number;

  /** Limit per page */
  protected limit: number;

  /** Query string */
  protected query = "";

  /** Pagination URL */
  protected url = "";

  /** Aggregate projection */
  protected project: T | undefined;

  /**
   * Create a new aggregate paginator.
   *
   * @param collection - the mongoDB collection
   * @param aggregation - the aggregation query
   * @param options - the pagination options
   */
  constructor(
    protected collection: Collection<Document>,
    protected aggregation: Array<Record<string, unknown>>,
    protected options?: PaginationOptions<T>,
  ) {
    this.page = options?.page ? options.page : 1;
    this.limit = options?.limit ? options.limit : 10;

    if (options?.url) {
      this.url = options.url;
    }

    if (options?.query) {
      this.query = options.query;
    }

    if (options?.project) {
      this.project = options.project;
    }
  }

  /**
   * Collect aggregate query results into a paginated response.
   *
   * @returns a promise containing the paginated document collection
   */
  async paginate(): Promise<Pagination<D>> {
    // fetch data + total count
    const data = (await this.getData()) as D[];

    const totalCount = data.length > 0 ? ((await this.getTotalInfo()) as number) : 0;
    const totalPages = totalCount > 0 ? Math.ceil(totalCount / this.limit) : 1;

    // construct meta
    const meta: Pagination<D> = {
      data,
      first_page_url: this.getFirstPageUrl(),
      last_page_url: this.getLastPageUrl(totalPages),
      next_page_url: this.getNextPageUrl(totalPages),
      prev_page_url: this.getPreviousPageUrl(),
      path: this.url,
      per_page: this.limit,
      from: totalCount > 0 ? (this.page === 1 ? 1 : (this.page - 1) * this.limit + 1) : 0,
      to: this.page === totalPages ? totalCount : this.page * this.limit,
      total: totalCount,
      current_page: this.page,
      last_page: totalPages,
    };

    return meta;
  }

  /**
   * Get the data from mongoDB.
   *
   * @returns a promise containing the document results
   */
  protected async getData(): Promise<Document[]> {
    const aggregation: Array<Record<string, unknown>> = [
      ...this.aggregation,
      { $skip: (this.page - 1) * this.limit },
      { $limit: this.limit },
    ];

    if (this.options?.project) {
      aggregation.push({
        $project: this.options?.project,
      });
    }

    return await this.collection.aggregate(aggregation).toArray();
  }

  /**
   * Get the total information for pagination.
   *
   * @returns metadata for pagination
   */
  protected async getTotalInfo() {
    const [{ totalCount }] = await this.collection
      .aggregate([...this.aggregation, { $count: "totalCount" }])
      .toArray();

    return totalCount;
  }

  /**
   * Get the first page URL.
   *
   * @returns the first page URL as a string
   */
  protected getFirstPageUrl(): string {
    return `${this.url}?${this.query ? this.query + "&" : ""}page=1`;
  }

  /**
   * Get the last page URL.
   *
   * @param lastPage - the number of the last page
   * @returns the last page URL as a string
   */
  protected getLastPageUrl(lastPage: number): string {
    return `${this.url}?${this.query ? this.query + "&" : ""}page=${lastPage}`;
  }

  /**
   * Get the previous page URL.
   *
   * @returns the previous page URL as a string or null if there is no previous page
   */
  protected getPreviousPageUrl(): string | null {
    if (this.page === 1) {
      return null;
    }
    return `${this.url}?${this.query ? this.query + "&" : ""}page=${this.page - 1}`;
  }

  /**
   * Get the next page URL.
   *
   * @param lastPage - the number of the last page.
   * @returns the next page URL as a string or null if there is no next page
   */
  protected getNextPageUrl(lastPage: number) {
    if (this.page === lastPage) {
      return null;
    }
    return `${this.url}?${this.query ? this.query + "&" : ""}page=${this.page + 1}`;
  }
}
