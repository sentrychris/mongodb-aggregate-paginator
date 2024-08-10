import type { Collection, Document } from "mongodb";
import { Paginator } from "../Paginator";

// Mock the MongoDB cursor and collection behavior
const mockCursor = {
  toArray: jest.fn(),
};
const mockCollection = {
  aggregate: jest.fn().mockReturnValue(mockCursor),
} as unknown as Collection<Document>;

describe("Paginator", () => {
  // Reset mocks after each test to ensure isolation
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with default values", () => {
    const paginator = new Paginator(mockCollection, []);

    expect(paginator["page"]).toBe(1);
    expect(paginator["limit"]).toBe(10);
    expect(paginator["query"]).toBe("");
    expect(paginator["url"]).toBe("");
  });

  it("should initialize with provided options", () => {
    // Test that the Paginator initializes correctly when custom options are provided
    const options = {
      page: 2,
      limit: 20,
      url: "/api/test",
      query: "status=active",
    };

    const paginator = new Paginator(mockCollection, [], options);

    expect(paginator["page"]).toBe(2);
    expect(paginator["limit"]).toBe(20);
    expect(paginator["url"]).toBe("/api/test");
    expect(paginator["query"]).toBe("status=active");
  });

  it("should return paginated data and metadata", async () => {
    // Mocking MongoDB to return 1 document and a total count of 1
    mockCursor.toArray
      .mockResolvedValueOnce([{ name: "test" }]) // First mock call for getData()
      .mockResolvedValueOnce([{ totalCount: 1 }]); // Second mock call for getTotalInfo()

    // Instantiate the Paginator with custom options
    const paginator = new Paginator(mockCollection, [], {
      page: 1,
      limit: 1,
      url: "/api/test",
    });
    const result = await paginator.paginate();

    // Verify that the returned pagination metadata and data are correct
    expect(result).toEqual({
      data: [{ name: "test" }],
      first_page_url: "/api/test?page=1",
      last_page_url: "/api/test?page=1",
      next_page_url: null,
      prev_page_url: null,
      path: "/api/test",
      per_page: 1,
      from: 1,
      to: 1,
      total: 1,
      current_page: 1,
      last_page: 1,
    });
  });

  it("should correctly modify the aggregation pipeline for pagination", async () => {
    // Mocking MongoDB to return 20 documents and a total count of 20
    mockCursor.toArray
      .mockResolvedValueOnce(new Array(20).fill({ test: "test" })) // First mock call for getData()
      .mockResolvedValueOnce([{ totalCount: 20 }]); // Second mock call for getTotalInfo()

    // Instantiate the Paginator with custom aggregation and options
    const paginator = new Paginator(mockCollection, [{ $match: { test: "test" } }], {
      page: 1,
      limit: 20,
    });
    await paginator.paginate();

    // Verify that the aggregation pipeline has been correctly modified for pagination
    expect(mockCollection.aggregate).toHaveBeenCalledWith([
      { $match: { test: "test" } },
      { $skip: 0 },
      { $limit: 20 },
    ]);
  });

  it("should correctly generate pagination URLs", async () => {
    // Mocking MongoDB to return 50 documents and a total count of 50
    mockCursor.toArray
      .mockResolvedValueOnce(new Array(50).fill({ test: "test" })) // First mock call for getData()
      .mockResolvedValueOnce([{ totalCount: 50 }]); // Second mock call for getTotalInfo()

    // Instantiate the Paginator with custom options
    const paginator = new Paginator(mockCollection, [{ $match: { test: "test" } }], {
      page: 1,
      limit: 10,
      url: "/api/test",
      query: "status=active",
    });

    const result = await paginator.paginate();

    // Verify that the pagination URLs and metadata are correctly generated
    expect(result.first_page_url).toBe("/api/test?status=active&page=1");
    expect(result.last_page_url).toBe("/api/test?status=active&page=5");
    expect(result.next_page_url).toBe("/api/test?status=active&page=2");
    expect(result.prev_page_url).toBeNull();
    expect(result.total).toBe(50);
    expect(result.to).toBe(10);
  });

  it("should handle edge cases for empty data", async () => {
    // Mocking MongoDB to return no documents and a total count of 0
    mockCursor.toArray
      .mockResolvedValueOnce([]) // First mock call for getData()
      .mockResolvedValueOnce([{ totalCount: 0 }]); // Second mock call for getTotalInfo()

    // Instantiate the Paginator with default options
    const paginator = new Paginator(mockCollection, [], {
      page: 1,
      limit: 10,
      url: "/api/test",
    });
    const result = await paginator.paginate();

    // Verify that the pagination metadata correctly handles the edge case of no data
    expect(result).toEqual({
      data: [],
      first_page_url: "/api/test?page=1",
      last_page_url: "/api/test?page=1",
      next_page_url: null,
      prev_page_url: null,
      path: "/api/test",
      per_page: 10,
      from: 0,
      to: 0,
      total: 0,
      current_page: 1,
      last_page: 1,
    });
  });
});
