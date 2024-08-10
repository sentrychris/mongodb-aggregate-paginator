import { Pagination } from "./Pagination";
import { Paginator } from "./Paginator";

/**
 * Index file for the mongoDB aggregate paginator module.
 *
 * Example usage:
 *
 * ```typescript
 * import { Paginator, Pagination } from 'mongodb-aggregate-paginator';
 *
 * // Use Paginator to paginate MongoDB aggregation results
 * const paginator = new Paginator(collection, pipeline, options);
 * const response: Pagination<MyDataType> = await paginator.paginate();
 * ```
 */
export type { Pagination };

export { Paginator };
