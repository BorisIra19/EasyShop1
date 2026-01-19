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
export declare const paginate: <T extends Document>(model: Model<T>, query?: any, page?: number, limit?: number, sort?: string) => Promise<PaginationResult<T>>;
//# sourceMappingURL=pagination.d.ts.map