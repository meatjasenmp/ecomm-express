export type QueryOptions = {
  page?: number;
  limit?: number;
  sort?: string;
  select?: string;
  populate?: string | string[];
};

export type PaginatedResult<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};
