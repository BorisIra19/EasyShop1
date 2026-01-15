import { Model, Document } from 'mongoose';

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const paginate = async <T extends Document>(
  model: Model<T>,
  query: any = {},
  page: number = 1,
  limit: number = 10,
  sort: string = '-createdAt'
): Promise<PaginationResult<T>> => {
  const skip = (page - 1) * limit;
  const total = await model.countDocuments(query);
  const pages = Math.ceil(total / limit);

  const data = await model
    .find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages,
    },
  };
};
