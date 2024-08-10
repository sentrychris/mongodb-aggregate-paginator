# MongoDB Aggregate Paginator


[![CI Tests](https://github.com/sentrychris/mongodb-aggregate-paginator/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/sentrychris/mongodb-aggregate-paginator/actions/workflows/tests.yml)

A TypeScript utility class designed to help you paginate the results of mongodb aggregation queries easily. This paginator simplifies the process of managing large datasets by breaking them into manageable pages, which can be navigated using a set of automatically generated URLs.

## Features

- **Pagination of aggregated data**: Handles the pagination of complex mongodb aggregation queries.

- **Customizable page size**: You can define the number of items per page.

- **Automatic URL generation**: Generates URLs for the first, last, previous, and next pages based on the current query.

- **Projection support**: Allows for optional projection of the fields to include in the result set.

## Installation

You can install this paginator by adding it to your project:

```bash
npm install mongodb-aggregate-paginator
```

## Usage

### Basic Usage

To use this utility, import the paginator, and pass in your collection, your aggregation query pipeline, and your response options including pagination metadata and any field projections:

```typescript
import { MongoClient } from "mongodb";
import { Paginator } from "./Paginator";

async function run() {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();

  const collection = client.db("mydatabase").collection("mycollection");

  const pipeline = [
    { $match: { status: "active" } },
    { $group: { _id: "$category", count: { $sum: 1 } } }
  ];

  const options = {
    page: 1,
    limit: 10,
    url: "/api/data",
    query: "status=active",
    project: { _id: 0, category: 1, count: 1 }
  };

  const paginator = new Paginator(collection, pipeline, options);
  const response = await paginator.paginate();

  return response;
}
```

### Constructor Parameters

- `collection`: The mongodb collection to run the aggregation query on.
- `aggregation`: An array representing the aggregation pipeline stages.
- `options`: An optional object that can include the following:
  - `page`: The page number to retrieve (defaults to `1`).
  - `limit`: The number of items per page (defaults to `10`).
  - `url`: The base URL for pagination links.
  - `query`: An optional query string to include in pagination URLs.
  - `project`: An optional projection object to determine which fields to include in the results.

### Pagination Response

The `paginate()` method returns an object with the following structure:

```typescript
interface Pagination<T> {
  data: T[];
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  prev_page_url: string | null;
  path: string;
  per_page: number;
  from: number;
  to: number;
  total: number;
  current_page: number;
  last_page: number;
}
```

### Methods

- **paginate()**: Fetches the data and returns the paginated response.
- **getData()**: Fetches the data based on the aggregation query and pagination settings.
- **getTotalInfo()**: Calculates the total number of documents that match the aggregation pipeline.
- **getFirstPageUrl()**: Returns the URL for the first page.
- **getLastPageUrl(lastPage: number)**: Returns the URL for the last page.
- **getPreviousPageUrl()**: Returns the URL for the previous page, or `null` if on the first page.
- **getNextPageUrl(lastPage: number)**: Returns the URL for the next page, or `null` if on the last page.

Here’s another example of how to use the paginator:

```typescript
const paginator = new Paginator(
  // Get the collection
  await db.collection('users'),

  // Build the aggregate pipeline
  [
    { $match: { status: "active" } },
    { $sort: { created_at: -1 } }
  ],

  // Pass options
  {
    page: request.query.page ? request.query.page : 1,
    limit: request.query.limit ? request.query.limit : 10,
    url: `${process.env.APP_URL}/api/users`,
    project: {
      email: 1,
      updated_at: 1
    }
  });

const response = await paginator.paginate();
console.log(response);
```

## License

This project is licensed under the MIT License. Feel free to modify and distribute as needed.